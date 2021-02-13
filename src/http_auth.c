#include "http_auth.h"

extern DB_conn *log_queries_over_conn;

// response with redirect
void http_auth(EV_P, struct sock_ev_client_auth *client_auth) {
	char *str_response = NULL;
	size_t int_response_len = 0;
	char *str_session_id_temp = NULL;
	SDEFINE_VAR_ALL(str_form_data, str_expires);
	SDEFINE_VAR_MORE(str_uri_expires, str_cookie_decrypted);
	SDEFINE_VAR_MORE(str_escape_password, str_conn, str_conn_debug, str_body);
	SDEFINE_VAR_MORE(str_email_error, str_user_literal, str_sql);
	SDEFINE_VAR_MORE(str_expiration, str_referer, str_temp);
	SDEFINE_VAR_MORE(str_uri_new_password, str_uri_expiration);
	SDEFINE_VAR_MORE(str_new_cookie, str_user_quote, str_new_password_literal);
	SDEFINE_VAR_MORE(str_uri_timeout, str_one_day_expire, str_cookie_name, str_session_id);
	SDEFINE_VAR_MORE(str_error, str_error_uri, str_uri, str_token_real, str_token_user);
    DArray *darr_headers = NULL;
	size_t int_error_len = 0;
	size_t int_error_uri_len = 0;
#ifndef ENVELOPE_INTERFACE_LIBPQ
	LPSTR strErrorText = NULL;
#endif
	char *ptr_end_uri = NULL;
	size_t int_temp_len = 0;
	size_t int_uri_len = 0;
	size_t int_query_length = 0;
	size_t int_action_length = 0;
	size_t int_expiration_len = 0;
	size_t int_cookie_len = 0;
	size_t int_uri_new_password_len = 0;
	size_t int_uri_expiration_len = 0;
	size_t int_conn_length = 0;
	size_t int_token_real_len = 0;
	size_t int_token_user_len = 0;

	// get path
	str_uri = str_uri_path(client_auth->parent->str_request, client_auth->parent->int_request_len, &int_uri_len);
	SFINISH_CHECK(str_uri, "str_uri_path failed");

	ptr_end_uri = strchr(str_uri, '?');
	if (ptr_end_uri != NULL) {
		*ptr_end_uri = '\0';
		int_uri_len = (size_t)(ptr_end_uri - str_uri);
	}
	ptr_end_uri = strchr(str_uri, '#');
	if (ptr_end_uri != NULL) {
		*ptr_end_uri = '\0';
		int_uri_len = (size_t)(ptr_end_uri - str_uri);
	}
	struct sock_ev_client_request *client_request =
		create_request(client_auth->parent, NULL, NULL, NULL, NULL, 0, ENVELOPE_REQ_AUTH, NULL);
	SFINISH_CHECK(client_request != NULL, "Could not create request data!");
	client_request->client_request_data = (struct sock_ev_client_request_data *)client_auth;
	client_auth->self.free = http_auth_free;
	client_auth->parent->cur_request = client_request;

	SFINISH_SALLOC(str_session_id_temp, 32);
	SFINISH_CHECK(RAND_bytes((unsigned char *)str_session_id_temp, 32), "RAND_bytes failed");
	size_t int_len = 32;
	str_session_id = hexencode((unsigned char *)str_session_id_temp, &int_len);
	SFINISH_CHECK(str_session_id != NULL, "hexencode failed");

	char str_buf[101] = {0};
	memcpy(str_buf, client_auth->parent->str_request, 100);
	SDEBUG("str_buf: %s", str_buf);

	// get form data
	str_form_data = query(client_auth->parent->str_request, client_auth->parent->int_request_len, &int_query_length);
	SFINISH_CHECK(str_form_data != NULL, "str_query failed");

	client_auth->str_action = getpar(str_form_data, "action", int_query_length, &int_action_length);
	SFINISH_CHECK(client_auth->str_action != NULL, "getpar failed");

	SDEBUG("client_auth->str_action: %s", client_auth->str_action);

	// LOGGING IN, SET COOKIE
	if (strncmp(client_auth->str_action, "login", 6) == 0) {
		SINFO("REQUEST TYPE: envelope LOGIN");
		if (strncmp(str_uri, "/env/authnc", 12) == 0 || strncmp(str_uri, "/env/authnc/", 13) == 0) {
			SFINISH_SNCAT(client_auth->str_user, &client_auth->int_user_length, str_global_public_username, strlen(str_global_public_username));
			SFINISH_SNCAT(client_auth->str_password, &client_auth->int_password_length, str_global_public_password, strlen(str_global_public_password));

			str_uri_new_password = snuri(client_auth->str_user, client_auth->int_user_length, &int_uri_new_password_len);
			SFINISH_CHECK(str_uri_new_password != NULL, "snuri failed!");

			SFINISH_SNFCAT(
				str_form_data, &int_query_length,
				"&username=", (size_t)10,
				str_uri_new_password, int_uri_new_password_len
			);
			SFREE(str_uri_new_password);

			str_uri_new_password = snuri(client_auth->str_password, client_auth->int_password_length, &int_uri_new_password_len);
			SFINISH_CHECK(str_uri_new_password != NULL, "snuri failed!");

			SFINISH_SNFCAT(
				str_form_data, &int_query_length,
				"&password=", (size_t)10,
				str_uri_new_password, int_uri_new_password_len
			);
			SFREE(str_uri_new_password);

		} else {
			client_auth->str_user = getpar(str_form_data, "username", int_query_length, &client_auth->int_user_length);
#ifdef ENVELOPE_ODBC
			if (strncmp(str_global_mode, "msaccess", 9) != 0) {
				SFINISH_CHECK(client_auth->str_user != NULL && client_auth->int_user_length > 0, "no username");
			}
#else
			SFINISH_CHECK(client_auth->str_user != NULL && client_auth->int_user_length > 0, "no username");
#endif
			//bstr_tolower(client_auth->str_user, client_auth->int_user_length);
			//SFINISH_CHECK(client_auth->str_user != NULL, "str_tolower(client_auth->str_user) failed");

			SINFO("REQUEST USERNAME: %s", client_auth->str_user);

			client_auth->str_password = getpar(str_form_data, "password", int_query_length, &client_auth->int_password_length);
			// The reason this was removed is because libpq will give an error if a password is required
			//#ifdef ENVELOPE_ODBC
			//		if (strncmp(str_global_mode, "msaccess", 9) != 0) {
			//			SFINISH_CHECK(client_auth->str_password != NULL && client_auth->int_password_length > 0, "no password");
			//		}
			//#else
			//		SFINISH_CHECK(client_auth->str_password != NULL && client_auth->int_password_length > 0, "no password");
			//#endif

			SFINISH_CHECK(bstrstr(client_auth->str_user, client_auth->int_user_length, ";", 1) == NULL, "no semi-colons allowed");
			SFINISH_CHECK(
				bstrstr(client_auth->str_password, client_auth->int_password_length, ";", 1) == NULL, "no semi-colons allowed");
		}

		// cookie expiration
		str_one_day_expire = str_global_2fa_function != NULL ? str_expire_100_year() : str_expire_one_day();
		SFINISH_CHECK(str_one_day_expire != NULL, "str_expire_one_day failed");
		size_t int_uri_expires_len = 0;
		str_uri_expires = snuri(str_one_day_expire, strlen(str_one_day_expire), &int_uri_expires_len);
		SDEBUG("int_uri_expires_len; %zu", int_uri_expires_len);
		SDEBUG("strlen(str_uri_expires); %zu", strlen(str_uri_expires));
		SDEBUG("str_one_day_expire; %s", str_one_day_expire);
		SDEBUG("str_uri_expires; %s", str_uri_expires);
		SFREE(str_one_day_expire);
		SFINISH_CHECK(str_uri_expires != NULL, "snuri failed");

		SFINISH_SNCAT(
			str_cookie_decrypted, &int_cookie_len,
			"valid=true&", (size_t)11,
			str_form_data, int_query_length,
			"&sessionid=", (size_t)11,
			str_session_id, strlen(str_session_id)
		);

		// COOKIE TIMEOUT INIT
		SFINISH_SALLOC(str_uri_timeout, 50);
		time_t time_current1 = time(&time_current1) + 3600;
		sprintf(str_uri_timeout, "%ld", (long)time_current1);

		SDEBUG("str_uri_timeout: %s", str_uri_timeout);

		SFINISH_SNFCAT(str_cookie_decrypted, &int_cookie_len, "&timeout=", (size_t)9, str_uri_timeout, strlen(str_uri_timeout));
		SFREE(str_uri_timeout);

		// encrypt
		SFREE(str_uri_expires);
		SFREE_PWORD(str_form_data);
		client_auth->int_cookie_encrypted_len = int_cookie_len;
		client_auth->str_cookie_encrypted = aes_encrypt(str_cookie_decrypted, &client_auth->int_cookie_encrypted_len);
		SFREE_PWORD(str_cookie_decrypted);
		SFINISH_CHECK(client_auth->str_cookie_encrypted, "failed to encrypt cookie");
		// done encrypting

		if (strncmp(str_uri, "/env/authnc", 12) == 0 || strncmp(str_uri, "/env/authnc/", 13) == 0) {
			char *str_temp1 =
				"envelope=";
			char *str_temp2 =
				"; HttpOnly;";
			SFREE(str_expires);
			str_expires = str_global_2fa_function != NULL ? str_expire_100_year() : str_expire_one_day();
			SFINISH_SNCAT(
				str_temp, &int_temp_len,
				str_temp1, strlen(str_temp1),
				client_auth->str_cookie_encrypted, client_auth->int_cookie_encrypted_len,
				"; path=/; expires=", (size_t)18,
				str_expires, strlen(str_expires),
				str_temp2, strlen(str_temp2)
			);
            darr_headers = DArray_from_strings(
                "Set-Cookie", str_temp
            );
            SFINISH_CHECK(darr_headers != NULL, "DArray_from_strings failed");
            SFINISH_CHECK(build_http_response(
                    "200 OK"
                    , "{\"stat\": true, \"dat\": \"/env/app/all/index.html\"}", strlen("{\"stat\": true, \"dat\": \"/env/app/all/index.html\"}")
                    , "application/json"
                    , darr_headers
                    , &client_auth->parent->str_http_response, &client_auth->parent->int_http_response_len
                ), "build_http_response failed");

			struct sock_ev_client *client = client_auth->parent;
			size_t int_i, int_len;
			client->int_last_activity_i = -1;
			struct sock_ev_client_last_activity *client_last_activity;
			for (int_i = 0, int_len = DArray_end(client->server->arr_client_last_activity); int_i < int_len; int_i += 1) {
				client_last_activity =
					(struct sock_ev_client_last_activity *)DArray_get(client->server->arr_client_last_activity, int_i);
				if (client_last_activity != NULL &&
					(
						str_global_2fa_function != NULL
						|| strncmp(client_last_activity->str_client_ip, client->str_client_ip, strlen(client->str_client_ip)) == 0
					) &&
					strncmp(client_last_activity->str_cookie, client_auth->str_cookie_encrypted,
						client_auth->int_cookie_encrypted_len) == 0) {
					client->int_last_activity_i = (ssize_t)int_i;
					break;
				}
			}
			if (client->int_last_activity_i == -1) {
				size_t int_temp;
				SFINISH_SALLOC(client_last_activity, sizeof(struct sock_ev_client_last_activity));
				SFINISH_SALLOC(client_last_activity->str_client_ip, strlen(client_auth->parent->str_client_ip));
				memcpy(client_last_activity->str_client_ip, client_auth->parent->str_client_ip, strlen(client_auth->parent->str_client_ip));
				SFINISH_SNCAT(client_last_activity->str_cookie, &int_temp, client_auth->str_cookie_encrypted, client_auth->int_cookie_encrypted_len);
				client_last_activity->last_activity_time = ev_now(EV_A);
				client_auth->parent->int_last_activity_i =
					(ssize_t)DArray_push(client_auth->parent->server->arr_client_last_activity, client_last_activity);
			}
			SDEBUG("envelope COOKIE SET");

		} else {
			char *str_temp = get_connection_info("", &client_auth->int_connection_index);
			size_t int_temp = strlen(str_temp);
			SFINISH_SNCAT(str_conn, &int_conn_length, str_temp, int_temp);

			SFINISH_SALLOC(client_auth->str_int_connection_index, 20);
			snprintf(client_auth->str_int_connection_index, 20, "%zu", client_auth->int_connection_index);

			SDEBUG("client_auth: %p", client_auth);
			SDEBUG("client_auth->parent: %p", client_auth->parent);
			SDEBUG("str_conn: %s", str_conn);


#ifdef ENVELOPE_INTERFACE_LIBPQ
			SDEBUG("bol_global_set_user: %s", bol_global_set_user ? "true" : "false");
			if (bol_global_set_user) {
				// The only difference here is the callback and no user/pw
				SFINISH_CHECK((client_auth->parent->conn = DB_connect(EV_A, client_auth, str_conn, NULL,
					0, NULL, 0, "",
					http_auth_login_step15)) != NULL,
					"DB_connect failed");
			} else {
				SFINISH_CHECK((client_auth->parent->conn = DB_connect(EV_A, client_auth, str_conn, client_auth->str_user,
					client_auth->int_user_length, client_auth->str_password, client_auth->int_password_length, "",
					http_auth_login_step2)) != NULL,
					"DB_connect failed");
			}
#else
			SDEBUG("bol_global_set_user: %s", bol_global_set_user ? "true" : "false");
			if (bol_global_set_user) {
				HANDLE hToken = NULL;
				int ret = LogonUserA(client_auth->str_user, str_global_nt_domain, client_auth->str_password, LOGON32_LOGON_NETWORK, LOGON32_PROVIDER_DEFAULT, &hToken);

				if (ret == 0) {
					int int_err = GetLastError();
					FormatMessageA(FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_IGNORE_INSERTS, NULL, int_err,
						MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT), (LPSTR)&strErrorText, 0, NULL);
					SFINISH("Login failed: %s", strErrorText);
				}
				CloseHandle(hToken);

				SFINISH_CHECK((client_auth->parent->conn = DB_connect(EV_A, client_auth, str_conn, NULL,
					0, NULL, 0, "",
					http_auth_login_step15)) != NULL,
					"DB_connect failed");

			} else {
				SFINISH_CHECK((client_auth->parent->conn = DB_connect(EV_A, client_auth, str_conn, client_auth->str_user,
					client_auth->int_user_length, client_auth->str_password, client_auth->int_password_length, "",
					http_auth_login_step2)) != NULL,
					"DB_connect failed");
			}
#endif

			SDEBUG("client_auth: %p", client_auth);
			SDEBUG("client_auth->parent: %p", client_auth->parent);
		}

	} else if (strncmp(client_auth->str_action, "2fa", 10) == 0) {
		client_auth->str_cookie_encrypted = get_cookie(client_auth->parent->str_all_cookie, client_auth->parent->int_all_cookie_len, "envelope_2fa_pending", &client_auth->int_cookie_encrypted_len);
		SFINISH_CHECK(client_auth->str_cookie_encrypted != NULL, "str_cookie failed");
		int_cookie_len = client_auth->int_cookie_encrypted_len;
		str_cookie_decrypted = aes_decrypt(client_auth->str_cookie_encrypted, &int_cookie_len);
		SFREE(client_auth->str_cookie_encrypted);

		client_auth->str_cookie_encrypted = getpar(str_cookie_decrypted, "cookie", int_cookie_len, &client_auth->int_cookie_encrypted_len);
		SFINISH_CHECK(client_auth->str_cookie_encrypted != NULL, "getpar failed");

		str_token_real = getpar(str_cookie_decrypted, "token", int_cookie_len, &int_token_real_len);
		SFINISH_CHECK(str_token_real != NULL, "getpar failed");

		str_token_user = getpar(str_form_data, "token", int_query_length, &int_token_user_len);
		SFINISH_CHECK(str_token_user != NULL, "getpar failed");
		SFREE(str_global_error);

		SFINISH_CHECK(strncmp(str_token_real, str_token_user, int_token_user_len) == 0, "Token does not match");
		
        char *str_temp1 = "envelope=";
        char *str_temp2 = "; HttpOnly;";
        char *str_temp3 = "{\"stat\": true, \"dat\": \"/env/app/all/index.html\"}";
        SFREE(str_expires);
        str_expires = str_global_2fa_function != NULL ? str_expire_100_year() : str_expire_one_day();
        SFINISH_SNCAT(
            str_temp, &int_temp_len,
            str_temp1, strlen(str_temp1),
            client_auth->str_cookie_encrypted, client_auth->int_cookie_encrypted_len,
            "; path=/; expires=", (size_t)18,
            str_expires, strlen(str_expires),
            str_temp2, strlen(str_temp2)
        );
        darr_headers = DArray_from_strings(
            "Set-Cookie", str_temp
            , "Set-Cookie", "envelope_2fa_pending=; HttpOnly; path=/; expires=0;"
        );
		SFREE(str_temp);
        SFINISH_CHECK(darr_headers != NULL, "DArray_from_strings failed");
        SFINISH_CHECK(build_http_response(
                "200 OK"
                , str_temp3, strlen(str_temp3)
                , "application/json"
                , darr_headers
                , &client_auth->parent->str_http_response, &client_auth->parent->int_http_response_len
            ), "build_http_response failed");

		//////
		// CHANGE PW, RESET COOKIE
	} else if (strncmp(client_auth->str_action, "change_pw", 10) == 0) {
		SINFO("REQUEST TYPE: PASSWORD CHANGE");
		client_auth->str_new_password =
			getpar(str_form_data, "password_new", int_query_length, &client_auth->int_new_password_length);
		SFINISH_CHECK(client_auth->str_new_password != NULL, "getpar failed");
		client_auth->str_old_check_password =
			getpar(str_form_data, "password_old", int_query_length, &client_auth->int_old_check_password_length);
		SFINISH_CHECK(client_auth->str_old_check_password != NULL, "getpar failed");

		SDEBUG("client_auth->parent->str_request: %s", client_auth->parent->str_request);

		SFREE_PWORD(str_form_data);
		client_auth->str_cookie_encrypted = get_cookie(client_auth->parent->str_all_cookie, client_auth->parent->int_all_cookie_len, "envelope", &client_auth->int_cookie_encrypted_len);
		SFINISH_CHECK(client_auth->str_cookie_encrypted != NULL, "str_cookie failed");
		int_cookie_len = client_auth->int_cookie_encrypted_len;
		str_cookie_decrypted = aes_decrypt(client_auth->str_cookie_encrypted, &int_cookie_len);
		SFREE(client_auth->str_cookie_encrypted);
		client_auth->str_user = getpar(str_cookie_decrypted, "username", int_cookie_len, &client_auth->int_user_length);
		client_auth->str_password = getpar(str_cookie_decrypted, "password", int_cookie_len, &client_auth->int_password_length);
		str_expiration = getpar(str_cookie_decrypted, "expiration", int_cookie_len, &int_expiration_len);

		SFREE_PWORD(str_cookie_decrypted);

		str_uri_new_password = snuri(client_auth->str_new_password, client_auth->int_new_password_length, &int_uri_new_password_len);
		SFINISH_CHECK(str_uri_new_password != NULL, "snuri failed!");
		str_uri_expiration = snuri(str_expiration, int_expiration_len, &int_uri_expiration_len);
		SFINISH_CHECK(str_uri_expiration != NULL, "snuri failed!");
		SFINISH_SNCAT(
			str_new_cookie, &int_cookie_len,
			"valid=true", (size_t)10,
			"&username=", (size_t)10,
			client_auth->str_user, client_auth->int_user_length,
			"&password=", (size_t)10,
			str_uri_new_password, int_uri_new_password_len,
			"&expiration=", (size_t)12,
			str_uri_expiration, int_uri_expiration_len,
			"&dbname=", (size_t)8,
			client_auth->str_database, client_auth->int_dbname_length,
			"&sessionid=", (size_t)11,
			str_session_id, strlen(str_session_id)
		);

		// **** WARNING ****
		// DO NOT UNCOMMENT THE NEXT LINE! THAT WILL PUT THE NEW PASSWORD IN THE
		// CLEAR IN THE LOG!!!!
		// SDEBUG("str_new_cookie>%s<", str_new_cookie);
		// SDEBUG("int_cookie_len>%d<", int_cookie_len);
		// **** WARNING ****
		client_auth->int_cookie_encrypted_len = int_cookie_len;
		client_auth->str_cookie_encrypted = aes_encrypt(str_new_cookie, &client_auth->int_cookie_encrypted_len);
		//SDEBUG("client_auth->str_cookie_encrypted>%s<", client_auth->str_cookie_encrypted);
		//SDEBUG("int_cookie_len>%d<", int_cookie_len);

		SBFREE_PWORD(str_uri_new_password, int_uri_new_password_len);
		SFREE(str_uri_expiration);
		SFREE_PWORD(str_new_cookie);

		//bstr_tolower(client_auth->str_user, client_auth->int_user_length);

		SINFO("REQUEST USERNAME: %s", client_auth->str_user);

		char *str_temp = get_connection_info("", &client_auth->int_connection_index);
		size_t int_temp = strlen(str_temp);
#ifdef ENVELOPE_INTERFACE_LIBPQ
		if (client_auth->str_database != NULL) {
			SFINISH_SNCAT(str_conn, &int_conn_length, str_temp, int_temp, " dbname=", (size_t)8, client_auth->str_database, strlen(client_auth->str_database));
		} else {
			SFINISH_SNCAT(str_conn, &int_conn_length, str_temp, int_temp);
		}
#else
		SFINISH_SNCAT(str_conn, &int_conn_length, str_temp, int_temp);
#endif
		SFINISH_SALLOC(client_auth->str_int_connection_index, 20);
		snprintf(client_auth->str_int_connection_index, 20, "%zu", client_auth->int_connection_index);

#ifdef ENVELOPE_INTERFACE_LIBPQ
		if (bol_global_set_user) {
			// The only difference here is the callback and no user/pw
			SFINISH_CHECK((client_auth->parent->conn = DB_connect(EV_A, client_auth, str_conn, NULL,
				0, NULL, 0, "",
				http_auth_login_step15)) != NULL,
				"DB_connect failed");
		} else {
#endif
		SFINISH_CHECK((client_auth->parent->conn = DB_connect(EV_A, client_auth, str_conn, client_auth->str_user,
			client_auth->int_user_length, client_auth->str_password, client_auth->int_password_length, "",
			http_auth_change_pw_step2)) != NULL,
			"DB_connect failed");
#ifdef ENVELOPE_INTERFACE_LIBPQ
		}
#endif

	} else if (strncmp(client_auth->str_action, "logout", 7) == 0) {
		SINFO("REQUEST TYPE: LOGOUT envelope");

		str_error = getpar(str_form_data, "error", int_query_length, &int_error_len);
		str_error_uri = snuri(str_error, int_error_len, &int_error_uri_len);

		size_t int_temp = 0;
		SFINISH_SNCAT(str_cookie_name, &int_temp, "envelope", 8);

		client_auth->str_cookie_encrypted = get_cookie(client_auth->parent->str_all_cookie, client_auth->parent->int_all_cookie_len, str_cookie_name, &client_auth->int_cookie_encrypted_len);
		if (client_auth->str_cookie_encrypted != NULL) {
			ListNode *node = client_auth->parent->server->list_client->first;
			for (; node != NULL;) {
				struct sock_ev_client *other_client = node->value;
				if (other_client != NULL && other_client != client_auth->parent) {
					SDEBUG("other_client->str_cookie          : %s", other_client->str_cookie);
					SDEBUG("client_auth->str_cookie_encrypted : %s", client_auth->str_cookie_encrypted);
					SDEBUG("other_client->str_client_ip       : %s", other_client->str_client_ip);
					SDEBUG("client_auth->parent->str_client_ip: %s", client_auth->parent->str_client_ip);
					if (other_client->str_cookie != NULL &&
						strncmp(other_client->str_cookie, client_auth->str_cookie_encrypted, client_auth->int_cookie_encrypted_len) == 0 &&
						(
							str_global_2fa_function != NULL
							|| strncmp(other_client->str_client_ip, client_auth->parent->str_client_ip, strlen(client_auth->parent->str_client_ip)) == 0
						)) {
						client_timeout_prepare_free(other_client->client_timeout_prepare);
						SDEBUG("node->next: %p", node->next);
						node = node->next;
						client_close_immediate(other_client);
					} else {
						SDEBUG("node->next: %p", node->next);
						node = node->next;
					}
				} else {
					SDEBUG("node->next: %p", node->next);
					node = node->next;
				}
				SDEBUG("node: %p", node);
			}
		}

        darr_headers = DArray_from_strings(
            "Location", "/index.html"
            , "Set-Cookie", "envelope=; path=/; expires=Tue, 01 Jan 1990 00:00:00 GMT; HttpOnly"
        );
        SFINISH_CHECK(darr_headers != NULL, "DArray_from_strings failed");
        SFINISH_CHECK(build_http_response(
                "303 See Other"
                , NULL, 0
                , NULL
                , darr_headers
                , &client_auth->parent->str_http_response, &client_auth->parent->int_http_response_len
            ), "build_http_response failed");
		SFREE_PWORD(str_form_data);
	} else {
		SINFO("REQUEST TYPE: Not a valid action.");

		SFINISH("Not a valid action.");

		SFREE_PWORD(str_form_data);
	}
	bol_error_state = false;
