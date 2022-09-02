#include "common_auth.h"

void connect_cb_env_step1(EV_P, void *cb_data, DB_conn *conn);
bool connect_cb_env_step2(EV_P, void *cb_data, DB_result *res);
bool connect_cb_env_step3(EV_P, void *cb_data, DB_result *res);
bool connect_cb_env_step4(EV_P, void *cb_data, DB_result *res);

struct sock_ev_client_last_activity *find_last_activity(struct sock_ev_client *client) {
	SERROR_CHECK(client->str_cookie != NULL, "client->str_cookie is NULL!");
	LIST_FOREACH(_server.list_client_last_activity, first, next, node) {
		struct sock_ev_client_last_activity *client_last_activity = node->value;
		// The two things that need to be the same, are the ip and the cookie
		// (these are stored by the auth?action=login
		// request handler)
		if (client_last_activity != NULL) {
			SDEBUG("client_last_activity->str_client_ip = %s", client_last_activity->str_client_ip);
			SDEBUG("client_last_activity->str_cookie    = %s", client_last_activity->str_cookie);
		}
		if (
			client_last_activity != NULL
			&& (
				str_global_2fa_function != NULL
				|| strncmp(client_last_activity->str_client_ip, client->str_client_ip, strlen(client->str_client_ip)) == 0
			)
			&& strncmp(client_last_activity->str_cookie, client->str_cookie, strlen(client->str_cookie)) == 0
		) {
			client->client_last_activity = client_last_activity;
			List_push(client_last_activity->list_client, client);
			return client_last_activity;
		}
	}

error:
	return NULL;
}

bool add_last_activity(struct sock_ev_client *client) {
	struct sock_ev_client_last_activity *client_last_activity = NULL;
	size_t int_cookie_len = 0;
	SERROR_SALLOC(client_last_activity, sizeof(struct sock_ev_client_last_activity));
	SERROR_SALLOC(client_last_activity->str_client_ip, strlen(client->str_client_ip) + 1);
	client_last_activity->list_client = List_create();
	SERROR_CHECK(client_last_activity->list_client != NULL, "List_create failed!");
	memcpy(client_last_activity->str_client_ip, client->str_client_ip, strlen(client->str_client_ip));
	SERROR_SNCAT(
		client_last_activity->str_cookie, &int_cookie_len
		, client->str_cookie, strlen(client->str_cookie)
	);
	List_push(_server.list_client_last_activity, client_last_activity);
	client->client_last_activity = client_last_activity;
	List_push(client_last_activity->list_client, client);\
	client_last_activity->last_activity_time = ev_now(global_loop);
	return true;
error:
	return false;
}

