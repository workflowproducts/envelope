#include "common_auth.h"

#ifdef ENVELOPE
void connect_cb_env(EV_P, void *cb_data, DB_conn *conn);
bool connect_cb_env_step2(EV_P, void *cb_data, DB_result *res);
#endif

// get connection string from cookie
DB_conn *set_cnxn(struct sock_ev_client *client, connect_cb_t connect_cb) {
	char *str_response = NULL;
	SDEFINE_VAR_ALL(str_cookie_encrypted, str_cookie_decrypted, str_password, str_uri, str_temp, str_conn_index);
	SDEFINE_VAR_MORE(str_conn_debug, str_username, str_connname, str_database, str_uri_temp, str_context_data);
	SDEFINE_VAR_MORE(str_host, str_uri_ip_address, str_uri_host, str_user_agent, str_uri_user_agent);
	char *str_conn = NULL;
	ssize_t int_i = 0;
	ssize_t int_len = 0;
	size_t int_conn_index = 0;
#ifdef ENVELOPE
	client->bol_public = false;
#else
	size_t int_conn_index_len = 0;
#endif
	size_t int_uri_length = 0;
	size_t int_user_length = 0;
	size_t int_password_length = 0;
	size_t int_cookie_len = 0;
	size_t int_host_len = 0;
	size_t int_user_agent_len = 0;
	size_t int_response_len = 0;
	size_t int_context_data_len = 0;
	size_t int_uri_ip_address_len = 0;
	size_t int_uri_host_len = 0;
	size_t int_uri_user_agent_len = 0;
	ListNode *other_client_node = NULL;

	str_uri_temp = str_uri_path(client->str_request, client->int_request_len, &int_uri_length);
	SFINISH_CHECK(str_uri_temp != NULL, "str_uri_path failed");
#ifdef ENVELOPE
	if (strstr(str_uri_temp, "acceptnc_") != NULL) {
		char *ptr_dot = strstr(str_uri_temp, ".");
		if (
			(
				ptr_dot != NULL &&
				strncmp(ptr_dot + 1, "acceptnc_", 9) == 0
				) ||
			strncmp(str_uri_temp, "/env/acceptnc_", 14) == 0
			) {
			client->bol_public = true;
		}
	} else if (strstr(str_uri_temp, "actionnc_") != NULL) {
		char *ptr_dot = strstr(str_uri_temp, ".");
		if (
			(
				ptr_dot != NULL &&
				strncmp(ptr_dot + 1, "actionnc_", 9) == 0
				) ||
			strncmp(str_uri_temp, "/env/actionnc_", 14) == 0
			) {
			client->bol_public = true;
		}
	}
	SDEBUG("client->bol_public: %s", client->bol_public ? "true" : "false");
#else
	char *ptr_slash = strchr(str_uri_temp + 9, '/');
	SFINISH_CHECK(ptr_slash != NULL, "strchr failed!");
	*ptr_slash = 0;
	SFINISH_SNCAT(str_conn_index, &int_conn_index_len,
		str_uri_temp + 9, strlen(str_uri_temp + 9));
	int_conn_index = (size_t)strtol(str_conn_index, NULL, 10);
#endif

	////DECRYPT
	SDEBUG("client->str_cookie_name: %s", client->str_cookie_name);
	str_cookie_encrypted = str_cookie(client->str_request, client->int_request_len, client->str_cookie_name, &int_cookie_len);
	if (str_cookie_encrypted == NULL || int_cookie_len <= 0) {
#ifdef ENVELOPE
		if (client->bol_handshake) {
			client->bol_public = true;
		}
		SFINISH_CHECK(client->bol_public, "No Cookie.");
#else
		SFINISH("No Cookie.");
#endif
	}
#ifdef ENVELOPE
	if (client->bol_public == false) {
#endif
		// Make sure we have the last close time
		if (client->int_last_activity_i == -1) {
			// If we don't, then find it
			for (int_i = 0, int_len = (ssize_t)DArray_end(client->server->arr_client_last_activity); int_i < int_len; int_i += 1) {
				struct sock_ev_client_last_activity *client_last_activity =
					(struct sock_ev_client_last_activity *)DArray_get(client->server->arr_client_last_activity, (size_t)int_i);
				// The two things that need to be the same, are the ip and the cookie
				// (these are stored by the auth?action=login
				// request handler)
				if (client_last_activity != NULL &&
					strncmp(client_last_activity->str_client_ip, client->str_client_ip, INET_ADDRSTRLEN) == 0 &&
					strncmp(client_last_activity->str_cookie, str_cookie_encrypted, int_cookie_len) == 0) {
					client->int_last_activity_i = int_i;
					break;
				}
			}
			// If we don't have it, we don't need it
		}

		// Find another client from the same place/cookie
		LIST_FOREACH(client->server->list_client, first, next, node) {
			struct sock_ev_client *other_client = node->value;
			SDEBUG("other_client                        = %p", other_client);
			SDEBUG("other_client->node                  = %p", other_client->node);
			SDEBUG("client->node                        = %p", client->node);
			SDEBUG("other_client->int_last_activity_i   = %d", other_client->int_last_activity_i);
			SDEBUG("client->int_last_activity_i         = %d", client->int_last_activity_i);
			if (other_client != NULL && client->node != other_client->node &&
				client->int_last_activity_i == other_client->int_last_activity_i) {
				other_client_node = node;
				break;
			}
		}

		SDEBUG("List_count(client->server->list_client)   = %d", List_count(client->server->list_client));
		SDEBUG("client->server->arr_client_last_activity  = %p", client->server->arr_client_last_activity);
		SDEBUG("client->int_last_activity_i               = %d", client->int_last_activity_i);
		SDEBUG("other_client_node                         = %p", other_client_node);

		// Grab the last close time if we have it
		struct sock_ev_client_last_activity *client_last_activity = NULL;
		if (client->int_last_activity_i != -1) {
			client_last_activity = (struct sock_ev_client_last_activity *)DArray_get(
				client->server->arr_client_last_activity, (size_t)client->int_last_activity_i);

			SDEBUG(" ev_now(global_loop)                                            : %f", ev_now(global_loop));
			SDEBUG("                       client_last_activity->last_activity_time : %f", client_last_activity->last_activity_time);
			SDEBUG("(ev_now(global_loop) - client_last_activity->last_activity_time): %f", (ev_now(global_loop) - client_last_activity->last_activity_time));
		}
		// Grab the other client if we have it
		struct sock_ev_client *other_client = NULL;
		SDEBUG("other_client_node = %p", other_client_node);
		if (other_client_node != NULL) {
			other_client = other_client_node->value;
		}
		// Check to see if we have another client, if we don't check to see if the
		// session has expired
		SDEBUG("int_global_login_timeout: %d", int_global_login_timeout);
		if (
			!(
				(
					other_client != NULL &&
					other_client->conn != NULL
				) ||
				(
					client->int_last_activity_i != -1 &&
					(
						int_global_login_timeout == 0 ||
						(
							ev_now(global_loop) - client_last_activity->last_activity_time
						) < int_global_login_timeout
					)
				)
			)
		) {
#ifdef ENVELOPE
			if (strstr(str_uri_temp, "acceptnc_") != NULL) {
				char *ptr_dot = strstr(str_uri_temp, ".");
				if (
					(
						ptr_dot != NULL &&
						strncmp(ptr_dot + 1, "acceptnc_", 9) == 0
					) ||
					strncmp(str_uri_temp, "/env/acceptnc_", 14) == 0
				) {
					client->bol_public = true;
				}
			} else if (strstr(str_uri_temp, "actionnc_") != NULL) {
				char *ptr_dot = strstr(str_uri_temp, ".");
				if (
					(
						ptr_dot != NULL &&
						strncmp(ptr_dot + 1, "actionnc_", 9) == 0
					) ||
					strncmp(str_uri_temp, "/env/actionnc_", 14) == 0
				) {
					client->bol_public = true;
				}
			}
			SFINISH_CHECK(client->bol_public, "Session expired");
#else
			SFINISH("Session expired");
#endif
		}

		str_cookie_decrypted = aes_decrypt(str_cookie_encrypted, &int_cookie_len);

		// **** WARNING ****
		// DO NOT UNCOMMENT THE NEXT LINE! THAT WILL PUT THE FULL COOKIE IN THE CLEAR
		// IN THE LOG!!!!
		// SDEBUG("str_cookie_decrypted: >%s<", str_cookie_decrypted);
		// **** WARNING ****

		SFINISH_CHECK(str_cookie_decrypted != NULL, "aes_decrypt failed");
		SFINISH_CHECK(strncmp(str_cookie_decrypted, "valid=true&", 11) == 0, "Session expired");

		////GET THINGS FOR CONNECTION STRING
		str_username = getpar(str_cookie_decrypted, "username", int_cookie_len, &int_user_length);
		SFINISH_CHECK(str_username != NULL, "getpar failed");
		//str_username = bstr_tolower(str_username, int_user_length);

		str_database = getpar(str_cookie_decrypted, "dbname", int_cookie_len, &client->int_database_len);
		SFINISH_CHECK(str_database != NULL, "getpar failed");
		//str_database = bstr_tolower(str_database, client->int_database_len);
		SNOTICE("REQUEST USERNAME: %s", str_username);
		if (str_database[0] == 0) {
			SFREE(str_database);
		}
		if (str_database != NULL) {
			SNOTICE("REQUEST DATABASE: %s", str_database);
		}

#ifdef ENVELOPE
	} //this closing brace connects to a bol_public check, which only exists in envelope
#endif

#ifdef ENVELOPE
	if (client->bol_public) {
		SFREE(str_username);
		SFINISH_SNCAT(str_username, &client->int_username_len,
			str_global_public_username, strlen(str_global_public_username));
		int_user_length = strlen(str_global_public_username);
		SINFO("str_username: %s", str_username);
	}

	SFINISH_SNCAT(str_connname, &client->int_connname_len,
		"", (size_t)0);
#else
	str_connname = getpar(str_cookie_decrypted, "connname", int_cookie_len, &client->int_connname_len);
	SFINISH_CHECK(str_connname != NULL, "getpar failed");
	str_conn = getpar(str_cookie_decrypted, "conn", int_cookie_len, &client->int_conn_len);
	if (str_conn != NULL && str_conn[0] == 0) {
		SFREE(str_conn);
	}
	SDEBUG("str_conn: %s", str_conn);
#endif

	if (client->str_connname == NULL) {
		SFINISH_SNCAT(
			client->str_connname, &client->int_connname_len,
			str_connname, client->int_connname_len
		);

		SFINISH_SNCAT(
			client->str_connname_folder, &client->int_connname_folder_len,
			client->str_connname, client->int_connname_len
		);

		if (str_database != NULL) {
			SFINISH_SNFCAT(
				client->str_connname_folder, &client->int_connname_folder_len,
				"_", (size_t)1,
				str_database, client->int_database_len
			);
		}
		if (str_conn != NULL) {
			SFINISH_SNFCAT(
				client->str_connname_folder, &client->int_connname_folder_len,
				"_", (size_t)1,
				str_conn, client->int_conn_len
			);
		}
		size_t int_i = 0, int_len = strlen(client->str_connname_folder);
		while (int_i < int_len) {
			if (!isalnum(client->str_connname_folder[int_i])) {
				client->str_connname_folder[int_i] = '_';
			}

			int_i++;
		}
	}
	if (client->str_username == NULL) {
		SFINISH_SNCAT(client->str_username, &client->int_username_len,
			str_username, strlen(str_username));
	}
	if (client->str_database == NULL) {
		SFINISH_SNCAT(client->str_database, &client->int_database_len,
			str_database, client->int_database_len);
	}
	if (str_conn != NULL && client->str_conn == NULL) {
		SFINISH_SNCAT(client->str_conn, &client->int_conn_len,
			str_conn, strlen(str_conn));
	}
	SFREE(str_conn);
	if (client->str_cookie == NULL && str_cookie_encrypted != NULL) {
		size_t int_temp = 0;
		SFINISH_SNCAT(client->str_cookie, &int_temp,
			str_cookie_encrypted, strlen(str_cookie_encrypted));
		SDEBUG("%p->str_cookie: %p", client, client->str_cookie);
	}

	SFREE_PWORD(str_cookie_encrypted);

#ifdef ENVELOPE
#else
	if (bol_global_allow_custom_connections == false) {
		SFINISH_CHECK(client->str_conn == NULL,
			"Cannot specify a custom connection string with current configuration,"
			"if you wish to do this, change allow_custom_connections to true and "
			"restart " SUN_PROGRAM_LOWER_NAME "");
	}
#endif

#ifdef ENVELOPE
	SDEBUG("client->bol_public: %s", client->bol_public ? "true" : "false");
	if (client->bol_public == false) {
		str_password = getpar(str_cookie_decrypted, "password", int_cookie_len, &int_password_length);
		SFINISH_CHECK(str_password != NULL, "getpar failed");

	} else {
		SFINISH_SNCAT(str_password, &int_password_length,
			str_global_public_password, strlen(str_global_public_password));
		//SINFO("str_password: %s", str_password);
	}
#else
	SDEBUG("client->str_conn: %s", client->str_conn);
	SDEBUG("str_connname: %s", str_connname);
	SDEBUG("str_database: %s", str_database);

	str_password = getpar(str_cookie_decrypted, "password", int_cookie_len, &int_password_length);
	SFINISH_CHECK(str_password != NULL, "getpar failed");
#endif


	SFINISH_CHECK(
		client->str_conn != NULL || exists_connection_info(str_connname), "There is no connection info with that name.");

	////ASSEMBLE CONNECTION STRING
	if (client->str_conn != NULL) {
#ifdef POSTAGE_INTERFACE_LIBPQ
		if (str_database != NULL) {
			SFINISH_SNCAT(str_conn, &client->int_conn_len,
				client->str_conn, strlen(client->str_conn),
				" dbname=", (size_t)8,
				str_database, client->int_database_len);
		} else {
			SFINISH_SNCAT(str_conn, &client->int_conn_len,
				client->str_conn, strlen(client->str_conn));
		}
#else
		SFINISH_SNCAT(str_conn, &client->int_conn_len,
			client->str_conn, strlen(client->str_conn));
#endif
	} else {
#ifdef POSTAGE_INTERFACE_LIBPQ
		if (str_database != NULL) {
			SFINISH_SNCAT(str_conn, &client->int_conn_len,
				get_connection_info(str_connname, NULL), strlen(get_connection_info(str_connname, NULL)),
				" dbname=", (size_t)8,
				str_database, client->int_database_len);
		} else {
			SFINISH_SNCAT(str_conn, &client->int_conn_len,
				get_connection_info(str_connname, NULL), strlen(get_connection_info(str_connname, NULL)));
		}
#else
		SFINISH_SNCAT(str_conn, &client->int_conn_len,
			get_connection_info(str_connname, NULL), strlen(get_connection_info(str_connname, NULL)));
#endif
	}

	SFREE_PWORD(str_cookie_decrypted);

	// client_cb sometimes calls this function and doesn't expect need us to
	// connect to the database (because we are already connected)
	if (connect_cb != NULL) {
		str_uri_ip_address = snuri(client->str_client_ip, strlen(client->str_client_ip), &int_uri_ip_address_len);
		SFINISH_CHECK(str_uri_ip_address != NULL, "snuri failed on string \"%s\"", client->str_client_ip);

		str_host = request_header(client->str_request, client->int_request_len, "Host", &int_host_len);
		if (str_host == NULL) {
			SFINISH_SNCAT(
				str_host, &int_host_len,
				"", (size_t)0
			);
		}
		str_uri_host = snuri(str_host, int_host_len, &int_uri_host_len);
		SFINISH_CHECK(str_uri_host != NULL, "snuri failed on string \"%s\"", str_host);

		str_user_agent = request_header(client->str_request, client->int_request_len, "User-Agent", &int_user_agent_len);
		if (str_user_agent == NULL) {
			SFINISH_SNCAT(
				str_user_agent, &int_user_agent_len,
				"", (size_t)0
			);
		}
		str_uri_user_agent = snuri(str_user_agent, int_user_agent_len, &int_uri_user_agent_len);
		SFINISH_CHECK(str_uri_user_agent != NULL, "snuri failed on string \"%s\"", str_user_agent);

#ifdef ENVELOPE
		SFINISH_SNCAT(str_context_data, &int_context_data_len,
			"request_ip_address=", (size_t)19,
			str_uri_ip_address, int_uri_ip_address_len,
			"&request_host=", (size_t)14,
			str_uri_host, int_uri_host_len,
			"&request_user_agent=", (size_t)20,
			str_uri_user_agent, int_uri_user_agent_len
		);
#else
		SFINISH_SNCAT(str_context_data, &int_context_data_len, "", (size_t)0);
#endif

#if defined(ENVELOPE) && defined(POSTAGE_INTERFACE_LIBPQ)
		SDEBUG("bol_global_set_user: %s", bol_global_set_user ? "true" : "false");
		if (bol_global_set_user) {
			// The only difference here is the callback and no user/pw
			SDEBUG("SET SESSION CONN");
			client->connect_cb = connect_cb;
			client->conn = DB_connect(global_loop, client, str_conn,
				NULL, 0, NULL, 0,
				str_context_data, connect_cb_env);
		} else {
#endif
			SDEBUG("NORMAL CONN");
			client->conn = DB_connect(global_loop, client, str_conn,
				str_username, int_user_length, str_password, int_password_length,
				str_context_data, connect_cb);
#if defined(ENVELOPE) && defined(POSTAGE_INTERFACE_LIBPQ)
		}
#endif
	}
	SFREE_PWORD(str_password);
	bol_error_state = false;
finish:
	if (str_response != NULL &&
		(strstr(str_response, "\012Session expired") != NULL || strstr(str_response, "\012No Cookie") != NULL)) {
		SFREE(str_response);
		str_temp = str_uri_path(client->str_request, client->int_request_len, &int_uri_length);
		str_uri = snuri(str_temp, int_uri_length, &int_uri_length);
		SFREE(str_temp);
		struct struct_connection *conn_info = DArray_get(darr_global_connection, int_conn_index);

		SFINISH_SNCAT(str_response, &int_response_len,
			"HTTP/1.1 440 Login Timeout\015\012"
			"Server: " SUN_PROGRAM_LOWER_NAME "\015\012"
			"Connection: close\015\012"
			"Set-Cookie: ",
			strlen(
				"HTTP/1.1 440 Login Timeout\015\012"
				"Server: " SUN_PROGRAM_LOWER_NAME "\015\012"
			"Connection: close\015\012"
				"Set-Cookie: "
			),
			client->str_cookie_name, strlen(client->str_cookie_name),
			"=; path=/; expires=Tue, 01 Jan 1990 00:00:00 GMT", (size_t)48,
			bol_tls ? "; secure" : "", strlen(bol_tls ? "; secure" : ""),
			"; HttpOnly\015\012", (size_t)12
		);
		if (conn_info != NULL) {
#ifdef ENVELOPE
			SFINISH_SNFCAT(str_response, &int_response_len,
				"Refresh: 0; url=/index.html?error=Connection%20timed%20out&redirect=", (size_t)68,
				str_uri, strlen(str_uri),
				"\015\012\015\012", (size_t)4);
#else
			size_t int_temp_len = 0;
			str_temp = snuri(conn_info->str_connection_name, strlen(conn_info->str_connection_name), &int_temp_len);
			SFINISH_SNFCAT(str_response, &int_response_len,
				"Refresh: 0; url=/postage/index.html?error=Connection%20timed%20out&connection=", (size_t)78,
				str_temp, int_temp_len,
				"&redirect=", (size_t)10,
				str_uri, int_uri_length,
				"\015\012\015\012", (size_t)4);
			SFREE(str_temp);
#endif
		} else {
#ifdef ENVELOPE
			SFINISH_SNFCAT(str_response, &int_response_len,
				"Refresh: 0; url=/index.html\015\012\015\012", (size_t)31);
#else
			SFINISH_SNFCAT(str_response, &int_response_len,
				"Refresh: 0; url=/postage/index.html\015\012\015\012", (size_t)39);
#endif
		}
		SFINISH_SNFCAT(str_response, &int_response_len,
			"You need to login.\012", (size_t)19);
	}
	SFREE_PWORD(str_cookie_encrypted);
	SFREE_PWORD(str_cookie_decrypted);
	SFREE_PWORD(str_password);
	SFREE_PWORD(str_conn);
	SFREE(str_conn_debug);
	SFREE(str_username);
	SFREE(str_conn);

	// For some reason SFREE_ALL segfaults without this
	str_cookie_encrypted = NULL;
	str_cookie_decrypted = NULL;
	str_password = NULL;
	str_conn = NULL;

	SFREE_ALL();

	if (str_response != NULL) {
		if ((int_len = client_write(client, str_response, strlen(str_response))) < 0) {
			SERROR_NORESPONSE("client_write() failed");
			SFINISH_CLIENT_CLOSE(client);
		}
		SFREE_PWORD(str_response);
	}
	bol_error_state = false;
	return client ? client->conn : NULL;
}