finish:
    if (darr_headers != NULL) {
        DArray_clear_destroy(darr_headers);
        darr_headers = NULL;
    }
#ifndef ENVELOPE_INTERFACE_LIBPQ
	if (strErrorText != NULL) {
		LocalFree(strErrorText);
		strErrorText = NULL;
	}
#endif
	if (client_auth != NULL) {
		SDEBUG("client_auth: %p", client_auth);
		SDEBUG("client_auth->parent: %p", client_auth->parent);
	}

	if (bol_error_state) {
		bol_error_state = false;

        SFREE(client_auth->parent->str_http_header);
        SFINISH_CHECK(build_http_response(
                "500 Internal Server Error"
                , str_response, int_response_len
                , "text/plain"
                , NULL
                , &client_auth->parent->str_http_response, &client_auth->parent->int_http_response_len
            ), "build_http_response failed");
	}
    SFREE(str_response);
    // if client_auth->parent->str_http_header is non-empty, we are already taken care of
	if (client_auth->parent->str_http_response != NULL && client_auth->parent->str_http_header == NULL) {
		ev_io_stop(EV_A, &client_auth->parent->io);
		ev_io_init(&client_auth->parent->io, client_write_http_cb, client_auth->parent->io.fd, EV_WRITE);
        ev_io_start(EV_A, &client_auth->parent->io);
	}

	SFREE_PWORD(str_form_data);
	SFREE_PWORD(str_cookie_decrypted);
	SFREE_PWORD(str_escape_password);
	SFREE_PWORD(str_conn);
	SFREE_PWORD(str_sql);
	SFREE_PWORD(str_uri_new_password);
	SFREE_PWORD(str_new_cookie);
	SFREE_PWORD(str_new_password_literal);
	SBFREE_PWORD(str_session_id_temp, 32);
	SFREE_ALL();
}