// get connection string from cookie
DB_conn *set_cnxn(EV_P, struct sock_ev_client *client, connect_cb_t connect_cb) {
	char *str_response = NULL;
	size_t int_response_len = 0;
	SDEFINE_VAR_ALL(str_cookie_encrypted, str_cookie_decrypted, str_password, str_uri, str_temp);
	SDEFINE_VAR_MORE(str_username, str_uri_temp, str_context_data);
	SDEFINE_VAR_MORE(str_password_temp, str_password_hash, str_password_hash_temp, str_uri_ip_address, str_uri_host, str_uri_user_agent);
	client->bol_public = false;
	size_t int_temp = 0;
	size_t int_uri_length = 0;
	size_t int_user_length = 0;
	size_t int_password_length = 0;
	size_t int_cookie_len = 0;
	size_t int_host_len = 0;
	size_t int_user_agent_len = 0;
	size_t int_context_data_len = 0;
	size_t int_uri_ip_address_len = 0;
	size_t int_uri_host_len = 0;
	size_t int_uri_user_agent_len = 0;
	size_t int_temp_len = 0;
    DArray *darr_headers = NULL;

	str_uri_temp = str_uri_path(client->str_request, client->int_request_len, &int_uri_length);
	SFINISH_CHECK(str_uri_temp != NULL, "str_uri_path failed");
	if (strstr(str_uri_temp, "acceptnc_") != NULL) {
		char *ptr_dot = strstr(str_uri_temp, ".");
		if (
			(
				ptr_dot != NULL
				&& strncmp(ptr_dot + 1, "acceptnc_", 9) == 0
			)
			|| strncmp(str_uri_temp, "/env/acceptnc_", 14) == 0
		) {
			client->bol_public = true;
		}
	} else if (strstr(str_uri_temp, "actionnc_") != NULL) {
		char *ptr_dot = strstr(str_uri_temp, ".");
		if (
			(
				ptr_dot != NULL
				&& strncmp(ptr_dot + 1, "actionnc_", 9) == 0
			)
			|| strncmp(str_uri_temp, "/env/actionnc_", 14) == 0
		) {
			client->bol_public = true;
		}
	} else if (strstr(str_uri_temp, "cginc_") != NULL) {
		char *ptr_dot = strstr(str_uri_temp, ".");
		if (
			(
				ptr_dot != NULL
				&& strncmp(ptr_dot + 1, "cginc_", 6) == 0
			)
			|| strncmp(str_uri_temp, "/env/cginc_", 11) == 0
		) {
			client->bol_public = true;
		}
	}
	SDEBUG("client->bol_public: %s", client->bol_public ? "true" : "false");

	////DECRYPT
	str_cookie_encrypted = get_cookie(client->str_all_cookie, client->int_all_cookie_len, "envelope", &int_cookie_len);
	if (str_cookie_encrypted == NULL || int_cookie_len <= 0) {
		if (client->bol_handshake && strncmp(str_uri_temp, "/envnc", 6) == 0) {
			client->bol_public = true;
		} else if (client->bol_handshake) {
			SFINISH_CHECK(client->bol_public, "No Cookie. If you want to open a no-cookie websocket, use /envnc");
		} else {
			SFINISH_CHECK(client->bol_public, "No Cookie.");
		}
	}
	if (client->bol_public == false) {
		if (client->str_cookie == NULL && str_cookie_encrypted != NULL) {
			size_t int_temp = 0;
			SFINISH_SNCAT(
				client->str_cookie, &int_temp
				, str_cookie_encrypted, strlen(str_cookie_encrypted)
			);
			SDEBUG("%p->str_cookie: %p", client, client->str_cookie);
		}
		if (client->client_last_activity == NULL) {
			find_last_activity(client);
			// If we don't have it, we don't need it
		}

		// Check to see if the session has expired
		SDEBUG("int_global_login_timeout: %d", int_global_login_timeout);
		if (
			!(
				client->client_last_activity != NULL
				&& (
					int_global_login_timeout == 0
					|| (
						ev_now(EV_A) - client->client_last_activity->last_activity_time
					) < (double)int_global_login_timeout
				)
			)
		) {
			if (strstr(str_uri_temp, "acceptnc_") != NULL) {
				char *ptr_dot = strstr(str_uri_temp, ".");
				if (
					(
						ptr_dot != NULL
						&& strncmp(ptr_dot + 1, "acceptnc_", 9) == 0
					)
					|| strncmp(str_uri_temp, "/env/acceptnc_", 14) == 0
				) {
					client->bol_public = true;
				}
			} else if (strstr(str_uri_temp, "actionnc_") != NULL) {
				char *ptr_dot = strstr(str_uri_temp, ".");
				if (
					(
						ptr_dot != NULL
						&& strncmp(ptr_dot + 1, "actionnc_", 9) == 0
					)
					|| strncmp(str_uri_temp, "/env/actionnc_", 14) == 0
				) {
					client->bol_public = true;
				}
			}
			SFINISH_CHECK(client->bol_public, "Session expired");
		}

	}

	if (str_cookie_encrypted != NULL && strlen(str_cookie_encrypted) > 0) {
		str_cookie_decrypted = aes_decrypt(str_cookie_encrypted, &int_cookie_len);
		SFINISH_CHECK(str_cookie_decrypted != NULL, "aes_decrypt failed, %s", str_cookie_encrypted);
	}

	if (client->bol_public == false && int_cookie_len > 0) {
		// **** WARNING ****
		// DO NOT UNCOMMENT THE NEXT LINE! THAT WILL PUT THE FULL COOKIE IN THE CLEAR
		// IN THE LOG!!!!
		// SDEBUG("str_cookie_decrypted: >%s<", str_cookie_decrypted);
		// **** WARNING ****

		// sometimes the cookie decrypts without error but you get garbage back
		// I think this has something to do with the midnight key change?
		SFINISH_CHECK(strncmp(str_cookie_decrypted, "valid=true&", 11) == 0, "Session expired");
		
		////GET THINGS FOR CONNECTION STRING
		str_username = getpar(str_cookie_decrypted, "username", int_cookie_len, &int_user_length);
		SFINISH_CHECK(str_username != NULL, "getpar failed");
		//str_username = bstr_tolower(str_username, int_user_length);
	}
	SFINISH_CHECK(client->bol_public == true || int_cookie_len > 0, "must be a public request or have a cookie");

	// check Referer for sockets
	if (client->client_request_watcher) {
		SFINISH_CHECK((client->bol_public ? str_global_public_api_referer_list : str_global_api_referer_list)[0] == '*' || client->str_referer != NULL, "Referer header required for websockets");
		SFINISH_CHECK(check_referer(client->str_referer, client->int_referer_len, (client->bol_public ? str_global_public_api_referer_list : str_global_api_referer_list)), "Invalid Referer header");
	}

	if (client->bol_public) {
		SFREE(str_username);
		SFINISH_SNCAT(
			str_username, &client->int_username_len
			, str_global_public_username, strlen(str_global_public_username)
		);
		int_user_length = strlen(str_global_public_username);
		SINFO("str_username: %s", str_username);
	}

	if (client->str_username == NULL) {
		SFINISH_SNCAT(client->str_username, &client->int_username_len,
			str_username, strlen(str_username));
	}

	SFREE_PWORD(str_cookie_encrypted);


	SDEBUG("client->bol_public: %s", client->bol_public ? "true" : "false");
	if (client->bol_public == false) {
		str_password = getpar(str_cookie_decrypted, "password", int_cookie_len, &int_password_length);
		SFINISH_CHECK(str_password != NULL, "getpar failed");
		#ifdef ENVELOPE_INTERFACE_LIBPQ
		SFINISH_SNCAT(
			str_password_temp, &int_temp
			, str_password, int_password_length
			, client->str_username, client->int_username_len
		);
		SFINISH_SALLOC(str_password_hash_temp, 16);
		MD5((unsigned char *)str_password_temp, int_temp, (unsigned char *)str_password_hash_temp);
		SFREE_PWORD(str_password_temp);
		unsigned char *str_password_hash_temp2 = (unsigned char *)str_password_hash_temp;
		size_t int_len = 16;
		str_password_hash_temp = hexencode(str_password_hash_temp2, &int_len);
		SFREE(str_password_hash_temp2);
		SFINISH_CHECK(str_password_hash_temp != NULL, "hexencode failed");
		SFINISH_SNCAT(
			client->str_password_hash, &int_temp
			, "md5", (size_t)3
			, str_password_hash_temp, 32
		);
		#endif

	} else {
		SFINISH_SNCAT(
			str_password, &int_password_length
			, str_global_public_password, strlen(str_global_public_password)
		);
	}

	SFREE_PWORD(str_cookie_decrypted);

	// client_cb sometimes calls this function and doesn't need us to
	// connect to the database (because we are already connected)
	if (connect_cb != NULL) {
		str_uri_ip_address = snuri(client->str_client_ip, strlen(client->str_client_ip), &int_uri_ip_address_len);
		SFINISH_CHECK(str_uri_ip_address != NULL, "snuri failed on string \"%s\"", client->str_client_ip);

		str_uri_host = snuri((client->str_host != NULL ? client->str_host : ""), int_host_len, &int_uri_host_len);
		SFINISH_CHECK(str_uri_host != NULL, "snuri failed on string \"%s\"", (client->str_host != NULL ? client->str_host : ""));

		str_uri_user_agent = snuri((client->str_user_agent != NULL ? client->str_user_agent : ""), int_user_agent_len, &int_uri_user_agent_len);
		SFINISH_CHECK(str_uri_user_agent != NULL, "snuri failed on string \"%s\"", (client->str_user_agent != NULL ? client->str_user_agent : ""));

		SFINISH_SNCAT(
			str_context_data, &int_context_data_len
			, "request_ip_address=", (size_t)19
			, str_uri_ip_address, int_uri_ip_address_len
			, "&request_host=", (size_t)14
			, str_uri_host, int_uri_host_len
			, "&request_user_agent=", (size_t)20
			, str_uri_user_agent, int_uri_user_agent_len
		);

		SDEBUG("bol_global_set_user: %s", bol_global_set_user ? "true" : "false");
		if (bol_global_set_user) {
			// The only difference here is the callback and no user/pw
			SDEBUG("SET SESSION CONN");
			client->connect_cb = connect_cb;
			client->conn = DB_connect(
				EV_A, client, get_connection_info()
				, NULL, 0, NULL, 0
				, str_context_data, connect_cb_env_step1
			);
		} else {
			SDEBUG("NORMAL CONN");
			SDEBUG("str_username: >%s<", str_username);
			client->conn = DB_connect(
				EV_A, client, get_connection_info()
				, str_username, int_user_length, str_password, int_password_length
				, str_context_data, connect_cb
			);
		}
	}
	SFREE_PWORD(str_password);
	bol_error_state = false;
finish://|/usr/libexec/abrt-hook-ccpp %s %c %p %u %g %t e
    if (darr_headers != NULL) {
        DArray_clear_destroy(darr_headers);
    }
	if (str_response != NULL && client->bol_http &&
		(strstr(str_response, "\012Session expired") != NULL || strstr(str_response, "\012No Cookie") != NULL)) {
		SFREE(str_response);
		str_temp = str_uri_path(client->str_request, client->int_request_len, &int_uri_length);
		str_uri = snuri(str_temp, int_uri_length, &int_uri_length);
		SFREE(str_temp);

        SFINISH_SNFCAT(
			str_temp, &int_temp_len
            , "0; url=/index.html?error=Connection%20timed%20out&redirect=", (size_t)59
            , str_uri, int_uri_length
		);
		darr_headers = DArray_from_strings(
            "Set-Cookie", "envelope=; path=/; expires=Tue, 01 Jan 1990 00:00:00 GMT; HttpOnly"
            , "Refresh", str_temp
		);
		SFREE(str_temp);
        SFINISH_CHECK(darr_headers != NULL, "DArray_from_strings failed");
        SFINISH_CHECK(
			build_http_response(
                "440 Login Timeout"
                , "You need to login.\012", strlen("You need to login.\012")
                , "text/plain"
                , darr_headers
                , &client->str_http_response, &client->int_http_response_len
            )
			, "build_http_response failed"
		);
        DArray_clear_destroy(darr_headers);
        darr_headers = NULL;
        
	} else if (str_response != NULL && client->bol_handshake) {
		SFREE(str_response);
		char *str_response_temp = "You need to login.";
		SFINISH_SNCAT(
			str_response, &int_response_len
			, "\x03\xf3", (size_t)2 // close reason 1011
			, str_response_temp, int_response_len
		);
		WS_sendFrame(EV_A, client, true, 0x08, str_response, int_response_len);
		client->bol_is_open = false;
		SFREE(str_response);
	}
	SFREE_PWORD(str_cookie_encrypted);
	SFREE_PWORD(str_cookie_decrypted);
	SFREE_PWORD(str_password);
	SFREE(str_username);

	// For some reason SFREE_ALL segfaults without this
	str_cookie_encrypted = NULL;
	str_cookie_decrypted = NULL;
	str_password = NULL;

	SFREE_ALL();

    SFREE(str_response);
	if (client->str_http_response != NULL) {
		ev_io_stop(EV_A, &client->io);
		ev_io_init(&client->io, client_write_http_cb, client->io.fd, EV_WRITE);
        ev_io_start(EV_A, &client->io);
	}
	return client ? client->conn : NULL;
}

