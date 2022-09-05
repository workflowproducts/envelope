#include "http_delete.h"

void http_delete_step1(EV_P, struct sock_ev_client *client) {
	SDEBUG("http_delete_step1");
	struct sock_ev_client_delete *client_delete = NULL;
	SDEFINE_VAR_ALL(str_uri, str_uri_temp, str_action_name, str_temp);
	SDEFINE_VAR_MORE(str_args, str_sql, str_data, str_one_col, str_one_val);
	char *str_response = NULL;
	size_t int_response_len = 0;
	char *ptr_end_uri = NULL;
	char *ptr_data = NULL;
	char *ptr_data_end = NULL;
	size_t int_uri_len = 0;
	size_t int_query_len = 0;
	size_t int_data_len = 0;

	client->cur_request =
		create_request(client, NULL, NULL, NULL, NULL, sizeof(struct sock_ev_client_delete), ENVELOPE_REQ_DELETE, ws_delete_free);
	SFINISH_CHECK(client->cur_request != NULL, "create_request failed!");
	client_delete = (struct sock_ev_client_delete *)(client->cur_request->client_request_data);

	str_uri = str_uri_path(client->str_request, client->int_request_len, &int_uri_len);
	SFINISH_CHECK(str_uri != NULL, "str_uri_path() failed");
	str_args = query(client->str_request, client->int_request_len, &int_query_len);
	SFINISH_CHECK(str_args != NULL, "query() failed");

	SDEBUG("str_uri: %s", str_uri);

	ptr_end_uri = strchr(str_uri, '?');
	if (ptr_end_uri != NULL) {
		*ptr_end_uri = 0;
	}

	ptr_end_uri = strchr(str_uri, '#');
	if (ptr_end_uri != NULL) {
		*ptr_end_uri = 0;
	}

	SDEBUG("str_args: %s", str_args);

	// Get table names
	client_delete->str_real_table_name = getpar(str_args, "src", int_query_len, &client_delete->int_real_table_name_len);
	if (client_delete->str_real_table_name == NULL || client_delete->str_real_table_name[0] == 0) {
		SFREE(client_delete->str_real_table_name);
		client_delete->str_real_table_name
			= getpar(str_args, "view", int_query_len, &client_delete->int_real_table_name_len);
	}
	SFINISH_ERROR_CHECK(client_delete->str_real_table_name != NULL && client_delete->str_real_table_name[0] != 0, "Failed to get table name from query");

	// Get return columns
	str_data = getpar(str_args, "id", int_query_len, &int_data_len);

	ptr_data = str_data;
	ptr_data_end = str_data + int_data_len;
	while (ptr_data < ptr_data_end) {
		if (*ptr_data != '0' && *ptr_data != '1' && *ptr_data != '2' && *ptr_data != '3' && *ptr_data != '4'
			&& *ptr_data != '5' && *ptr_data != '6' && *ptr_data != '7' && *ptr_data != '8' && *ptr_data != '9'
			&& *ptr_data != ',' && *ptr_data != ' ' && *ptr_data != '\t' && *ptr_data != '\n' && *ptr_data != '-'
		) {
			SFINISH("The id argument can only have commas, numbers and whitespace");
		}
		ptr_data++;
	}

	SFINISH_SNCAT(
		client_delete->str_sql, &client_delete->int_sql_len
		, "DELETE FROM ", (size_t)12
		, client_delete->str_real_table_name, client_delete->int_real_table_name_len
		, " WHERE id IN (", (size_t)14
		, str_data, int_data_len
		, ");", (size_t)2
	);

	SDEBUG("client_delete->str_sql: %s", client_delete->str_sql);
	if (DB_connection_driver(client->conn) == DB_DRIVER_POSTGRES) {
		SFINISH_CHECK(DB_exec(EV_A, client->conn, client, "BEGIN;", http_delete_step2), "DB_exec failed");
	} else {
		SFINISH_CHECK(DB_exec(EV_A, client->conn, client, "BEGIN TRANSACTION;", http_delete_step2), "DB_exec failed");
	}

	// SFINISH("Only WHERE, ORDER BY, LIMIT and OFFSET are allowed in the SELECT request");

	bol_error_state = false;
finish:
	SFREE_ALL();
	if (bol_error_state) {
		bol_error_state = false;

        SFREE(client->str_http_header);
        SFINISH_CHECK(
			build_http_response(
                "500 Internal Server Error"
                , str_response, int_response_len
                , "text/plain"
                , NULL
                , &client->str_http_response, &client->int_http_response_len
            )
			, "build_http_response failed"
		);
	}
    SFREE(str_response);
    // if client->str_http_header is non-empty, we are already taken care of
	if (client->str_http_response != NULL && client->str_http_header == NULL) {
		ev_io_stop(EV_A, &client->io);
		ev_io_init(&client->io, client_write_http_cb, client->io.fd, EV_WRITE);
        ev_io_start(EV_A, &client->io);
	}
}

