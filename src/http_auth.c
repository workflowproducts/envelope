#include "http_auth.h"

// response with redirect
void http_auth(struct sock_ev_client_auth *client_auth) {
	char *str_response = NULL;
	char *str_session_id_temp = NULL;
	SDEFINE_VAR_ALL(str_form_data, str_expires);
	SDEFINE_VAR_MORE(str_uri_expires, str_cookie_decrypted);
	SDEFINE_VAR_MORE(str_escape_password, str_conn, str_conn_debug, str_body);
	SDEFINE_VAR_MORE(str_email_error, str_user_literal, str_sql);
	SDEFINE_VAR_MORE(str_expiration, str_referer, str_temp);
	SDEFINE_VAR_MORE(str_uri_new_password, str_uri_expiration);
	SDEFINE_VAR_MORE(str_new_cookie, str_user_quote, str_new_password_literal);
	SDEFINE_VAR_MORE(str_uri_timeout, str_one_day_expire, str_cookie_name, str_session_id);
	SDEFINE_VAR_MORE(str_error, str_error_uri);
	size_t int_error_len = 0;
	size_t int_error_uri_len = 0;
#ifndef ENVELOPE_INTERFACE_LIBPQ
	LPSTR strErrorText = NULL;
#endif

	size_t int_query_length = 0;
	size_t int_action_length = 0;
	size_t int_expiration_len = 0;
	size_t int_cookie_len = 0;
	size_t int_response_len = 0;
	size_t int_uri_new_password_len = 0;
	size_t int_uri_expiration_len = 0;

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
		SNOTICE("REQUEST TYPE: " SUN_PROGRAM_LOWER_NAME " LOGIN");
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

		SNOTICE("REQUEST USERNAME: %s", client_auth->str_user);

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

		SFINISH_SNCAT(client_auth->str_connname, &client_auth->int_conn_length, "", (size_t)0);
		// cookie expiration
		str_expires = str_expire_two_day();
		SFINISH_CHECK(str_expires != NULL, "str_expire_two_day failed");

		str_one_day_expire = str_expire_one_day();
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
			"&expiration=", (size_t)12,
			str_uri_expires, int_uri_expires_len,
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
		// done encrypting

		// assemble connection string, get cnxn handle
		SFINISH_CHECK(exists_connection_info(client_auth->str_connname), "There is no connection info with that name.");

		char *str_temp = get_connection_info(client_auth->str_connname, &client_auth->int_connection_index);
		size_t int_temp = strlen(str_temp);
#ifdef ENVELOPE_INTERFACE_LIBPQ
		if (client_auth->str_database != NULL) {
			SFINISH_SNCAT(str_conn, &client_auth->int_conn_length, str_temp, int_temp, " dbname=", (size_t)8, client_auth->str_database, strlen(client_auth->str_database));
		} else {
			SFINISH_SNCAT(str_conn, &client_auth->int_conn_length, str_temp, int_temp);
		}
#else
		SFINISH_SNCAT(str_conn, &client_auth->int_conn_length, str_temp, int_temp);
#endif
		SFINISH_SALLOC(client_auth->str_int_connection_index, 20);
		snprintf(client_auth->str_int_connection_index, 20, "%zu", client_auth->int_connection_index);

		SFREE(client_auth->str_conn);

		SDEBUG("client_auth: %p", client_auth);
		SDEBUG("client_auth->parent: %p", client_auth->parent);
		SDEBUG("str_conn: %s", str_conn);


#ifdef ENVELOPE_INTERFACE_LIBPQ
		SDEBUG("bol_global_set_user: %s", bol_global_set_user ? "true" : "false");
		if (bol_global_set_user) {
			// The only difference here is the callback and no user/pw
			SFINISH_CHECK((client_auth->parent->conn = DB_connect(global_loop, client_auth, str_conn, NULL,
				0, NULL, 0, "",
				http_auth_login_step15)) != NULL,
				"DB_connect failed");
		} else {
			SFINISH_CHECK((client_auth->parent->conn = DB_connect(global_loop, client_auth, str_conn, client_auth->str_user,
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

			SFINISH_CHECK((client_auth->parent->conn = DB_connect(global_loop, client_auth, str_conn, NULL,
				0, NULL, 0, "",
				http_auth_login_step15)) != NULL,
				"DB_connect failed");

		} else {
			SFINISH_CHECK((client_auth->parent->conn = DB_connect(global_loop, client_auth, str_conn, client_auth->str_user,
				client_auth->int_user_length, client_auth->str_password, client_auth->int_password_length, "",
				http_auth_login_step2)) != NULL,
				"DB_connect failed");
		}
#endif

		SDEBUG("client_auth: %p", client_auth);
		SDEBUG("client_auth->parent: %p", client_auth->parent);

		//////
		// CHANGE PW, RESET COOKIE
	} else if (strncmp(client_auth->str_action, "change_pw", 10) == 0) {
		SNOTICE("REQUEST TYPE: PASSWORD CHANGE");
		client_auth->str_new_password =
			getpar(str_form_data, "password_new", int_query_length, &client_auth->int_new_password_length);
		SFINISH_CHECK(client_auth->str_new_password != NULL, "getpar failed");
		client_auth->str_old_check_password =
			getpar(str_form_data, "password_old", int_query_length, &client_auth->int_old_check_password_length);
		SFINISH_CHECK(client_auth->str_old_check_password != NULL, "getpar failed");

		SDEBUG("client_auth->parent->str_request: %s", client_auth->parent->str_request);
		size_t int_temp = 0;
		SFINISH_SNCAT(str_cookie_name, &int_temp, "envelope", (size_t)8);

		SFREE_PWORD(str_form_data);
		client_auth->str_cookie_encrypted = str_cookie(client_auth->parent->str_request, client_auth->parent->int_request_len, str_cookie_name, &client_auth->int_cookie_encrypted_len);
		SFINISH_CHECK(client_auth->str_cookie_encrypted != NULL, "str_cookie failed");
		int_cookie_len = client_auth->int_cookie_encrypted_len;
		str_cookie_decrypted = aes_decrypt(client_auth->str_cookie_encrypted, &int_cookie_len);
		SFREE(client_auth->str_cookie_encrypted);
		client_auth->str_user = getpar(str_cookie_decrypted, "username", int_cookie_len, &client_auth->int_user_length);
		client_auth->str_password = getpar(str_cookie_decrypted, "password", int_cookie_len, &client_auth->int_password_length);
		str_expiration = getpar(str_cookie_decrypted, "expiration", int_cookie_len, &int_expiration_len);

		SFINISH_SNCAT(client_auth->str_connname, &client_auth->int_conn_length, "", (size_t)0);
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
			"&connname=", (size_t)10,
			client_auth->str_connname, client_auth->int_connname_length,
			"&password=", (size_t)10,
			str_uri_new_password, int_uri_new_password_len,
			"&expiration=", (size_t)12,
			str_uri_expiration, int_uri_expiration_len,
			"&dbname=", (size_t)8,
			client_auth->str_database, client_auth->int_dbname_length,
			"&sessionid=", (size_t)11,
			str_session_id, strlen(str_session_id)
		);

		if (client_auth->str_conn != NULL) {
			SFINISH_SNFCAT(str_new_cookie, &int_cookie_len, "&conn=", (size_t)6, client_auth->str_conn, client_auth->int_conn_length);
		}

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

		SNOTICE("REQUEST USERNAME: %s", client_auth->str_user);

		SFINISH_CHECK(client_auth->str_conn != NULL || exists_connection_info(client_auth->str_connname),
			"There is no connection info with that name.");

		if (client_auth->str_conn != NULL) {
			SFINISH_SNCAT(str_conn, &client_auth->int_conn_length, client_auth->str_conn, client_auth->int_conn_length);
		} else {
			char *str_temp = get_connection_info(client_auth->str_connname, &client_auth->int_connection_index);
			size_t int_temp = strlen(str_temp);
#ifdef ENVELOPE_INTERFACE_LIBPQ
			if (client_auth->str_database != NULL) {
				SFINISH_SNCAT(str_conn, &client_auth->int_conn_length, str_temp, int_temp, " dbname=", (size_t)8, client_auth->str_database, strlen(client_auth->str_database));
			} else {
				SFINISH_SNCAT(str_conn, &client_auth->int_conn_length, str_temp, int_temp);
			}
#else
			SFINISH_SNCAT(str_conn, &client_auth->int_conn_length, str_temp, int_temp);
#endif
			SFINISH_SALLOC(client_auth->str_int_connection_index, 20);
			snprintf(client_auth->str_int_connection_index, 20, "%zu", client_auth->int_connection_index);
		}

#ifdef ENVELOPE_INTERFACE_LIBPQ
		if (bol_global_set_user) {
			// The only difference here is the callback and no user/pw
			SFINISH_CHECK((client_auth->parent->conn = DB_connect(global_loop, client_auth, str_conn, NULL,
				0, NULL, 0, "",
				http_auth_login_step15)) != NULL,
				"DB_connect failed");
		} else {
#endif
		SFINISH_CHECK((client_auth->parent->conn = DB_connect(global_loop, client_auth, str_conn, client_auth->str_user,
			client_auth->int_user_length, client_auth->str_password, client_auth->int_password_length, "",
			http_auth_change_pw_step2)) != NULL,
			"DB_connect failed");
#ifdef ENVELOPE_INTERFACE_LIBPQ
		}
#endif

	} else if (strncmp(client_auth->str_action, "logout", 7) == 0) {
		SNOTICE("REQUEST TYPE: LOGOUT " SUN_PROGRAM_LOWER_NAME "");

		str_error = getpar(str_form_data, "error", int_query_length, &int_error_len);
		str_error_uri = snuri(str_error, int_error_len, &int_error_uri_len);

		size_t int_temp = 0;
		SFINISH_SNCAT(str_cookie_name, &int_temp, "envelope", 8);

		client_auth->str_cookie_encrypted = str_cookie(client_auth->parent->str_request, client_auth->parent->int_request_len, str_cookie_name, &client_auth->int_cookie_encrypted_len);
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
						strcmp(other_client->str_client_ip, client_auth->parent->str_client_ip) == 0) {
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
		char *str_temp1 =
			"HTTP/1.1 303 See Other\015\012"
			"Server: " SUN_PROGRAM_LOWER_NAME "\015\012"
			"Connection: close\015\012"
			"Set-Cookie: envelope=";
		size_t int_temp1 = strlen(str_temp1);
		char *str_temp2 =
			"; path=/; expires=Tue, 01 Jan 1990 00:00:00 GMT"
			"; HttpOnly\015\012"
			"Location: /index.html";
		size_t int_temp2 = strlen(str_temp2);
		SFINISH_SNCAT(
			str_response, &int_response_len,
			str_temp1, int_temp1,
			str_temp2, int_temp2,
			int_error_uri_len > 0 ? "?error=" : "", int_error_uri_len > 0 ? (size_t)7 : (size_t)0,
			int_error_uri_len > 0 ? str_error_uri : "", int_error_uri_len,
			"\015\012\015\012", (size_t)4
		);
		SFREE_PWORD(str_form_data);
	} else {
		SNOTICE("REQUEST TYPE: Not a valid action.");

		char *str_temp =
			"HTTP/1.1 500 Internal Server Error\015\012"
			"Server: " SUN_PROGRAM_LOWER_NAME "\015\012"
			"Connection: close\015\012\015\012"
			"Not a valid action.";
		SFINISH_SNCAT(str_response, &int_response_len, str_temp, strlen(str_temp));

		SFREE_PWORD(str_form_data);
	}
	bol_error_state = false;
finish:
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

	ssize_t int_write_len = 0;
	if (bol_error_state == true) {
		SDEBUG("str_response: %s", str_response);
		char *_str_response = str_response;
		char str_length[50];
		snprintf(str_length, 50, "%zu", (int_response_len != 0 ? int_response_len : strlen(_str_response)));
		char *str_temp =
			"HTTP/1.1 500 Internal Server Error\015\012"
			"Server: " SUN_PROGRAM_LOWER_NAME "\015\012"
			"Connection: close\015\012"
			"Content-Length: ";
		SFINISH_SNCAT(
			str_response, &int_response_len,
			str_temp, strlen(str_temp),
			str_length, strlen(str_length),
			"\015\012\015\012", (size_t)4,
			_str_response, (int_response_len != 0 ? int_response_len : strlen(_str_response))
		);
		SFREE(_str_response);
	}

	if (str_response != NULL) {
		if ((int_write_len = write(client_auth->parent->int_sock, str_response, (int_response_len != 0 ? int_response_len : strlen(str_response)))) < 0) {
			SERROR_NORESPONSE("write() failed");
		}
		SFREE(str_response);

		struct sock_ev_client *client = client_auth->parent;
		SERROR_CLIENT_CLOSE_NORESPONSE(client);
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
	ssize_t int_len2 = 0;
	if (bol_error_state == true) {
		SDEBUG("str_response: %s", str_response);
		char *_str_response = str_response;
		char str_length[50];
		snprintf(str_length, 50, "%zu", (int_response_len != 0 ? int_response_len : strlen(_str_response)));
		char *str_temp =
			"HTTP/1.1 500 Internal Server Error\015\012"
			"Server: " SUN_PROGRAM_LOWER_NAME "\015\012"
			"Connection: close\015\012"
			"Content-Length: ";
		SFINISH_SNCAT(
			str_response, &int_response_len,
			str_temp, strlen(str_temp),
			str_length, strlen(str_length),
			"\015\012\015\012", (size_t)4,
			_str_response, (int_response_len != 0 ? int_response_len : strlen(_str_response))
		);
		SFREE(_str_response);
	}
	if (str_response != NULL) {
		if ((int_len2 = write(client_auth->parent->int_sock, str_response, (int_response_len != 0 ? int_response_len : strlen(str_response)))) < 0) {
			SERROR_NORESPONSE("write() failed");
		}
		SFREE(str_response);

		struct sock_ev_client *client = client_auth->parent;
		SERROR_CLIENT_CLOSE_NORESPONSE(client);
	}
	bol_error_state = false;
	SFREE_ALL();
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

finish:
	DB_free_result(res);
	if (arr_row_values != NULL) {
		DArray_clear_destroy(arr_row_values);
	}
	if (arr_row_lengths != NULL) {
		DArray_clear_destroy(arr_row_lengths);
	}
	SFREE_ALL();

	ssize_t int_len = 0;

	if (bol_error_state == true) {
		SDEBUG("str_response: %s", str_response);
		char *_str_response = str_response;
		char str_length[50];
		snprintf(str_length, 50, "%zu", strlen(_str_response));
		char *str_temp =
			"HTTP/1.1 500 Internal Server Error\015\012"
			"Server: " SUN_PROGRAM_LOWER_NAME "\015\012"
			"Connection: close\015\012"
			"Content-Length: ";
		SFINISH_SNCAT(
			str_response, &int_response_len,
			str_temp, strlen(str_temp),
			str_length, strlen(str_length),
			"\015\012\015\012", (size_t)4,
			_str_response, (int_response_len != 0 ? int_response_len : strlen(_str_response))
		);
		SFREE(_str_response);
		if (client_auth->parent->conn->str_response != NULL && client_auth->parent->conn->str_response[0] != 0) {
			SFINISH_SNFCAT(
				str_response, &int_response_len,
				":\n", (size_t)2,
				client_auth->parent->conn->str_response, strlen(client_auth->parent->conn->str_response)
			);
		}
		SFREE(client_auth->parent->conn->str_response);
	}

	if (str_response != NULL) {
		if ((int_len = write(client_auth->parent->int_sock, str_response, (int_response_len != 0 ? int_response_len : strlen(str_response)))) < 0) {
			SERROR_NORESPONSE("write() failed");
		}
		SFREE(str_response);

		struct sock_ev_client *client = client_auth->parent;
		SERROR_CLIENT_CLOSE_NORESPONSE(client);
	}

	bol_error_state = false;
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

	bol_error_state = false;
	SDEBUG("client_auth->str_action: %s", client_auth->str_action);
	if (strncmp(client_auth->str_action, "login", 6) == 0) {
		SDEBUG("CALLING NEXT LOGIN STEP");
		http_auth_login_step2(EV_A, client_auth, client_auth->parent->conn);
	} else if (strncmp(client_auth->str_action, "change_pw", 10) == 0) {
		SDEBUG("CALLING NEXT CHANGE PASSWORD STEP");
		http_auth_change_pw_step2(EV_A, client_auth, client_auth->parent->conn);
	}

finish:
	DB_free_result(res);
	SFREE_ALL();

	ssize_t int_len = 0;

	if (bol_error_state == true) {
		SDEBUG("str_response: %s", str_response);
		char *_str_response = str_response;
		char str_length[50];
		snprintf(str_length, 50, "%zu", strlen(_str_response));
		char *str_temp =
			"HTTP/1.1 500 Internal Server Error\015\012"
			"Server: " SUN_PROGRAM_LOWER_NAME "\015\012"
			"Connection: close\015\012"
			"Content-Length: ";
		SFINISH_SNCAT(
			str_response, &int_response_len,
			str_temp, strlen(str_temp),
			str_length, strlen(str_length),
			"\015\012\015\012", (size_t)4,
			_str_response, (int_response_len != 0 ? int_response_len : strlen(_str_response))
		);
		SFREE(_str_response);
		if (client_auth->parent->conn->str_response != NULL && client_auth->parent->conn->str_response[0] != 0) {
			SFINISH_SNFCAT(
				str_response, &int_response_len,
				":\n", (size_t)2,
				client_auth->parent->conn->str_response, strlen(client_auth->parent->conn->str_response)
			);
		}
		SFREE(client_auth->parent->conn->str_response);
	}

	if (str_response != NULL) {
		if ((int_len = write(client_auth->parent->int_sock, str_response, (int_response_len != 0 ? int_response_len : strlen(str_response)))) < 0) {
			SERROR_NORESPONSE("write() failed");
		}
		SFREE(str_response);

		struct sock_ev_client *client = client_auth->parent;
		SERROR_CLIENT_CLOSE_NORESPONSE(client);
	}

	bol_error_state = false;
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
			"SELECT CASE WHEN rolsuper THEN 'TRUE' ELSE 'FALSE' END AS result "
			"FROM pg_catalog.pg_roles WHERE rolname = ";
		char *str_temp2 =
			" UNION ALL "
			"SELECT CASE WHEN count(pg_roles.rolname) > 0 THEN 'TRUE' ELSE 'FALSE' "
			"END "
			"FROM pg_user "
			"LEFT JOIN pg_auth_members on pg_user.usesysid = pg_auth_members.member "
			"LEFT JOIN pg_roles on pg_roles.oid = pg_auth_members.roleid "
			"WHERE pg_user.usename = ";
		SFINISH_SNCAT(
			str_sql, &int_temp,
			str_temp1, strlen(str_temp1),
			str_user_literal, int_user_literal_len,
			str_temp2, strlen(str_temp2),
			str_user_literal, int_user_literal_len,
			" AND pg_roles.rolname = ", (size_t)24,
			str_group_literal, int_group_literal_len
		);
	} else if (DB_connection_driver(client_auth->parent->conn) == DB_DRIVER_SQL_SERVER) {
		size_t int_temp = 0;
		char *str_temp1 =
			"SELECT CASE WHEN IS_SRVROLEMEMBER('sysadmin') = 1 THEN 'TRUE' ELSE 'FALSE' END"
			" UNION ALL SELECT CASE WHEN IS_MEMBER(";
		char *str_temp2 =
			") = 1 THEN 'TRUE' ELSE 'FALSE' END;";
		SFINISH_SNCAT(
			str_sql, &int_temp,
			str_temp1, strlen(str_temp1),
			str_group_literal, int_group_literal_len,
			str_temp2, strlen(str_temp2)
		);
	} else {
		char *str_temp1 =
			"HTTP/1.1 200 OK\015\012"
			"Server: " SUN_PROGRAM_LOWER_NAME "\015\012"
			"Connection: close\015\012"
			"Set-Cookie: envelope=";
		char *str_temp2 =
			"; HttpOnly;\015\012Set-Cookie: DB=SS; path=/;\015\012Content-Length: 48\015\012\015\012"
			"{\"stat\": true, \"dat\": \"/env/app/all/index.html\"}";
		str_expires = str_expire_one_day();
		SFINISH_SNCAT(
			str_response, &int_response_len,
			str_temp1, strlen(str_temp1),
			client_auth->str_cookie_encrypted,
			"; path=/; expires=",
			str_expires, strlen(str_expires),
			str_temp2, strlen(str_temp2)
		);

		struct sock_ev_client *client = client_auth->parent;
		size_t int_i, int_len;
		client->int_last_activity_i = -1;
		struct sock_ev_client_last_activity *client_last_activity;
		for (int_i = 0, int_len = DArray_end(client->server->arr_client_last_activity); int_i < int_len; int_i += 1) {
			client_last_activity =
				(struct sock_ev_client_last_activity *)DArray_get(client->server->arr_client_last_activity, int_i);
			if (client_last_activity != NULL &&
				strncmp(client_last_activity->str_client_ip, client->str_client_ip, INET_ADDRSTRLEN) == 0 &&
				strncmp(client_last_activity->str_cookie, client_auth->str_cookie_encrypted,
					client_auth->int_cookie_encrypted_len) == 0) {
				client->int_last_activity_i = (ssize_t)int_i;
				break;
			}
		}
		if (client->int_last_activity_i == -1) {
			SFINISH_SALLOC(client_last_activity, sizeof(struct sock_ev_client_last_activity));
			memcpy(client_last_activity->str_client_ip, client_auth->parent->str_client_ip, INET_ADDRSTRLEN);
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
	SFREE(conn->str_response);
	ssize_t int_len = 0;
	if (bol_error_state == true) {
		SDEBUG("str_response: %s", str_response);
		char *_str_response = str_response;
		char str_length[50];
		snprintf(str_length, 50, "%zu", (int_response_len != 0 ? int_response_len : strlen(_str_response)));
		char *str_temp =
			"HTTP/1.1 500 Internal Server Error\015\012"
			"Server: " SUN_PROGRAM_LOWER_NAME "\015\012"
			"Connection: close\015\012"
			"Content-Length: ";
		SFINISH_SNCAT(
			str_response, &int_response_len,
			str_temp, strlen(str_temp),
			str_length, strlen(str_length),
			"\015\012\015\012", (size_t)4,
			_str_response, (int_response_len != 0 ? int_response_len : strlen(_str_response))
		);
		SFREE(_str_response);
	}
	if (str_response != NULL) {
		if ((int_len = write(client_auth->parent->int_sock, str_response, (int_response_len != 0 ? int_response_len : strlen(str_response)))) < 0) {
			SERROR_NORESPONSE("write() failed");
		}
		SFREE(str_response);

		struct sock_ev_client *client = client_auth->parent;
		SERROR_CLIENT_CLOSE_NORESPONSE(client);
	}
	bol_error_state = false;
	SFREE_ALL();
}

bool http_auth_login_step3(EV_P, void *cb_data, DB_result *res) {
	struct sock_ev_client_request *client_request = cb_data;
	struct sock_ev_client_auth *client_auth = (struct sock_ev_client_auth *)(client_request->client_request_data);
	SDEFINE_VAR_ALL(str_user_literal, str_temp1, str_expires, str_int_len);
	SDEFINE_VAR_MORE(str_content_length, str_connstring, str_user, str_open);
	SDEFINE_VAR_MORE(str_closed, str_temp_connstring, str_rolsuper, str_rolgroup, str_temp);
	char *str_response = NULL;
	DArray *arr_row_values = NULL;
	DArray *arr_row_lengths = NULL;
	size_t int_temp = 0;
	size_t int_response_len = 0;
	DB_fetch_status status = 0;
	SDEBUG("http_auth_login_step3");

	SFINISH_CHECK(res != NULL, "DB_exec failed");
	SFINISH_CHECK(res->status == DB_RES_TUPLES_OK, "DB_exec failed");

	SFINISH_CHECK((status = DB_fetch_row(res)) == DB_FETCH_OK, "DB_fetch_row failed");
	arr_row_values = DB_get_row_values(res);
	arr_row_lengths = DB_get_row_lengths(res);

	SFINISH_SNCAT(str_rolsuper, &int_temp, DArray_get(arr_row_values, 0), *(size_t *)DArray_get(arr_row_lengths, 0));

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
		char *str_temp1 = "{\"stat\": false, \"dat\": \"You must login as a super user to use " SUN_PROGRAM_WORD_NAME ". If you would like to use a non-superuser role, change the `super_only` parameter to false in envelope.conf\"}";
		SFINISH_SNCAT(str_temp, &int_temp, str_temp1, strlen(str_temp1));
		char str_length[50];
		snprintf(str_length, 50, "%zu", strlen(str_temp));
		str_temp1 =
			"HTTP/1.1 403 Forbidden\015\012"
			"Server: " SUN_PROGRAM_LOWER_NAME "\015\012"
			"Connection: close\015\012"
			"Content-Length: ";
		SFINISH_SNCAT(
			str_response, &int_response_len,
			str_temp1, strlen(str_temp1),
			str_length, strlen(str_length),
			"\015\012\015\012", (size_t)4,
			str_temp, strlen(str_temp)
		);
		SFREE(str_temp);
	} else if (str_global_login_group != NULL && strncmp(str_rolgroup, "FALSE", 5) == 0) {
		size_t int_content_length = 76 + strlen(str_global_login_group) + strlen(SUN_PROGRAM_WORD_NAME);
		// 255 chars should be enough
		SFINISH_SALLOC(str_content_length, 255 + 1);
		snprintf(str_content_length, 255, "%zu", int_content_length);
		str_content_length[255] = 0;

		char *str_temp1 =
			"HTTP/1.1 403 Forbidden\015\012"
			"Server: " SUN_PROGRAM_LOWER_NAME "\015\012"
			"Connection: close\015\012"
			"Content-Length: ";
		char *str_temp2 =
			"{\"stat\": false, \"dat\": \"You must login as a member "
			"of the group '";
		char *str_temp3 =
			"' to use " SUN_PROGRAM_WORD_NAME "\"}";
		SFINISH_SNCAT(
			str_response, &int_response_len,
			str_temp1, strlen(str_temp1),
			str_content_length, strlen(str_content_length),
			"\015\012\015\012", (size_t)4,
			str_temp2, strlen(str_temp2),
			str_global_login_group, strlen(str_global_login_group),
			str_temp3, strlen(str_temp3)
		);

		SFREE(str_content_length);
	} else {
		str_expires = str_expire_one_day();
		char *str_temp1 =
			"HTTP/1.1 200 OK\015\012"
			"Server: " SUN_PROGRAM_LOWER_NAME "\015\012"
			"Connection: close\015\012"
			"Set-Cookie: envelope=";
		char *str_temp2 =
			"; HttpOnly;\015\012Set-Cookie: DB=";
		char *str_temp3 =
			"; path=/;\015\012Content-Length: 48\015\012\015\012"
			"{\"stat\": true, \"dat\": \"/env/app/all/index.html\"}";
		SFINISH_SNCAT(
			str_response, &int_response_len,
			str_temp1, strlen(str_temp1),
			client_auth->str_cookie_encrypted, client_auth->int_cookie_encrypted_len,
			"; path=/; expires=", (size_t)18,
			str_expires, strlen(str_expires),
			str_temp2, strlen(str_temp2),
			(DB_connection_driver(client_auth->parent->conn) == DB_DRIVER_POSTGRES ? "PG" : "SS"), (size_t)2,
			str_temp3, strlen(str_temp3)
		);
		SFREE(str_expires);

		struct sock_ev_client *client = client_auth->parent;
		size_t int_i, int_len;
		client->int_last_activity_i = -1;
		struct sock_ev_client_last_activity *client_last_activity;
		for (int_i = 0, int_len = DArray_end(client->server->arr_client_last_activity); int_i < int_len; int_i += 1) {
			client_last_activity =
				(struct sock_ev_client_last_activity *)DArray_get(client->server->arr_client_last_activity, int_i);
			if (client_last_activity != NULL &&
				strncmp(client_last_activity->str_client_ip, client->str_client_ip, INET_ADDRSTRLEN) == 0 &&
				strncmp(client_last_activity->str_cookie, client_auth->str_cookie_encrypted,
					client_auth->int_cookie_encrypted_len) == 0) {
				client->int_last_activity_i = (ssize_t)int_i;
				break;
			}
		}
		if (client->int_last_activity_i == -1) {
			SFINISH_SALLOC(client_last_activity, sizeof(struct sock_ev_client_last_activity));
			memcpy(client_last_activity->str_client_ip, client_auth->parent->str_client_ip, INET_ADDRSTRLEN);
			SFINISH_SNCAT(client_last_activity->str_cookie, &int_temp, client_auth->str_cookie_encrypted, client_auth->int_cookie_encrypted_len);
			client_last_activity->last_activity_time = ev_now(EV_A);
			client_auth->parent->int_last_activity_i =
				(ssize_t)DArray_push(client_auth->parent->server->arr_client_last_activity, client_last_activity);
		}
		SDEBUG("" SUN_PROGRAM_LOWER_NAME " COOKIE SET");
	}

	SDEBUG("str_response: %s", str_response);
	SDEBUG("LOGIN END");

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

	ssize_t int_len = 0;

	if (bol_error_state == true) {
		SDEBUG("str_response: %s", str_response);
		char *_str_response = str_response;
		str_response = DB_get_diagnostic(client_request->parent->conn, res);
		int_response_len = strlen(_str_response);
		SFINISH_SNFCAT(_str_response, &int_response_len, ":\n", (size_t)2, str_response, strlen(str_response));
		SFREE(str_response);
		char str_length[50];
		snprintf(str_length, 50, "%zu", strlen(_str_response));
		char *str_temp =
			"HTTP/1.1 500 Internal Server Error\015\012"
			"Server: " SUN_PROGRAM_LOWER_NAME "\015\012"
			"Connection: close\015\012"
			"Content-Length: ";
		SFINISH_SNCAT(
			str_response, &int_response_len,
			str_temp, strlen(str_temp),
			str_length, strlen(str_length),
			"\015\012\015\012", (size_t)4,
			_str_response, (int_response_len != 0 ? int_response_len : strlen(_str_response))
		);
		SFREE(_str_response);
		if (client_request->parent->conn->str_response != NULL && client_request->parent->conn->str_response[0] != 0) {
			SFINISH_SNFCAT(
				str_response, &int_response_len,
				":\n", (size_t)2,
				client_request->parent->conn->str_response, strlen(client_request->parent->conn->str_response)
			);
		}
		SFREE(client_request->parent->conn->str_response);
	}

	if ((int_len = write(client_auth->parent->int_sock, str_response, strlen(str_response))) < 0) {
		SERROR_NORESPONSE("write() failed");
	}
	SFREE(str_response);
	struct sock_ev_client *client = client_request->parent;
	SFINISH_CLIENT_CLOSE(client);

	bol_error_state = false;
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

	if (str_response != NULL) {
		SDEBUG("str_response: %s", str_response);
		char *_str_response = str_response;
		char str_length[50];
		ssize_t int_len = 0;
		snprintf(str_length, 50, "%zu", strlen(_str_response));
		char *str_temp =
			"HTTP/1.1 500 Internal Server Error\015\012"
			"Server: " SUN_PROGRAM_LOWER_NAME "\015\012"
			"Connection: close\015\012"
			"Content-Length: ";
		SFINISH_SNCAT(
			str_response, &int_response_len,
			str_temp, strlen(str_temp),
			str_length, strlen(str_length),
			"\015\012\015\012", (size_t)4,
			_str_response, strlen(_str_response)
		);
		SFREE(_str_response);
		if ((int_len = write(client_auth->parent->int_sock, str_response, int_response_len)) < 0) {
			SERROR_NORESPONSE("write() failed");
		}
		// This prevents an infinite loop if CLIENT_CLOSE fails
		SFREE(str_response);
		struct sock_ev_client *client = client_auth->parent;
		SFINISH_CLIENT_CLOSE(client);
	}
	bol_error_state = false;
}

bool http_auth_change_pw_step3(EV_P, void *cb_data, DB_result *res) {
	struct sock_ev_client_request *client_request = cb_data;
	struct sock_ev_client_auth *client_auth = (struct sock_ev_client_auth *)(client_request->client_request_data);
	char *str_response = NULL;
	size_t int_response_len = 0;
	size_t int_temp = 0;
	SDEFINE_VAR_ALL(str_expires);

	SDEBUG("res->status: %d", res->status);

	SFINISH_CHECK(res != NULL, "DB_exec failed");
	SFINISH_CHECK(res->status == DB_RES_COMMAND_OK, "DB_exec failed");

	DB_free_result(res);

	size_t int_len = 0, int_i = 0;

	SDEBUG("PASSWORD CHANGE");
	str_expires = str_expire_one_day();

	char *str_temp1 =
		"HTTP/1.1 200 OK\015\012"
		"Server: " SUN_PROGRAM_LOWER_NAME "\015\012Content-Type: application/json; charset=UTF-8\015\012"
			"Connection: close\015\012"
		"Set-Cookie: envelope=";
	char *str_temp2 = "; HttpOnly\015\012\015\012{\"stat\": true, \"dat\": \"OK\"}";
	SFINISH_SNCAT(str_response, &int_response_len,
		str_temp1, strlen(str_temp1),
		client_auth->str_cookie_encrypted, client_auth->int_cookie_encrypted_len,
		"; path=/; expires=", (size_t)18,
		str_expires, strlen(str_expires),
		str_temp2, strlen(str_temp2));

	client_auth->parent->int_last_activity_i = -1;
	for (int_i = 0, int_len = DArray_end(client_auth->parent->server->arr_client_last_activity); int_i < int_len; int_i += 1) {
		struct sock_ev_client_last_activity *client_last_activity =
			(struct sock_ev_client_last_activity *)DArray_get(client_auth->parent->server->arr_client_last_activity, int_i);
		if (client_last_activity &&
			strncmp(client_last_activity->str_client_ip, client_auth->parent->str_client_ip, INET_ADDRSTRLEN) == 0 &&
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
		memcpy(client_last_activity->str_client_ip, client_auth->parent->str_client_ip, INET_ADDRSTRLEN);
		SFINISH_SNCAT(client_last_activity->str_cookie, &int_temp, client_auth->str_cookie_encrypted, client_auth->int_cookie_encrypted_len);
		client_last_activity->last_activity_time = ev_now(EV_A);
		client_auth->parent->int_last_activity_i =
			(ssize_t)DArray_push(client_auth->parent->server->arr_client_last_activity, client_last_activity);
		SDEBUG("New cookie is %s", client_last_activity->str_cookie);
	}

	bol_error_state = false;
finish:
	SFREE_ALL();

	if (bol_error_state == true) {
		SDEBUG("str_response: %s", str_response);
		char *_str_response = str_response;
		str_response = DB_get_diagnostic(client_request->parent->conn, res);
		int_response_len = strlen(_str_response);
		SFINISH_SNFCAT(_str_response, &int_response_len, ":\n", (size_t)2, str_response, strlen(str_response));
		SFREE(str_response);
		char str_length[50];
		snprintf(str_length, 50, "%zu", strlen(_str_response));
		char *str_temp =
			"HTTP/1.1 500 Internal Server Error\015\012"
			"Server: " SUN_PROGRAM_LOWER_NAME "\015\012"
			"Connection: close\015\012"
			"Content-Length: ";
		SFINISH_SNCAT(
			str_response, &int_response_len,
			str_temp, strlen(str_temp),
			str_length, strlen(str_length),
			"\015\012\015\012", (size_t)4,
			_str_response, int_response_len
		);
		SFREE(_str_response);
	}
	DB_free_result(res);

	if (write(client_auth->parent->int_sock, str_response, int_response_len) < 0) {
		SERROR_NORESPONSE("write() failed");
	}
	SFREE(str_response);
	struct sock_ev_client *client = client_request->parent;
	client_request_free(client_request);
	SFINISH_CLIENT_CLOSE(client);
	bol_error_state = false;
	// This causes query_callback to stop looping
	return true;
}

void http_auth_change_database_step2(EV_P, void *cb_data, DB_conn *conn) {
	struct sock_ev_client_auth *client_auth = cb_data;
	SDEFINE_VAR_ALL(str_expires, str_temp1, str_user, str_open, str_closed);
	char *str_response = NULL;
	size_t int_response_len = 0;
	size_t int_temp = 0;

	SFINISH_CHECK(conn->int_status == 1, "%s", conn->str_response);

	size_t int_len = 0, int_i = 0;

	SDEBUG("DATABASE CHANGE");
	str_expires = str_expire_one_day();

	char *str_temp2 =
		"HTTP/1.1 200 OK\015\012"
		"Server: " SUN_PROGRAM_LOWER_NAME "\015\012"
			"Connection: close\015\012"
		"Content-Type: application/json; charset=UTF-8\015\012"
		"Set-Cookie: envelope=";
	char *str_temp3 =
		"; HttpOnly\015\012"
		"Content-Length: 27\015\012\015\012"
		"{\"stat\": true, \"dat\": \"OK\"}";
	SFINISH_SNFCAT(
		str_response, &int_response_len,
		str_temp2, strlen(str_temp2),
		client_auth->str_cookie_encrypted, client_auth->int_cookie_encrypted_len,
		"; path=/; expires=", (size_t)18,
		str_expires, strlen(str_expires),
		str_temp3, strlen(str_temp3)
	);

	client_auth->parent->int_last_activity_i = -1;
	for (int_i = 0, int_len = DArray_end(client_auth->parent->server->arr_client_last_activity); int_i < int_len; int_i += 1) {
		struct sock_ev_client_last_activity *client_last_activity =
			(struct sock_ev_client_last_activity *)DArray_get(client_auth->parent->server->arr_client_last_activity, int_i);
		if (client_last_activity &&
			strncmp(client_last_activity->str_client_ip, client_auth->parent->str_client_ip, INET_ADDRSTRLEN) == 0 &&
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
		memcpy(client_last_activity->str_client_ip, client_auth->parent->str_client_ip, INET_ADDRSTRLEN);
		SFINISH_SNCAT(client_last_activity->str_cookie, &int_temp, client_auth->str_cookie_encrypted, client_auth->int_cookie_encrypted_len);
		client_last_activity->last_activity_time = ev_now(EV_A);
		client_auth->parent->int_last_activity_i =
			(ssize_t)DArray_push(client_auth->parent->server->arr_client_last_activity, client_last_activity);
		SDEBUG("New cookie is %s", client_last_activity->str_cookie);
	}

	SFINISH_SNCAT(
		client_auth->parent->str_connname_folder, &int_temp,
		client_auth->str_connname, client_auth->int_connname_length,
		"_", (size_t)1,
		client_auth->str_database, strlen(client_auth->str_database)
	);
	if (client_auth->str_conn != NULL) {
		SFINISH_SNFCAT(
			client_auth->parent->str_connname_folder, &int_temp,
			"_", (size_t)1,
			client_auth->str_conn, client_auth->int_conn_length
		);
	}
	int_i = 0;
	int_len = strlen(client_auth->parent->str_connname_folder);
	while (int_i < int_len) {
		if (!isalnum(client_auth->parent->str_connname_folder[int_i])) {
			client_auth->parent->str_connname_folder[int_i] = '_';
		}

		int_i++;
	}

	str_temp1 = client_auth->str_user;
	SFINISH_CHECK((client_auth->str_user = snuri(str_temp1, client_auth->int_user_length, &client_auth->int_user_length)) != NULL, "snuri failed");
	SFREE(str_temp1);

	SFINISH_SNCAT(
		str_user, &int_temp,
		client_auth->parent->str_connname_folder, strlen(client_auth->parent->str_connname_folder),
		"/", (size_t)1,
		client_auth->str_user, client_auth->int_user_length
	);
	SFINISH_SNCAT(
		str_open, &int_temp,
		client_auth->parent->str_connname_folder, strlen(client_auth->parent->str_connname_folder),
		"/", (size_t)1,
		client_auth->str_user, client_auth->int_user_length,
		"/open", (size_t)5
	);
	SFINISH_SNCAT(
		str_closed, &int_temp,
		client_auth->parent->str_connname_folder, strlen(client_auth->parent->str_connname_folder),
		"/", (size_t)1,
		client_auth->str_user, client_auth->int_user_length,
		"/closed", (size_t)7
	);

	bol_error_state = false;
finish:

	SFREE_ALL();

	if (bol_error_state == true) {
		SDEBUG("str_response: %s", str_response);
		char *_str_response = str_response;
		char str_length[50];
		snprintf(str_length, 50, "%zu", strlen(_str_response));
		char *str_temp =
			"HTTP/1.1 500 Internal Server Error\015\012"
			"Connection: close\015\012"
			"Server: " SUN_PROGRAM_LOWER_NAME "\015\012"
			"Content-Length: ";
		SFINISH_SNCAT(
			str_response, &int_response_len,
			str_temp, strlen(str_temp),
			str_length, strlen(str_length),
			"\015\012\015\012", (size_t)4,
			_str_response, (int_response_len != 0 ? int_response_len : strlen(_str_response))
		);
		SFREE(_str_response);
	}

	if (write(client_auth->parent->int_sock, str_response, int_response_len) < 0) {
		SERROR_NORESPONSE("write() failed");
	}
	SFREE(str_response);
	struct sock_ev_client *client = client_auth->parent;
	SFINISH_CLIENT_CLOSE(client);
	bol_error_state = false;
}

void http_auth_free(struct sock_ev_client_request_data *client_request_data) {
	struct sock_ev_client_auth *client_auth = (struct sock_ev_client_auth *)client_request_data;
	if (client_auth != NULL) {
		SFREE(client_auth->str_action);
		SFREE_PWORD(client_auth->str_cookie_encrypted);
		SFREE(client_auth->str_connname);
		SFREE(client_auth->str_conn);
		SFREE(client_auth->str_user);
		SFREE(client_auth->str_database);
		SFREE_PWORD(client_auth->str_old_check_password);
		SFREE_PWORD(client_auth->str_password);
		SFREE_PWORD(client_auth->str_new_password);
		SFREE_PWORD(client_auth->str_int_connection_index);
	}
}