void connect_cb_env_step1(EV_P, void *cb_data, DB_conn *conn) {
	SDEBUG("connect_cb_env_step1");
	struct sock_ev_client *client = cb_data;
	char *str_response = NULL;
	size_t int_response_len = 0;
	size_t int_temp = 0;
	SDEFINE_VAR_ALL(str_password_temp, str_password_hash, str_password_hash_temp, str_password_hash_literal, str_user_literal, str_diag, str_temp, str_sql);

	SFINISH_CHECK(conn->int_status == 1, "%s", conn->str_response);

#ifdef ENVELOPE_INTERFACE_LIBPQ
	if (client->bol_public == false) {
		SFINISH_CHECK(client->str_password_hash != NULL, "password hash missing");
		str_password_hash_literal = DB_escape_literal(client->conn, client->str_password_hash, strlen(client->str_password_hash));
		SFINISH_CHECK(str_password_hash_literal != NULL, "DB_escape_literal failed");

		str_user_literal = DB_escape_literal(client->conn, client->str_username, client->int_username_len);
		SFINISH_CHECK(str_user_literal != NULL, "DB_escape_literal failed");
		char *str_temp1 = "SELECT CASE WHEN rolpassword = ";
		char *str_temp2 = " THEN 'TRUE' ELSE 'FALSE' END FROM pg_authid WHERE rolname = ";
		SFINISH_SNCAT(
			str_sql, &int_temp
			, str_temp1, strlen(str_temp1)
			, str_password_hash_literal, strlen(str_password_hash_literal)
			, str_temp2, strlen(str_temp2)
			, str_user_literal, strlen(str_user_literal)
			, ";", (size_t)1
		);
	} else {
		SFINISH_SNCAT(
			str_sql, &int_temp
			, "SELECT 'TRUE';", (size_t)14
		);
	}
#else
	SFINISH_SNCAT(
		str_sql, &int_temp
		, "SELECT 'TRUE';", (size_t)14
	);
#endif

	SFINISH_CHECK(query_is_safe(str_sql), "SQL Injection detected");
	SFINISH_CHECK(DB_exec(EV_A, conn, client, str_sql, connect_cb_env_step2), "DB_exec failed");

	bol_error_state = false;
finish:
	SFREE(conn->str_response);

	if (bol_error_state == true) {
		SFREE(conn->str_response);
		conn->str_response = str_response;
		conn->int_response_len = int_response_len;
		conn->int_status = -1;
		client->connect_cb(EV_A, client, conn);
	}
	SFREE_ALL();
}