bool http_delete_step2(EV_P, void *cb_data, DB_result *res) {
	struct sock_ev_client *client = cb_data;
	struct sock_ev_client_delete *client_delete = (struct sock_ev_client_delete *)(client->cur_request->client_request_data);
	char *str_response = NULL;
	size_t int_response_len = 0;
	SDEFINE_VAR_ALL(str_temp);

	SFINISH_CHECK(res != NULL, "DB_exec failed");
	SFINISH_CHECK(res->status == DB_RES_COMMAND_OK, "DB_exec failed");

	DB_free_result(res);

	SDEBUG("client_delete->str_sql: %s", client_delete->str_sql);
	SFINISH_CHECK(query_is_safe(client_delete->str_sql), "SQL Injection detected");
	SFINISH_CHECK(DB_exec(EV_A, client->conn, client, client_delete->str_sql, http_delete_step3), "DB_exec failed");

	SDEBUG("str_response: %s", str_response);

	bol_error_state = false;
finish:
	SFREE_ALL();
	if (bol_error_state) {
		bol_error_state = false;

		char *_str_response1 = str_response;
		char *_str_response2 = DB_get_diagnostic(client->conn, res);
		SFINISH_SNCAT(
			str_response, &int_response_len
			, _str_response1, strlen(_str_response1 != NULL ? _str_response1 : "")
			, ":\n", (size_t)2
			, _str_response2, strlen(_str_response2 != NULL ? _str_response2 : "")
		);
		SFREE(_str_response1);
		SFREE(_str_response2);

        SFREE(client->str_http_header);
        SFINISH_CHECK(
			build_http_response(
                "500 Internal Server Error"
                , str_response, int_response_len
                , "text/plain"
                , NULL
                , &client->str_http_response, &client->int_http_response_len
            )
			, "build_http_response failed"
		);
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

bool http_delete_step3(EV_P, void *cb_data, DB_result *res) {
	struct sock_ev_client *client = cb_data;
	char *str_response = NULL;
	size_t int_response_len = 0;
	SDEFINE_VAR_ALL(str_temp);

	SFINISH_CHECK(res != NULL, "DB_exec failed");
	SFINISH_CHECK(res->status == DB_RES_COMMAND_OK, "DB_exec failed");

	DB_free_result(res);

	if (DB_connection_driver(client->conn) == DB_DRIVER_POSTGRES) {
		SFINISH_CHECK(DB_exec(EV_A, client->conn, client, "END;", http_delete_step4), "DB_exec failed");
	} else {
		SFINISH_CHECK(DB_exec(EV_A, client->conn, client, "COMMIT TRANSACTION;", http_delete_step4), "DB_exec failed");
	}

	SDEBUG("str_response: %s", str_response);

	bol_error_state = false;
finish:
	SFREE_ALL();
	if (bol_error_state) {
		bol_error_state = false;

		char *_str_response1 = str_response;
		char *_str_response2 = DB_get_diagnostic(client->conn, res);
		SFINISH_SNCAT(
			str_response, &int_response_len
			, _str_response1, strlen(_str_response1 != NULL ? _str_response1 : "")
			, ":\n", (size_t)2
			, _str_response2, strlen(_str_response2 != NULL ? _str_response2 : "")
		);
		SFREE(_str_response1);
		SFREE(_str_response2);

        SFREE(client->str_http_header);
        SFINISH_CHECK(
			build_http_response(
                "500 Internal Server Error"
                , str_response, int_response_len
                , "text/plain"
                , NULL
                , &client->str_http_response, &client->int_http_response_len
            )
			, "build_http_response failed"
		);
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

bool http_delete_step4(EV_P, void *cb_data, DB_result *res) {
	struct sock_ev_client *client = cb_data;
	char *str_response = NULL;
	size_t int_response_len = 0;
	DArray *arr_row_values = NULL;

	SFINISH_CHECK(res != NULL, "DB_exec failed");
	SFINISH_CHECK(res->status == DB_RES_COMMAND_OK, "DB_exec failed");

    SFINISH_CHECK(
		build_http_response(
            "200 OK"
            , "{\"stat\": true, \"dat\": \"\"}", strlen("{\"stat\": true, \"dat\": \"\"}")
            , "application/json"
            , NULL
            , &client->str_http_response, &client->int_http_response_len
        )
		, "build_http_response failed"
	);

	SDEBUG("str_response: %s", str_response);

	bol_error_state = false;
finish:
	if (arr_row_values != NULL) {
		DArray_clear_destroy(arr_row_values);
		arr_row_values = NULL;
	}
	if (bol_error_state) {
		bol_error_state = false;

		char *_str_response1 = str_response;
		char *_str_response2 = DB_get_diagnostic(client->conn, res);
		SFINISH_SNCAT(
			str_response, &int_response_len
			, _str_response1, strlen(_str_response1 != NULL ? _str_response1 : "")
			, ":\n", (size_t)2
			, _str_response2, strlen(_str_response2 != NULL ? _str_response2 : "")
		);
		SFREE(_str_response1);
		SFREE(_str_response2);

        SFREE(client->str_http_header);
        SFINISH_CHECK(
			build_http_response(
                "500 Internal Server Error"
                , str_response, int_response_len
                , "text/plain"
                , NULL
                , &client->str_http_response, &client->int_http_response_len
            )
			, "build_http_response failed"
		);
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
