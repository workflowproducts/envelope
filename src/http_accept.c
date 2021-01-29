#include "http_accept.h"

void http_accept_step1(EV_P, struct sock_ev_client *client) {
	SDEFINE_VAR_ALL(str_uri, str_uri_temp, str_action_name, str_temp, str_args, str_sql);
	char *str_response = NULL;
	char *ptr_end_uri = NULL;
	size_t int_uri_len = 0;
	size_t int_args_len = 0;
	size_t int_temp_len = 0;
	size_t int_action_name_len = 0;
	size_t int_sql_len = 0;
	size_t int_response_len = 0;

	str_uri = str_uri_path(client->str_request, client->int_request_len, &int_uri_len);
	SFINISH_CHECK(str_uri != NULL, "str_uri_path failed");
	ptr_end_uri = strchr(str_uri, '?');
	if (ptr_end_uri != NULL) {
		*ptr_end_uri = 0;
		ptr_end_uri = strchr(ptr_end_uri + 1, '#');
		if (ptr_end_uri != NULL) {
			*ptr_end_uri = 0;
		}
	}

	str_args = query(client->str_request, client->int_request_len, &int_args_len);
	if (str_args == NULL) {
		SFINISH_SNCAT(str_args, &int_args_len,
			"", (size_t)0);
	}


	SDEBUG("str_args: %s", str_args);

	SFINISH_SNCAT(str_action_name, &int_action_name_len,
		str_uri + strlen("/env/"), strlen(str_uri + strlen("/env/")));
	char *ptr_end_action_name = strchr(str_action_name, '/');
	if (ptr_end_action_name != NULL) {
		int_action_name_len = (size_t)(ptr_end_action_name - str_action_name);
		*ptr_end_action_name = 0;
		SFINISH_SNCAT(str_temp, &int_temp_len,
			"/", (size_t)1,
			ptr_end_action_name + 1, strlen(ptr_end_action_name + 1));
		str_uri_temp = snuri(str_temp, int_temp_len, &int_temp_len);
		SFINISH_CHECK(str_uri_temp != NULL, "snuri failed");
		SFINISH_SNFCAT(str_args, &int_args_len,
			"&path=", (size_t)6,
			str_uri_temp, int_temp_len);
		SFREE(str_temp);
	}

	str_temp = str_args;
	str_args = DB_escape_literal(client->conn, str_temp, int_args_len);
	SFINISH_CHECK(str_args != NULL, "DB_escape_literal failed");
	int_args_len = strlen(str_args);

	SDEBUG("str_args: %s", str_args);

	if (DB_connection_driver(client->conn) == DB_DRIVER_POSTGRES) {
		SFINISH_SNCAT(str_sql, &int_sql_len,
			"SELECT ", (size_t)7,
			str_action_name, int_action_name_len,
			"(", (size_t)1,
			str_args, int_args_len,
			");", (size_t)2);
	} else {
		SFINISH_SNCAT(str_sql, &int_sql_len,
			"EXECUTE ", (size_t)8,
			str_action_name, int_action_name_len,
			" ", (size_t)1,
			str_args, int_args_len,
			";", (size_t)1);
	}
	SFINISH_CHECK(query_is_safe(str_sql), "SQL Injection detected");
	SFINISH_CHECK(DB_exec(EV_A, client->conn, client, str_sql, http_accept_step2), "DB_exec failed");
	SDEBUG("str_sql: %s", str_sql);

	bol_error_state = false;
finish:
	SFREE_ALL();
	if (bol_error_state) {
		bol_error_state = false;

        SFREE(client->str_http_header);
        SFINISH_CHECK(build_http_response(
                "500 Internal Server Error"
                , str_response, int_response_len
                , "text/plain"
                , NULL
                , &client->str_http_response, &client->int_http_response_len
            ), "build_http_response failed");
	}
    SFREE(str_response);
    // if client->str_http_header is non-empty, we are already taken care of
	if (client->str_http_response != NULL && client->str_http_header == NULL) {
		ev_io_stop(EV_A, &client->io);
		ev_io_init(&client->io, client_write_http_cb, client->io.fd, EV_WRITE);
        ev_io_start(EV_A, &client->io);
	}
}

bool http_accept_step2(EV_P, void *cb_data, DB_result *res) {
	struct sock_ev_client *client = cb_data;
	char *str_response = NULL;
	DArray *arr_row_values = NULL;
	DArray *arr_row_lengths = NULL;
	size_t int_response_len = 0;

	SFINISH_CHECK(res != NULL, "DB_exec failed");
	SFINISH_CHECK(res->status == DB_RES_TUPLES_OK, "DB_exec failed", res->status);

	SFINISH_CHECK(DB_fetch_row(res) == DB_FETCH_OK, "DB_fetch_row failed");
	arr_row_values = DB_get_row_values(res);
	SFINISH_CHECK(arr_row_values != NULL, "DB_get_row_values failed");
	arr_row_lengths = DB_get_row_lengths(res);
	SFINISH_CHECK(arr_row_lengths != NULL, "DB_get_row_lengths failed");

	client->str_http_response = DArray_get(arr_row_values, 0);
	SFINISH_CHECK(client->str_http_response != NULL, "Function returned null");
	SDEBUG("client->str_http_response: %s", client->str_http_response);
	SFINISH_CHECK(strncmp(client->str_http_response, "HTTP", 4) == 0, "Bad accept_ output: %s", client->str_http_response);
    client->int_http_response_len = (size_t)(*(ssize_t *)DArray_get(arr_row_lengths, 0));

	bol_error_state = false;
finish:
	if (arr_row_values != NULL) {
		// the value in this array is used as str_response in the struct
		DArray_destroy(arr_row_values);
	}
	if (arr_row_lengths != NULL) {
		// we copy the length into the struct, so we can free it in the array
		DArray_clear_destroy(arr_row_lengths);
	}
	if (bol_error_state) {
		bol_error_state = false;

		char *_str_response1 = str_response;
		char *_str_response2 = DB_get_diagnostic(client->conn, res);
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
                , &client->str_http_response, &client->int_http_response_len
            ), "build_http_response failed");
	}
	DB_free_result(res);
    SFREE(str_response);
    // if client->str_http_header is non-empty, we are already taken care of
	if (client->str_http_response != NULL && client->str_http_header == NULL) {
		ev_io_stop(EV_A, &client->io);
		ev_io_init(&client->io, client_write_http_cb, client->io.fd, EV_WRITE);
        ev_io_start(EV_A, &client->io);
	}
	return true;
}