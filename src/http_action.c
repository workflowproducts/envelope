#include "http_action.h"

void http_action_step1(EV_P, struct sock_ev_client *client) {
	SDEFINE_VAR_ALL(str_uri, str_uri_temp, str_action_name, str_temp, str_args, str_sql);
	char *str_response = NULL;
	char *ptr_end_uri = NULL;
	size_t int_uri_len = 0;
	size_t int_args_len = 0;
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

	str_temp = str_args;
	str_args = DB_escape_literal(client->conn, str_temp, int_args_len);
	int_args_len = strlen(str_args);
	SFINISH_CHECK(str_args != NULL, "DB_escape_literal failed");

	SDEBUG("str_args: %s", str_args);

	SFINISH_SNCAT(str_action_name, &int_action_name_len,
		str_uri + strlen("/env/"), strlen(str_uri + strlen("/env/")));
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
	SFINISH_CHECK(DB_exec(EV_A, client->conn, client, str_sql, http_action_step2), "DB_exec failed");
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

bool http_action_step2(EV_P, void *cb_data, DB_result *res) {
	struct sock_ev_client *client = cb_data;
	char *str_response = NULL;
	char *_str_response = NULL;
	size_t int_response_len = 0;
	size_t _int_response_len = 0;
	DArray *arr_row_values = NULL;
	DArray *arr_row_lengths = NULL;

	SFINISH_CHECK(res != NULL, "DB_exec failed, res == NULL");
	SFINISH_CHECK(res->status == DB_RES_TUPLES_OK, "DB_exec failed, res->status == %d", res->status);

	SFINISH_CHECK(DB_fetch_row(res) == DB_FETCH_OK, "DB_fetch_row failed");
	arr_row_values = DB_get_row_values(res);
	SFINISH_CHECK(arr_row_values != NULL, "DB_get_row_values failed");
	arr_row_lengths = DB_get_row_lengths(res);
	SFINISH_CHECK(arr_row_lengths != NULL, "DB_get_row_lengths failed");

	_str_response = DArray_get(arr_row_values, 0);
	_int_response_len = (size_t)(*(ssize_t *)DArray_get(arr_row_lengths, 0));
	if (_str_response == NULL) {
		SFINISH_SNCAT(_str_response, &_int_response_len, "null", 4);
	}
	SFINISH_SNCAT(str_response, &int_response_len,
		"{\"stat\":true, \"dat\": ",
		strlen("{\"stat\":true, \"dat\": "),
		_str_response, _int_response_len,
		"}", (size_t)1);
	SFREE(_str_response);
	SDEBUG("str_response: %s", str_response);

    SFINISH_CHECK(build_http_response(
            "200 OK"
            , str_response, int_response_len
            , "application/json"
            , NULL
            , &client->str_http_response, &client->int_http_response_len
        ), "build_http_response failed");

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

        SFREE(client->str_http_header);
        SFINISH_CHECK(build_http_response(
                "500 Internal Server Error"
                , str_response, int_response_len
                , "text/plain"
                , NULL
                , &client->str_http_response, &client->int_http_response_len
            ), "build_http_response failed");
	}
	SFREE(_str_response);
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