#ifdef ENVELOPE

void connect_cb_env(EV_P, void *cb_data, DB_conn *conn) {
	SDEBUG("connect_cb_env");
	struct sock_ev_client *client = cb_data;
	char *str_response = NULL;
	size_t int_temp = 0;
	SDEFINE_VAR_ALL(str_user_ident, str_diag, str_sql);

	SFINISH_CHECK(conn->int_status == 1, "%s", conn->str_response);

	str_user_ident = DB_escape_identifier(client->conn, client->str_username, client->int_username_len);
	SFINISH_CHECK(str_user_ident != NULL, "DB_escape_identifier failed");

	char *str_temp1 = "SET SESSION AUTHORIZATION ";
	SFINISH_SNCAT(
		str_sql, &int_temp,
		str_temp1, strlen(str_temp1),
		str_user_ident, strlen(str_user_ident),
		";", (size_t)1
	);

	SFINISH_CHECK(query_is_safe(str_sql), "SQL Injection detected");
	SFINISH_CHECK(DB_exec(EV_A, client->conn, client, str_sql, connect_cb_env_step2), "DB_exec failed");

	bol_error_state = false;
finish:
	if (bol_error_state == true) {
		SFREE(conn->str_response);
		conn->str_response = str_response;
		conn->int_status = -1;
		client->connect_cb(EV_A, client, conn);
	}
	bol_error_state = false;
	SFREE_ALL();
}

bool connect_cb_env_step2(EV_P, void *cb_data, DB_result *res) {
	SDEBUG("connect_cb_env_step2");
	struct sock_ev_client *client = cb_data;
	char *str_response = NULL;
	SDEFINE_VAR_ALL(str_diag);
	str_diag = DB_get_diagnostic(client->conn, res);

	SFINISH_CHECK(res != NULL, "DB_exec failed");
	SFINISH_CHECK(res->status == DB_RES_COMMAND_OK, "DB_exec failed: %s", str_diag);

	client->connect_cb(EV_A, client, client->conn);

finish:
	DB_free_result(res);
	if (bol_error_state == true) {
		SFREE(client->conn->str_response);
		client->conn->str_response = str_response;
		client->conn->int_status = -1;
		client->connect_cb(EV_A, client, client->conn);
	}
	bol_error_state = false;
	SFREE_ALL();
	return true;
}
#endif