bool connect_cb_env_step2(EV_P, void *cb_data, DB_result *res) {
	SDEBUG("connect_cb_env");
	struct sock_ev_client *client = cb_data;
	char *str_response = NULL;
	size_t int_temp = 0;
	size_t int_response_len = 0;
	DArray *arr_row_values = NULL;
	DArray *arr_row_lengths = NULL;
	DB_fetch_status status = 0;
	SDEFINE_VAR_ALL(str_user_ident, str_diag, str_sql);

	SFINISH_CHECK(res != NULL, "DB_exec failed");
	SFINISH_CHECK(res->status == DB_RES_TUPLES_OK, "DB_exec failed: %s", str_diag);

#ifdef ENVELOPE_INTERFACE_LIBPQ
	str_user_ident = DB_escape_identifier(client->conn, client->str_username, client->int_username_len);
	SFINISH_CHECK(str_user_ident != NULL, "DB_escape_identifier failed");
#else
	// SS uses a literal instead of an identifier
	size_t int_user_temp_len = 0;
	if (str_global_nt_domain[0] != 0 && client->bol_public == false) {
		SFINISH_SNCAT(
			str_user_ident, &int_user_temp_len
			, "'", (size_t)1
			, str_global_nt_domain, strlen(str_global_nt_domain)
			, "\\", (size_t)1
			, client->str_username, client->int_username_len
			, "'", (size_t)1
		);
	} else {
		SFINISH_SNCAT(
			str_user_ident, &int_user_temp_len
			, "'", (size_t)1
			, client->str_username, client->int_username_len
			, "'", (size_t)1
		);
	}
	SINFO("str_user_ident: %s", str_user_ident);
#endif

	status = DB_fetch_row(res);
	if (status == DB_FETCH_END) {
		SFINISH("User %s does not exist.", str_user_ident);
	} else {
		SFINISH_CHECK(status == DB_FETCH_OK, "DB_fetch_row failed");
		arr_row_values = DB_get_row_values(res);
		arr_row_lengths = DB_get_row_lengths(res);

		SFINISH_CHECK(strncmp(DArray_get(arr_row_values, 0), "TRUE", *(size_t *)DArray_get(arr_row_lengths, 0)) == 0, "You need to login.", str_user_ident);
		SFINISH_CHECK((status = DB_fetch_row(res)) == DB_FETCH_END, "DB_fetch_row failed");

		bol_error_state = false;
	}

#ifdef ENVELOPE_INTERFACE_LIBPQ
	char *str_temp1 = "SET SESSION AUTHORIZATION ";
#else
	// Permissions don't work if you do LOGIN
	char *str_temp1 = "EXECUTE AS USER = ";
#endif
	SFINISH_SNCAT(
		str_sql, &int_temp
		, str_temp1, strlen(str_temp1)
		, str_user_ident, strlen(str_user_ident)
		, ";", (size_t)1
	);

	SFINISH_CHECK(query_is_safe(str_sql), "SQL Injection detected");
#ifdef ENVELOPE_INTERFACE_LIBPQ
	SFINISH_CHECK(DB_exec(EV_A, client->conn, client, str_sql, connect_cb_env_step3), "DB_exec failed");
#else
	SFINISH_CHECK(DB_exec(EV_A, client->conn, client, str_sql, connect_cb_env_step4), "DB_exec failed");
#endif

	bol_error_state = false;
finish:
	DB_free_result(res);
	if (arr_row_values != NULL) {
		DArray_clear_destroy(arr_row_values);
	}
	if (arr_row_lengths != NULL) {
		DArray_clear_destroy(arr_row_lengths);
	}

	if (bol_error_state == true) {
		SFREE(client->conn->str_response);
		client->conn->str_response = str_response;
		client->conn->int_response_len = int_response_len;
		client->conn->int_status = -1;
		client->connect_cb(EV_A, client, client->conn);
	}
	bol_error_state = false;
	SFREE_ALL();
	return true;
}