bool http_auth_login_step2_env(EV_P, void *cb_data, DB_result *res);
bool http_auth_login_step3_env(EV_P, void *cb_data, DB_result *res);

void http_auth_login_step15(EV_P, void *cb_data, DB_conn *conn) {
	SDEBUG("http_auth_login_step15");
	struct sock_ev_client_auth *client_auth = cb_data;
	char *str_response = NULL;
	size_t int_response_len = 0;
	size_t int_temp = 0;
	SDEFINE_VAR_ALL(str_password_temp, str_password_hash, str_password_hash_temp, str_password_hash_literal, str_user_literal, str_diag, str_temp, str_sql);

	SFINISH_CHECK(conn->int_status == 1, "%s", conn->str_response);


#ifdef ENVELOPE_INTERFACE_LIBPQ
	SFINISH_SNCAT(
		str_password_temp, &int_temp,
		client_auth->str_password, client_auth->int_password_length,
		client_auth->str_user, client_auth->int_user_length
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
		str_password_hash, &int_temp,
		"md5", (size_t)3,
		str_password_hash_temp, 32
	);

	str_password_hash_literal = DB_escape_literal(client_auth->parent->conn, str_password_hash, int_temp);
	SFINISH_CHECK(str_password_hash_literal != NULL, "DB_escape_literal failed");

	str_user_literal = DB_escape_literal(client_auth->parent->conn, client_auth->str_user, client_auth->int_user_length);
	SFINISH_CHECK(str_user_literal != NULL, "DB_escape_literal failed");
	char *str_temp1 = "SELECT CASE WHEN rolpassword = ";
	char *str_temp2 = " THEN 'TRUE' ELSE 'FALSE' END FROM pg_authid WHERE rolname = ";
	SFINISH_SNCAT(
		str_sql, &int_temp,
		str_temp1, strlen(str_temp1),
		str_password_hash_literal, strlen(str_password_hash_literal),
		str_temp2, strlen(str_temp2),
		str_user_literal, strlen(str_user_literal),
		";", (size_t)1
	);
#else
	SFINISH_SNCAT(
		str_sql, &int_temp,
		"SELECT 'TRUE';", (size_t)14
	);
#endif

	SFINISH_CHECK(query_is_safe(str_sql), "SQL Injection detected");
	SFINISH_CHECK(DB_exec(EV_A, client_auth->parent->conn, client_auth, str_sql, http_auth_login_step2_env), "DB_exec failed");

	bol_error_state = false;
finish:
	SFREE(conn->str_response);

	SFREE_ALL();
	if (bol_error_state) {
		bol_error_state = false;

        SFINISH_CHECK(build_http_response(
                "500 Internal Server Error"
                , str_response, int_response_len
                , "text/plain"
                , NULL
                , &client_auth->parent->str_http_response, &client_auth->parent->int_http_response_len
            ), "build_http_response failed");
	}
    SFREE(str_response);
	if (client_auth->parent->str_http_response != NULL) {
		ev_io_stop(EV_A, &client_auth->parent->io);
		ev_io_init(&client_auth->parent->io, client_write_http_cb, client_auth->parent->io.fd, EV_WRITE);
        ev_io_start(EV_A, &client_auth->parent->io);
	}
}