bool connect_cb_env_step3(EV_P, void *cb_data, DB_result *res) {
	SDEBUG("connect_cb_env_step3");
	struct sock_ev_client *client = cb_data;
	char *str_response = NULL;
	size_t int_temp = 0;
	size_t int_response_len = 0;
	SDEFINE_VAR_ALL(str_diag, str_app, str_app_literal, str_sql);
	str_diag = DB_get_diagnostic(client->conn, res);

	SFINISH_CHECK(res != NULL, "DB_exec failed");
	SFINISH_CHECK(res->status == DB_RES_COMMAND_OK, "DB_exec failed: %s", str_diag);

	SFINISH_SNCAT(
		str_app, &int_temp
		, SUN_PROGRAM_WORD_NAME, strlen(SUN_PROGRAM_WORD_NAME)
		, " (", (size_t)2
		, client->str_username, client->int_username_len
		, ")", (size_t)1
	);

	str_app_literal = DB_escape_literal(client->conn, str_app, int_temp);
	SFINISH_CHECK(str_app_literal != NULL, "DB_escape_identifier failed");

	SFINISH_SNCAT(
		str_sql, &int_temp
		, "SET application_name = ", (size_t)23
		, str_app_literal, strlen(str_app_literal)
		, ";", (size_t)1
	);

	SFINISH_CHECK(query_is_safe(str_sql), "SQL Injection detected");
	SFINISH_CHECK(DB_exec(EV_A, client->conn, client, str_sql, connect_cb_env_step4), "DB_exec failed");

	bol_error_state = false;
finish:
	DB_free_result(res);
	if (bol_error_state == true) {
		SFREE(client->conn->str_response);
		client->conn->str_response = str_response;
		client->conn->int_response_len = int_response_len;
		client->conn->int_status = -1;
		client->connect_cb(EV_A, client, client->conn);
	}
	bol_error_state = false;
	SFREE_ALL();
	return true;
}

bool connect_cb_env_step4(EV_P, void *cb_data, DB_result *res) {
	SDEBUG("connect_cb_env_step4");
	struct sock_ev_client *client = cb_data;
	char *str_response = NULL;
    size_t int_response_len = 0;
	SDEFINE_VAR_ALL(str_diag);
	str_diag = DB_get_diagnostic(client->conn, res);

	SFINISH_CHECK(res != NULL, "DB_exec failed");
	SFINISH_CHECK(res->status == DB_RES_COMMAND_OK, "DB_exec failed: %s", str_diag);

	client->connect_cb(EV_A, client, client->conn);

	bol_error_state = false;
finish:
	DB_free_result(res);
	if (bol_error_state == true) {
		SFREE(client->conn->str_response);
		client->conn->str_response = str_response;
		client->conn->int_response_len = int_response_len;
		client->conn->int_status = -1;
		client->connect_cb(EV_A, client, client->conn);
	}
	bol_error_state = false;
	SFREE_ALL();
	return true;
}