bool http_auth_login_step2_env(EV_P, void *cb_data, DB_result *res) {
	SDEBUG("http_auth_login_step2_env");
	struct sock_ev_client_auth *client_auth = cb_data;
	char *str_response = NULL;
	size_t int_response_len = 0;
	DArray *arr_row_values = NULL;
	DArray *arr_row_lengths = NULL;
	DB_fetch_status status = 0;
	SDEFINE_VAR_ALL(str_user_ident, str_diag, str_sql);
	str_diag = DB_get_diagnostic(client_auth->parent->conn, res);

	SFINISH_CHECK(res != NULL, "DB_exec failed");
	SFINISH_CHECK(res->status == DB_RES_TUPLES_OK, "DB_exec failed: %s", str_diag);

#ifdef ENVELOPE_INTERFACE_LIBPQ
	str_user_ident = DB_escape_identifier(client_auth->parent->conn, client_auth->str_user, client_auth->int_user_length);
	SFINISH_CHECK(str_user_ident != NULL, "DB_escape_identifier failed");
#else
	size_t int_user_temp_len = 0;
	if (str_global_nt_domain[0] != 0) {
		SFINISH_SNCAT(
			str_user_ident, &int_user_temp_len,
			"'", (size_t)1,
			str_global_nt_domain, strlen(str_global_nt_domain),
			"\\", (size_t)1,
			client_auth->str_user, client_auth->int_user_length,
			"'", (size_t)1
		);
	} else {
		SFINISH_SNCAT(
			str_user_ident, &int_user_temp_len,
			"'", (size_t)1,
			client_auth->str_user, client_auth->int_user_length,
			"'", (size_t)1
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

		SFINISH_CHECK(strncmp(DArray_get(arr_row_values, 0), "TRUE", *(size_t *)DArray_get(arr_row_lengths, 0)) == 0, "Bad password for user %s", str_user_ident);
		SFINISH_CHECK((status = DB_fetch_row(res)) == DB_FETCH_END, "DB_fetch_row failed");

		bol_error_state = false;

		size_t int_temp = 0;
#ifdef ENVELOPE_INTERFACE_LIBPQ
		char *str_temp1 = "SET SESSION AUTHORIZATION ";
#else
		// Permissions don't work if you do LOGIN
		char *str_temp1 = "EXECUTE AS USER = ";
#endif
		SFINISH_SNCAT(
			str_sql, &int_temp,
			str_temp1, strlen(str_temp1),
			str_user_ident, strlen(str_user_ident),
			";", (size_t)1
		);

		SFINISH_CHECK(query_is_safe(str_sql), "SQL Injection detected");
		SFINISH_CHECK(DB_exec(EV_A, client_auth->parent->conn, client_auth, str_sql, http_auth_login_step3_env), "DB_exec failed");
	}

    bol_error_state = false;
finish:
	DB_free_result(res);
	if (arr_row_values != NULL) {
		DArray_clear_destroy(arr_row_values);
	}
	if (arr_row_lengths != NULL) {
		DArray_clear_destroy(arr_row_lengths);
	}
	SFREE_ALL();

    if (client_auth->parent->conn->str_response != NULL && client_auth->parent->conn->str_response[0] != 0) {
        SFINISH_SNFCAT(
            str_response, &int_response_len,
            ":\n", (size_t)2,
            client_auth->parent->conn->str_response, strlen(client_auth->parent->conn->str_response)
        );
    }
    SFREE(client_auth->parent->conn->str_response);
	if (bol_error_state) {
		bol_error_state = false;
        SERROR_NORESPONSE("Login failed from ip: %s", client_auth->parent->str_client_ip);
        SFREE(str_global_error);

        SFINISH_CHECK(build_http_response(
                "500 Internal Server Error"
                , str_response, int_response_len
                , "text/plain"
                , NULL
                , &client_auth->parent->str_http_response, &client_auth->parent->int_http_response_len
            ), "build_http_response failed");
	}
    SFREE(str_response);
	if (client_auth->parent->str_http_response != NULL) {
		ev_io_stop(EV_A, &client_auth->parent->io);
		ev_io_init(&client_auth->parent->io, client_write_http_cb, client_auth->parent->io.fd, EV_WRITE);
        ev_io_start(EV_A, &client_auth->parent->io);
	}
	return true;
}

bool http_auth_login_step3_env(EV_P, void *cb_data, DB_result *res) {
	SDEBUG("http_auth_login_step3_env");
	struct sock_ev_client_auth *client_auth = cb_data;
	char *str_response = NULL;
	size_t int_response_len = 0;
	SDEFINE_VAR_ALL(str_diag);
	str_diag = DB_get_diagnostic(client_auth->parent->conn, res);

	SFINISH_CHECK(res != NULL, "DB_exec failed");
    SFINISH_CHECK(res->status == DB_RES_COMMAND_OK, "DB_exec failed: %s", str_diag);

	SDEBUG("client_auth->str_action: %s", client_auth->str_action);
	if (strncmp(client_auth->str_action, "login", 6) == 0) {
		SDEBUG("CALLING NEXT LOGIN STEP");
		http_auth_login_step2(EV_A, client_auth, client_auth->parent->conn);
	} else if (strncmp(client_auth->str_action, "change_pw", 10) == 0) {
		SDEBUG("CALLING NEXT CHANGE PASSWORD STEP");
		http_auth_change_pw_step2(EV_A, client_auth, client_auth->parent->conn);
	}

	bol_error_state = false;
finish:
	DB_free_result(res);
	SFREE_ALL();

    if (client_auth->parent->conn->str_response != NULL && client_auth->parent->conn->str_response[0] != 0) {
        SFINISH_SNFCAT(
            str_response, &int_response_len,
            ":\n", (size_t)2,
            client_auth->parent->conn->str_response, strlen(client_auth->parent->conn->str_response)
        );
    }
    SFREE(client_auth->parent->conn->str_response);
	if (bol_error_state) {
		bol_error_state = false;

        SFINISH_CHECK(build_http_response(
                "500 Internal Server Error"
                , str_response, int_response_len
                , "text/plain"
                , NULL
                , &client_auth->parent->str_http_response, &client_auth->parent->int_http_response_len
            ), "build_http_response failed");
	}
    SFREE(str_response);
	if (client_auth->parent->str_http_response != NULL) {
		ev_io_stop(EV_A, &client_auth->parent->io);
		ev_io_init(&client_auth->parent->io, client_write_http_cb, client_auth->parent->io.fd, EV_WRITE);
        ev_io_start(EV_A, &client_auth->parent->io);
	}
	return true;
}

void http_auth_login_step2(EV_P, void *cb_data, DB_conn *conn) {
	struct sock_ev_client_auth *client_auth = cb_data;
	struct sock_ev_client_request *client_request = client_auth->parent->cur_request;
	SDEFINE_VAR_ALL(str_group_literal, str_sql, str_expires, str_temp, str_user_literal, str_int_len);
	char *str_response = NULL;
	size_t int_response_len = 0;
	size_t int_user_literal_len = 0;
	size_t int_group_literal_len = 0;
	size_t int_temp_len = 0;
    DArray *darr_headers = NULL;
	SDEBUG("http_auth_login_step2");
	SDEBUG("client_auth: %p", client_auth);
	SDEBUG("client_auth->parent: %p", client_auth->parent);
	SDEBUG("conn->str_response: %p", conn->str_response);
	SDEBUG("conn->str_response: %s", conn->str_response);

	SFINISH_CHECK(conn->int_status == 1, "%s", conn->str_response);

	str_user_literal = DB_escape_literal(client_auth->parent->conn, client_auth->str_user, client_auth->int_user_length);
	SFINISH_CHECK(str_user_literal != NULL, "DB_escape_literal failed");
	int_user_literal_len = strlen(str_user_literal);
	if (str_global_login_group != NULL) {
		str_temp = DB_escape_literal(client_auth->parent->conn, str_global_login_group, strlen(str_global_login_group));
		SFINISH_CHECK(str_temp != NULL, "DB_escape_literal failed");
		SFINISH_SNCAT(str_group_literal, &int_group_literal_len, str_temp, strlen(str_temp));
		SFREE(str_temp);
		str_temp = NULL;
	} else {
		SFINISH_SNCAT(str_group_literal, &int_group_literal_len, "''", (size_t)2);
	}
	if (DB_connection_driver(client_auth->parent->conn) == DB_DRIVER_POSTGRES) {
		size_t int_temp = 0;
		char *str_temp1 =
			"SELECT CASE WHEN rolsuper THEN 'TRUE' ELSE 'FALSE' END AS result ";
		char *str_temp2 =
			"FROM pg_catalog.pg_roles WHERE rolname = ";
		char *str_temp3 =
			" UNION ALL "
			"SELECT CASE WHEN count(pg_roles.rolname) > 0 THEN 'TRUE' ELSE 'FALSE' "
			"END, '' "
			"FROM pg_user "
			"LEFT JOIN pg_auth_members on pg_user.usesysid = pg_auth_members.member "
			"LEFT JOIN pg_roles on pg_roles.oid = pg_auth_members.roleid "
			"WHERE pg_user.usename = ";
		if (str_global_2fa_function != NULL) {
			SFINISH_SNCAT(
				str_sql, &int_temp,
				str_temp1, strlen(str_temp1),
				", ", (size_t)2,
				str_global_2fa_function, strlen(str_global_2fa_function),
				"(", (size_t)1,
				str_user_literal, int_user_literal_len,
				") ", (size_t)2,
				str_temp2, strlen(str_temp2),
				str_user_literal, int_user_literal_len,
				str_temp3, strlen(str_temp3),
				str_user_literal, int_user_literal_len,
				" AND pg_roles.rolname = ", (size_t)24,
				str_group_literal, int_group_literal_len
			);
		} else {
			SFINISH_SNCAT(
				str_sql, &int_temp,
				str_temp1, strlen(str_temp1),
				", '' ", (size_t)5,
				str_temp2, strlen(str_temp2),
				str_user_literal, int_user_literal_len,
				str_temp3, strlen(str_temp3),
				str_user_literal, int_user_literal_len,
				" AND pg_roles.rolname = ", (size_t)24,
				str_group_literal, int_group_literal_len
			);
		}
	} else if (DB_connection_driver(client_auth->parent->conn) == DB_DRIVER_SQL_SERVER) {
		size_t int_temp = 0;
		char *str_temp1 =
			"SELECT CASE WHEN IS_SRVROLEMEMBER('sysadmin') = 1 THEN 'TRUE' ELSE 'FALSE' END";
		char *str_temp2 =
			" UNION ALL SELECT CASE WHEN IS_MEMBER(";
		char *str_temp3 =
			") = 1 THEN 'TRUE' ELSE 'FALSE' END, '';";
		if (str_global_2fa_function != NULL) {
			SFINISH_SNCAT(
				str_sql, &int_temp,
				str_temp1, strlen(str_temp1),
				", ", (size_t)2,
				str_global_2fa_function, strlen(str_global_2fa_function),
				"(", (size_t)1,
				str_user_literal, int_user_literal_len,
				") ", (size_t)2,
				str_temp2, strlen(str_temp2),
				str_user_literal, int_user_literal_len,
				str_temp3, strlen(str_temp3),
				str_user_literal, int_user_literal_len,
				" AND pg_roles.rolname = ", (size_t)24,
				str_group_literal, int_group_literal_len
			);
			SFINISH_SNCAT(
				str_sql, &int_temp,
				str_temp1, strlen(str_temp1),
				", ", (size_t)2,
				str_global_2fa_function, strlen(str_global_2fa_function),
				"(", (size_t)1,
				str_user_literal, int_user_literal_len,
				") ", (size_t)2,
				str_temp2, strlen(str_temp2),
				str_group_literal, int_group_literal_len,
				str_temp3, strlen(str_temp3)
			);
		} else {
			SFINISH_SNCAT(
				str_sql, &int_temp,
				str_temp1, strlen(str_temp1),
				", '' ", (size_t)5,
				str_temp2, strlen(str_temp2),
				str_group_literal, int_group_literal_len,
				str_temp3, strlen(str_temp3)
			);
		}
	} else {
		char *str_temp1 =
			"envelope=";
		char *str_temp2 =
			"; HttpOnly;\015\012Set-Cookie: DB=SS; path=/;\015\012Content-Length: 48\015\012\015\012"
			"{\"stat\": true, \"dat\": \"/env/app/all/index.html\"}";
		str_expires = str_global_2fa_function != NULL ? str_expire_100_year() : str_expire_one_day();
		SFINISH_SNCAT(
			str_temp, &int_temp_len,
			str_temp1, strlen(str_temp1),
			client_auth->str_cookie_encrypted, client_auth->int_cookie_encrypted_len,
			"; path=/; expires=", (size_t)18,
			str_expires, strlen(str_expires),
			str_temp2, strlen(str_temp2)
		);
        darr_headers = DArray_from_strings(
            "Set-Cookie", str_temp
        );
        SFREE(str_temp);
        SFINISH_CHECK(darr_headers != NULL, "DArray_from_strings failed");

        SFINISH_CHECK(build_http_response(
                "200 OK"
                , "{\"stat\": true, \"dat\": \"/env/app/all/index.html\"}", strlen("{\"stat\": true, \"dat\": \"/env/app/all/index.html\"}")
                , "application/json"
                , darr_headers
                , &client_auth->parent->str_http_response, &client_auth->parent->int_http_response_len
            ), "build_http_response failed");

		struct sock_ev_client *client = client_auth->parent;
		size_t int_i, int_len;
		client->int_last_activity_i = -1;
		struct sock_ev_client_last_activity *client_last_activity;
		for (int_i = 0, int_len = DArray_end(client->server->arr_client_last_activity); int_i < int_len; int_i += 1) {
			client_last_activity =
				(struct sock_ev_client_last_activity *)DArray_get(client->server->arr_client_last_activity, int_i);
			if (client_last_activity != NULL &&
				(
					str_global_2fa_function != NULL
					|| strncmp(client_last_activity->str_client_ip, client->str_client_ip, strlen(client->str_client_ip)) == 0
				) &&
				strncmp(client_last_activity->str_cookie, client_auth->str_cookie_encrypted,
					client_auth->int_cookie_encrypted_len) == 0) {
				client->int_last_activity_i = (ssize_t)int_i;
				break;
			}
		}
		if (client->int_last_activity_i == -1) {
			SFINISH_SALLOC(client_last_activity, sizeof(struct sock_ev_client_last_activity));
		    SFINISH_SALLOC(client_last_activity->str_client_ip, strlen(client_auth->parent->str_client_ip));
			memcpy(client_last_activity->str_client_ip, client_auth->parent->str_client_ip, strlen(client_auth->parent->str_client_ip));
			size_t int_temp = 0;
			SFINISH_SNCAT(client_last_activity->str_cookie, &int_temp, client_auth->str_cookie_encrypted, client_auth->int_cookie_encrypted_len);
			client_last_activity->last_activity_time = ev_now(EV_A);
			client_auth->parent->int_last_activity_i =
				(ssize_t)DArray_push(client_auth->parent->server->arr_client_last_activity, client_last_activity);
		}

		SFREE(str_user_literal);
		SFREE(str_group_literal);

		bol_error_state = false;
		goto finish;
	}
	SFREE(str_user_literal);
	SFREE(str_group_literal);

	SFINISH_CHECK(query_is_safe(str_sql), "SQL Injection detected");
	SFINISH_CHECK(DB_exec(EV_A, client_auth->parent->conn, client_request, str_sql, http_auth_login_step3), "DB_exec failed");
	SFREE(str_sql);

	bol_error_state = false;
finish:
    if (darr_headers != NULL) {
        DArray_clear_destroy(darr_headers);
    }
	SFREE_ALL();

    SFREE(client_auth->parent->conn->str_response);
	if (bol_error_state) {
		bol_error_state = false;
        SERROR_NORESPONSE("Login failed from ip: %s", client_auth->parent->str_client_ip);
        SFREE(str_global_error);

        SFINISH_CHECK(build_http_response(
                "500 Internal Server Error"
                , str_response, int_response_len
                , "text/plain"
                , NULL
                , &client_auth->parent->str_http_response, &client_auth->parent->int_http_response_len
            ), "build_http_response failed");
	}
    SFREE(str_response);
	if (client_auth->parent->str_http_response != NULL) {
		ev_io_stop(EV_A, &client_auth->parent->io);
		ev_io_init(&client_auth->parent->io, client_write_http_cb, client_auth->parent->io.fd, EV_WRITE);
        ev_io_start(EV_A, &client_auth->parent->io);
	}
}

bool http_auth_login_step3(EV_P, void *cb_data, DB_result *res) {
	struct sock_ev_client_request *client_request = cb_data;
	struct sock_ev_client_auth *client_auth = (struct sock_ev_client_auth *)(client_request->client_request_data);
	SDEFINE_VAR_ALL(str_user_literal, str_temp1, str_expires, str_int_len, str_real_cookie);
	SDEFINE_VAR_MORE(str_content_length, str_connstring, str_user, str_open, str_cookie_encrypted_temp);
	SDEFINE_VAR_MORE(str_closed, str_temp_connstring, str_rolsuper, str_rolgroup, str_temp, str_2fa_token);
	char *str_response = NULL;
	DArray *arr_row_values = NULL;
	DArray *arr_row_lengths = NULL;
	size_t int_real_cookie_len = 0;
	size_t int_temp = 0;
	size_t int_temp_len = 0;
	size_t int_response_len = 0;
	size_t int_cookie_temp_len = 0;
	DB_fetch_status status = 0;
    DArray *darr_headers = NULL;
	SDEBUG("http_auth_login_step3");

	SFINISH_CHECK(res != NULL, "DB_exec failed");
	SFINISH_CHECK(res->status == DB_RES_TUPLES_OK, "DB_exec failed");

	SFINISH_CHECK((status = DB_fetch_row(res)) == DB_FETCH_OK, "DB_fetch_row failed");
	arr_row_values = DB_get_row_values(res);
	arr_row_lengths = DB_get_row_lengths(res);

	SFINISH_SNCAT(str_rolsuper, &int_temp, DArray_get(arr_row_values, 0), *(size_t *)DArray_get(arr_row_lengths, 0));
	SFINISH_SNCAT(str_2fa_token, &int_temp, DArray_get(arr_row_values, 1), *(size_t *)DArray_get(arr_row_lengths, 1));
	SFINISH_SNCAT(str_real_cookie, &int_real_cookie_len, client_auth->str_cookie_encrypted, client_auth->int_cookie_encrypted_len);
	if (str_2fa_token != NULL && strncmp(str_2fa_token, "", 1) != 0) {
		// int_cookie_temp_len = client_auth->int_cookie_encrypted_len;
		str_cookie_encrypted_temp = cstr_to_uri(client_auth->str_cookie_encrypted, &client_auth->int_cookie_encrypted_len);
		SFINISH_SNCAT(
			str_temp, &int_cookie_temp_len
			, "cookie=", (size_t)7
			, str_cookie_encrypted_temp, client_auth->int_cookie_encrypted_len
			, "&token=", (size_t)7
			, str_2fa_token, int_temp
		);
		SFREE(str_cookie_encrypted_temp);
		str_cookie_encrypted_temp = aes_encrypt(str_temp, &int_cookie_temp_len);
		SFINISH_CHECK(client_auth->str_cookie_encrypted, "failed to encrypt cookie");
		SFREE_PWORD(client_auth->str_cookie_encrypted);
		client_auth->str_cookie_encrypted = str_cookie_encrypted_temp;
		client_auth->int_cookie_encrypted_len = int_cookie_temp_len;
		str_cookie_encrypted_temp = NULL;
		SFREE(str_temp);
	}

	DArray_clear_destroy(arr_row_values);
	arr_row_values = NULL;
	DArray_clear_destroy(arr_row_lengths);
	arr_row_lengths = NULL;

	SFINISH_CHECK((status = DB_fetch_row(res)) == DB_FETCH_OK, "DB_fetch_row failed");
	arr_row_values = DB_get_row_values(res);
	arr_row_lengths = DB_get_row_lengths(res);

	SFINISH_SNCAT(str_rolgroup, &int_temp, DArray_get(arr_row_values, 0), *(size_t *)DArray_get(arr_row_lengths, 0));

	DArray_clear_destroy(arr_row_values);
	arr_row_values = NULL;
	DArray_clear_destroy(arr_row_lengths);
	arr_row_lengths = NULL;

	SFINISH_CHECK((status = DB_fetch_row(res)) == DB_FETCH_END, "DB_fetch_row failed");

	DB_free_result(res);

	if (bol_global_super_only == true && strncmp(str_rolsuper, "FALSE", 5) == 0) {
		char *str_temp1 = "{\"stat\": false, \"dat\": \"You must login as a super user to use Envelope. If you would like to use a non-superuser role, change the `super_only` parameter to false in envelope.conf\"}";
		SFINISH_SNCAT(str_temp, &int_temp, str_temp1, strlen(str_temp1));
        SFINISH_CHECK(build_http_response(
                "403 Forbidden"
                , str_temp, strlen(str_temp)
                , "application/json"
                , darr_headers
                , &client_auth->parent->str_http_response, &client_auth->parent->int_http_response_len
            ), "build_http_response failed");
		SFREE(str_temp);

	} else if (str_global_login_group != NULL && strncmp(str_rolgroup, "FALSE", 5) == 0) {
		char *str_temp1 =
			"{\"stat\": false, \"dat\": \"You must login as a member "
			"of the group '";
		char *str_temp2 =
			"' to use Envelope\"}";
		SFINISH_SNCAT(
			str_response, &int_response_len,
			str_temp1, strlen(str_temp1),
			str_global_login_group, strlen(str_global_login_group),
			str_temp2, strlen(str_temp2)
		);
        SFINISH_CHECK(build_http_response(
                "403 Forbidden"
                , str_response, int_response_len
                , "application/json"
                , darr_headers
                , &client_auth->parent->str_http_response, &client_auth->parent->int_http_response_len
            ), "build_http_response failed");

		SFREE(str_content_length);
	} else {
        char *str_temp1 =
            str_2fa_token != NULL && strncmp(str_2fa_token, "", 1) != 0 ? "envelope_2fa_pending=" : "envelope=";
        char *str_temp2 =
            "; HttpOnly;";
        char *str_temp3 =
            str_2fa_token != NULL && strncmp(str_2fa_token, "", 1) != 0 ? "{\"stat\": true, \"dat\": \"2fa required\"}" : "{\"stat\": true, \"dat\": \"/env/app/all/index.html\"}";
        SFREE(str_expires);
        str_expires = str_global_2fa_function != NULL ? str_expire_100_year() : str_expire_one_day();
        SFINISH_SNCAT(
            str_temp, &int_temp_len,
            str_temp1, strlen(str_temp1),
            client_auth->str_cookie_encrypted, client_auth->int_cookie_encrypted_len,
            "; path=/; expires=", (size_t)18,
            str_expires, strlen(str_expires),
            str_temp2, strlen(str_temp2)
        );
        darr_headers = DArray_from_strings(
            "Set-Cookie", str_temp
            , "Set-Cookie", (DB_connection_driver(client_auth->parent->conn) == DB_DRIVER_POSTGRES ? "DB=PG" : "DB=SS")
        );
		SFREE(str_temp);
        SFINISH_CHECK(darr_headers != NULL, "DArray_from_strings failed");
        SFINISH_CHECK(build_http_response(
                "200 OK"
                , str_temp3, strlen(str_temp3)
                , "application/json"
                , darr_headers
                , &client_auth->parent->str_http_response, &client_auth->parent->int_http_response_len
            ), "build_http_response failed");

		struct sock_ev_client *client = client_auth->parent;
		size_t int_i, int_len;
		client->int_last_activity_i = -1;
		struct sock_ev_client_last_activity *client_last_activity;

		for (int_i = 0, int_len = DArray_end(client->server->arr_client_last_activity); int_i < int_len; int_i += 1) {
			client_last_activity =
				(struct sock_ev_client_last_activity *)DArray_get(client->server->arr_client_last_activity, int_i);
			if (client_last_activity != NULL &&
				(
					str_global_2fa_function != NULL
					|| strncmp(client_last_activity->str_client_ip, client->str_client_ip, strlen(client->str_client_ip)) == 0
				) &&
				strncmp(client_last_activity->str_cookie, str_real_cookie,
					int_real_cookie_len) == 0) {
				client->int_last_activity_i = (ssize_t)int_i;
				break;
			}
		}
		if (client->int_last_activity_i == -1) {
			SFINISH_SALLOC(client_last_activity, sizeof(struct sock_ev_client_last_activity));
		    SFINISH_SALLOC(client_last_activity->str_client_ip, strlen(client_auth->parent->str_client_ip));
			memcpy(client_last_activity->str_client_ip, client_auth->parent->str_client_ip, strlen(client_auth->parent->str_client_ip));
			SFINISH_SNCAT(client_last_activity->str_cookie, &int_temp, str_real_cookie, int_real_cookie_len);
			client_last_activity->last_activity_time = ev_now(EV_A);
			client_auth->parent->int_last_activity_i =
				(ssize_t)DArray_push(client_auth->parent->server->arr_client_last_activity, client_last_activity);
		}
		SINFO("client->int_last_activity_i: %d", client->int_last_activity_i);
		SDEBUG("envelope COOKIE SET");
	}

	SDEBUG("str_response: %s", str_response);
	SDEBUG("LOGIN END");

	bol_error_state = false;
finish:
	if (darr_headers != NULL) {
		DArray_clear_destroy(darr_headers);
	}
	if (arr_row_values != NULL) {
		DArray_clear_destroy(arr_row_values);
	}
	if (arr_row_lengths != NULL) {
		DArray_clear_destroy(arr_row_lengths);
	}
	SFREE_ALL();

    if (client_auth->parent->conn->str_response != NULL && client_auth->parent->conn->str_response[0] != 0) {
        SFINISH_SNFCAT(
            str_response, &int_response_len,
            ":\n", (size_t)2,
            client_auth->parent->conn->str_response, strlen(client_auth->parent->conn->str_response)
        );
    }
    SFREE(client_auth->parent->conn->str_response);

	if (bol_error_state) {
		bol_error_state = false;
        SERROR_NORESPONSE("Login failed from ip: %s", client_auth->parent->str_client_ip);
        SFREE(str_global_error);

		char *_str_response1 = str_response;
		char *_str_response2 = DB_get_diagnostic(client_auth->parent->conn, res);
		SFINISH_SNCAT(
			str_response, &int_response_len,
			_str_response1, strlen(_str_response1 != NULL ? _str_response1 : ""),
			":\n", (size_t)2,
			_str_response2, strlen(_str_response2 != NULL ? _str_response2 : "")
		);
		SFREE(_str_response1);
		SFREE(_str_response2);


        SFINISH_CHECK(build_http_response(
                "500 Internal Server Error"
                , str_response, int_response_len
                , "text/plain"
                , NULL
                , &client_auth->parent->str_http_response, &client_auth->parent->int_http_response_len
            ), "build_http_response failed");
	}
	DB_free_result(res);
    SFREE(str_response);
	if (client_auth->parent->str_http_response != NULL) {
		ev_io_stop(EV_A, &client_auth->parent->io);
		ev_io_init(&client_auth->parent->io, client_write_http_cb, client_auth->parent->io.fd, EV_WRITE);
        ev_io_start(EV_A, &client_auth->parent->io);
	}
	return true;
}

void http_auth_change_pw_step2(EV_P, void *cb_data, DB_conn *conn) {
	struct sock_ev_client_auth *client_auth = cb_data;
	struct sock_ev_client_request *client_request = client_auth->parent->cur_request;
	SDEFINE_VAR_ALL(str_sql, str_user_quote, str_old_password_literal, str_new_password_literal);
	char *str_response = NULL;
	size_t int_response_len = 0;
	size_t int_temp = 0;

	SFINISH_CHECK(conn->int_status == 1, "%s", conn->str_response);

	str_user_quote = DB_escape_identifier(client_auth->parent->conn, client_auth->str_user, strlen(client_auth->str_user));
	SDEBUG("str_user_quote: %s", str_user_quote);

	// **** WARNING ****
	// DO NOT UNCOMMENT THE NEXT LINE! THAT WILL PUT THE NEW PASSWORD IN THE CLEAR
	// IN THE LOG!!!!
	// DEBUG("pw check>%s|%s|%i<", str_password_old, pword,
	// strncmp(str_password_old, pword, strlen(pword)));
	// **** WARNING ****
	SFINISH_CHECK(strncmp(client_auth->str_old_check_password, client_auth->str_password, strlen(client_auth->str_password)) == 0,
		"Old password does not match.");
	SFREE_PWORD(client_auth->str_password);

	str_new_password_literal =
		DB_escape_literal(client_auth->parent->conn, client_auth->str_new_password, strlen(client_auth->str_new_password));
	SFREE_PWORD(client_auth->str_new_password);
	if (DB_connection_driver(client_auth->parent->conn) == DB_DRIVER_POSTGRES) {
		SFINISH_SNCAT(
			str_sql, &int_temp,
			"ALTER ROLE ", (size_t)11,
			str_user_quote, strlen(str_user_quote),
			" PASSWORD ", (size_t)10,
			str_new_password_literal, strlen(str_new_password_literal),
			";", (size_t)1
		);
	} else {
		str_old_password_literal = DB_escape_literal(
			client_auth->parent->conn, client_auth->str_old_check_password, strlen(client_auth->str_old_check_password));
		SFINISH_SNCAT(
			str_sql, &int_temp,
			"ALTER LOGIN ", (size_t)12,
			str_user_quote, strlen(str_user_quote),
			" WITH PASSWORD = ", (size_t)17,
			str_new_password_literal, strlen(str_new_password_literal),
			" OLD_PASSWORD = ", (size_t)16,
			str_old_password_literal, strlen(str_old_password_literal),
			";", (size_t)1
		);
		SDEBUG("str_sql: %s", str_sql);
	}
	SFREE_PWORD(client_auth->str_old_check_password);
	SFREE(client_auth->str_user);
	// **** WARNING ****
	// DO NOT UNCOMMENT THE NEXT LINE! THAT WILL PUT THE NEW PASSWORD IN THE CLEAR
	// IN THE LOG!!!!
	// DEBUG("str_sql>%s<", str_sql);
	// **** WARNING ****
	SFREE(str_user_quote);
	SFREE(str_new_password_literal);
	str_new_password_literal = NULL;

	SFINISH_CHECK(query_is_safe(str_sql), "SQL Injection detected");
	SFINISH_CHECK(
		DB_exec(EV_A, client_request->parent->conn, client_request, str_sql, http_auth_change_pw_step3), "DB_exec failed");
	SFREE(str_sql);
	/*
	int int_status = PQsendQuery(client_auth->parent->cnxn, str_sql);
	if (int_status != 1) {
		SFINISH("count failed: %s", PQerrorMessage(client_auth->parent->cnxn));
	}
	query_callback(client_request, http_auth_change_pw_step3);
	*/
	bol_error_state = false;
finish:
	SFREE_PWORD_ALL();

    if (client_auth->parent->conn->str_response != NULL && client_auth->parent->conn->str_response[0] != 0) {
        SFINISH_SNFCAT(
            str_response, &int_response_len,
            ":\n", (size_t)2,
            client_auth->parent->conn->str_response, strlen(client_auth->parent->conn->str_response)
        );
    }
    SFREE(client_auth->parent->conn->str_response);

	if (bol_error_state) {
		bol_error_state = false;
        SFREE(str_global_error);

        SFINISH_CHECK(build_http_response(
                "500 Internal Server Error"
                , str_response, int_response_len
                , "text/plain"
                , NULL
                , &client_auth->parent->str_http_response, &client_auth->parent->int_http_response_len
            ), "build_http_response failed");
	}
    SFREE(str_response);
	if (client_auth->parent->str_http_response != NULL) {
		ev_io_stop(EV_A, &client_auth->parent->io);
		ev_io_init(&client_auth->parent->io, client_write_http_cb, client_auth->parent->io.fd, EV_WRITE);
        ev_io_start(EV_A, &client_auth->parent->io);
	}
}

bool http_auth_change_pw_step3(EV_P, void *cb_data, DB_result *res) {
	struct sock_ev_client_request *client_request = cb_data;
	struct sock_ev_client_auth *client_auth = (struct sock_ev_client_auth *)(client_request->client_request_data);
	char *str_response = NULL;
	size_t int_response_len = 0;
	size_t int_temp_len = 0;
	size_t int_temp = 0;
    DArray *darr_headers = NULL;
	SDEFINE_VAR_ALL(str_expires, str_temp1);

	SDEBUG("res->status: %d", res->status);

	SFINISH_CHECK(res != NULL, "DB_exec failed");
	SFINISH_CHECK(res->status == DB_RES_COMMAND_OK, "DB_exec failed");

	DB_free_result(res);

	size_t int_len = 0, int_i = 0;

	SDEBUG("PASSWORD CHANGE");
	str_expires = str_global_2fa_function != NULL ? str_expire_100_year() : str_expire_one_day();

	char *str_temp2 =
		"envelope=";
	char *str_temp3 =
		"; HttpOnly";
	SFINISH_SNFCAT(
		str_temp1, &int_temp_len,
		str_temp2, strlen(str_temp2),
		client_auth->str_cookie_encrypted, client_auth->int_cookie_encrypted_len,
		"; path=/; expires=", (size_t)18,
		str_expires, strlen(str_expires),
		str_temp3, strlen(str_temp3)
	);
    darr_headers = DArray_from_strings(
        "Set-Cookie", str_temp1
    );
    SFINISH_CHECK(darr_headers != NULL, "DArray_from_strings failed");
    SFINISH_CHECK(build_http_response(
            "200 OK"
            , "{\"stat\": true, \"dat\": \"OK\"}", strlen("{\"stat\": true, \"dat\": \"OK\"}")
            , "application/json"
            , darr_headers
            , &client_auth->parent->str_http_response, &client_auth->parent->int_http_response_len
        ), "build_http_response failed");
    SINFO("client_auth->parent->str_http_response: %s", client_auth->parent->str_http_response);

	client_auth->parent->int_last_activity_i = -1;
	for (int_i = 0, int_len = DArray_end(client_auth->parent->server->arr_client_last_activity); int_i < int_len; int_i += 1) {
		struct sock_ev_client_last_activity *client_last_activity =
			(struct sock_ev_client_last_activity *)DArray_get(client_auth->parent->server->arr_client_last_activity, int_i);
		if (client_last_activity &&
			(
				str_global_2fa_function != NULL
				|| strncmp(client_last_activity->str_client_ip, client_auth->parent->str_client_ip, strlen(client_auth->parent->str_client_ip)) == 0
			) &&
			strncmp(client_last_activity->str_cookie, client_auth->str_cookie_encrypted, client_auth->int_cookie_encrypted_len) == 0) {
			client_auth->parent->int_last_activity_i = (ssize_t)int_i;
			break;
		}
	}
	SDEBUG("client_auth->parent->int_last_activity_i: %d", client_auth->parent->int_last_activity_i);
	if (client_auth->parent->int_last_activity_i != -1) {
		struct sock_ev_client_last_activity *client_last_activity = (struct sock_ev_client_last_activity *)DArray_get(
			client_auth->parent->server->arr_client_last_activity, (size_t)client_auth->parent->int_last_activity_i);
		SFREE(client_last_activity->str_cookie);
		SFINISH_SNCAT(client_last_activity->str_cookie, &int_temp, client_auth->str_cookie_encrypted, client_auth->int_cookie_encrypted_len);
		SDEBUG("New cookie is %s", client_last_activity->str_cookie);
	} else {
		struct sock_ev_client_last_activity *client_last_activity;
		SFINISH_SALLOC(client_last_activity, sizeof(struct sock_ev_client_last_activity));
        SFINISH_SALLOC(client_last_activity->str_client_ip, strlen(client_auth->parent->str_client_ip));
		memcpy(client_last_activity->str_client_ip, client_auth->parent->str_client_ip, strlen(client_auth->parent->str_client_ip));
		SFINISH_SNCAT(client_last_activity->str_cookie, &int_temp, client_auth->str_cookie_encrypted, client_auth->int_cookie_encrypted_len);
		client_last_activity->last_activity_time = ev_now(EV_A);
		client_auth->parent->int_last_activity_i =
			(ssize_t)DArray_push(client_auth->parent->server->arr_client_last_activity, client_last_activity);
		SDEBUG("New cookie is %s", client_last_activity->str_cookie);
	}

	bol_error_state = false;
finish:
	if (darr_headers != NULL) {
		DArray_clear_destroy(darr_headers);
	}
	SFREE_ALL();

    if (client_auth->parent->conn->str_response != NULL && client_auth->parent->conn->str_response[0] != 0) {
        SFINISH_SNFCAT(
            str_response, &int_response_len,
            ":\n", (size_t)2,
            client_auth->parent->conn->str_response, strlen(client_auth->parent->conn->str_response)
        );
    }
    SFREE(client_auth->parent->conn->str_response);

	if (bol_error_state) {
		bol_error_state = false;
        SFREE(str_global_error);

        SFINISH_CHECK(build_http_response(
                "500 Internal Server Error"
                , str_response, int_response_len
                , "text/plain"
                , NULL
                , &client_auth->parent->str_http_response, &client_auth->parent->int_http_response_len
            ), "build_http_response failed");
	}
    SFREE(str_response);
	if (client_auth->parent->str_http_response != NULL) {
		ev_io_stop(EV_A, &client_auth->parent->io);
		ev_io_init(&client_auth->parent->io, client_write_http_cb, client_auth->parent->io.fd, EV_WRITE);
        ev_io_start(EV_A, &client_auth->parent->io);
	}
	// This causes DB_exec to stop looping
	return true;
}

void http_auth_free(struct sock_ev_client_request_data *client_request_data) {
	struct sock_ev_client_auth *client_auth = (struct sock_ev_client_auth *)client_request_data;
	if (client_auth != NULL) {
		SFREE(client_auth->str_action);
		SFREE_PWORD(client_auth->str_cookie_encrypted);
		SFREE(client_auth->str_user);
		SFREE(client_auth->str_database);
		SFREE_PWORD(client_auth->str_old_check_password);
		SFREE_PWORD(client_auth->str_password);
		SFREE_PWORD(client_auth->str_new_password);
		SFREE_PWORD(client_auth->str_int_connection_index);
	}
}
