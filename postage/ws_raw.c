#include "ws_raw.h"

#ifdef ENVELOPE
#else

static const char *str_date_format = "%Y/%m/%d";
static const char *str_time_format = "%H:%M:%S";

extern char *_DB_get_diagnostic(DB_conn *conn, PGresult *res);

// Autocommit in PGAdmin (@Tostino and @nunziotocci on github):
//
// - Off
//     It'll start a transaction, run any queries in that transaction,
//     and keep it open at the end of the run waiting for either more queries
//     or a COMMIT/ROLLBACK (or if the script had a COMMIT/ROLLBACK it will close).
//
// - On
//     A transaction will be started, all queries will execute in the same transaction,
//     and a COMMIT will be issued at the end, unless your query has an unmatched BEGIN (or a transaction is open),
//     in which case no COMMIT will be issued automatically.
//

void ws_raw_step1(struct sock_ev_client_request *client_request) {
	struct sock_ev_client_raw *client_raw = (struct sock_ev_client_raw *)client_request->client_request_data;
	SDEFINE_VAR_ALL(str_escaped_sql, str_sql_temp);
	char *ptr_query = NULL;
	char *str_response = NULL;
	client_request->arr_query = NULL;
	client_request->int_response_id = 0;
	char str_temp[101];
	int int_status = 1;
	size_t int_response_len = 0;
	size_t int_sql_temp_len = 0;
	size_t int_escaped_sql_len = 0;

	// arr_response is for the CONFIRM and SEND FROM messages
	client_request->arr_response = DArray_create(sizeof(char *), 1);
	client_raw->bol_autocommit = true;
	client_raw->bol_begin_transaction = PQtransactionStatus(client_request->parent->conn->conn) == PQTRANS_IDLE;
	SINFO("client_raw->bol_begin_transaction: %s", client_raw->bol_begin_transaction == true ? "true" : "false");

	ptr_query = client_request->ptr_query + 3;
	SFINISH_CHECK(*ptr_query != 0, "Invalid RAW request");
	if (strncmp(ptr_query, "\tDISABLE AUTOCOMMIT\n", 20) == 0) {
		ptr_query += 20;
		client_raw->bol_autocommit = false;
		SINFO("DISABLE AUTOCOMMIT");
	} else {
		ptr_query++;
		SFINISH_CHECK(*ptr_query != 0, "Invalid RAW request");
	}

	client_raw->bol_commit_transaction = client_raw->bol_autocommit && client_raw->bol_begin_transaction;
	SINFO("client_raw->bol_commit_transaction: %s", client_raw->bol_commit_transaction == true ? "true" : "false");

	client_request->arr_query = DArray_sql_split(ptr_query);
	memset(str_temp, 0, 101);
	if (client_request->arr_query == NULL) {
		client_request->int_response_id += 1;
		snprintf(str_temp, 100, "%zd", client_request->int_response_id);

		SFINISH_SNCAT(str_response, &int_response_len,
			"messageid = ", (size_t)12,
			client_request->str_message_id, client_request->int_message_id_len,
			"\012", (size_t)1);
		if (client_request->str_transaction_id) {
			SFINISH_SNFCAT(str_response, &int_response_len,
				"transactionid = ", (size_t)16,
				client_request->str_transaction_id, client_request->int_transaction_id_len,
				"\012", (size_t)1);
		}
		SFINISH_SNFCAT(str_response, &int_response_len,
			"responsenumber = ", (size_t)17,
			str_temp, strlen(str_temp),
			"\012", (size_t)1);
		SFINISH_SNFCAT(str_response, &int_response_len,
			"EMPTY", (size_t)5);
		WS_sendFrame(global_loop, client_request->parent, true, 0x01, str_response, int_response_len);
		DArray_push(client_request->arr_response, str_response);
		str_response = NULL;

		client_request->int_response_id += 1;
		memset(str_temp, 0, 101);
		snprintf(str_temp, 100, "%zd", client_request->int_response_id);

		SFINISH_SNCAT(str_response, &int_response_len,
			"messageid = ", (size_t)12,
			client_request->str_message_id, client_request->int_message_id_len,
			"\012", (size_t)1);
		if (client_request->str_transaction_id) {
			SFINISH_SNFCAT(str_response, &int_response_len,
				"transactionid = ", (size_t)16,
				client_request->str_transaction_id, client_request->int_transaction_id_len,
				"\012", (size_t)1);
		}
		SFINISH_SNFCAT(str_response, &int_response_len,
			"responsenumber = ", (size_t)17,
			str_temp, strlen(str_temp),
			"\012\\.", (size_t)3);
		WS_sendFrame(global_loop, client_request->parent, true, 0x01, str_response, int_response_len);
		DArray_push(client_request->arr_response, str_response);
		str_response = NULL;

		client_request->int_response_id += 1;
		memset(str_temp, 0, 101);
		snprintf(str_temp, 100, "%zd", client_request->int_response_id);

		SFINISH_SNCAT(str_response, &int_response_len,
			"messageid = ", (size_t)12,
			client_request->str_message_id, client_request->int_message_id_len,
			"\012", (size_t)1);
		if (client_request->str_transaction_id) {
			SFINISH_SNFCAT(str_response, &int_response_len,
				"transactionid = ", (size_t)16,
				client_request->str_transaction_id,
				"\012", (size_t)1);
		}
		SFINISH_SNFCAT(str_response, &int_response_len,
			"responsenumber = ", (size_t)17,
			str_temp, strlen(str_temp),
			"\012", (size_t)1);
		PGTransactionStatusType tran_status = PQtransactionStatus(client_request->parent->conn->conn);
		SFINISH_SNFCAT(str_response, &int_response_len,
			tran_status == PQTRANS_IDLE ? "TRANSACTION COMPLETED" : "TRANSACTION OPEN",
			tran_status == PQTRANS_IDLE ? (size_t)21 : (size_t)16
		);
		WS_sendFrame(global_loop, client_request->parent, true, 0x01, str_response, int_response_len);
		DArray_push(client_request->arr_response, str_response);
		str_response = NULL;
		SINFO(PQtransactionStatus(client_request->parent->conn->conn) == PQTRANS_IDLE ? "TRANSACTION COMPLETED" : "TRANSACTION OPEN");
		goto finish;
	}
	client_request->int_i = (client_raw->bol_begin_transaction ? -1 : 0);
	client_request->int_len = (ssize_t)DArray_end(client_request->arr_query);

	client_request->int_response_id = (client_raw->bol_begin_transaction ? -1 : 0);

	if (client_request->int_i == 0) {
		char *str_sql = (char *)DArray_get(client_request->arr_query, (size_t)client_request->int_i);

		SFINISH_SNCAT(str_sql_temp, &int_sql_temp_len,
			str_sql, strlen(str_sql));
		str_escaped_sql = bescape_value(str_sql_temp, &int_sql_temp_len);
		SFREE(str_sql_temp);
		SFINISH_CHECK(str_escaped_sql != NULL, "bescape_value failed");
		int_escaped_sql_len = int_sql_temp_len;

		client_request->int_response_id += 1;
		memset(str_temp, 0, 101);
		snprintf(str_temp, 100, "%zd", client_request->int_response_id);

		SFINISH_SNCAT(str_response, &int_response_len,
			"messageid = ", (size_t)12,
			client_request->str_message_id, client_request->int_message_id_len,
			"\012responsenumber = ", (size_t)18,
			str_temp, strlen(str_temp),
			"\012", (size_t)1);
		if (client_request->str_transaction_id != NULL) {
			SFINISH_SNFCAT(str_response, &int_response_len,
				"transactionid = ", (size_t)16,
				client_request->str_transaction_id, client_request->int_transaction_id_len,
				"\012", (size_t)1);
		}
		SFINISH_SNFCAT(str_response, &int_response_len,
			"QUERY\t", (size_t)6,
			str_escaped_sql, int_escaped_sql_len);
		WS_sendFrame(global_loop, client_request->parent, true, 0x01, str_response, int_response_len);
		DArray_push(client_request->arr_response, str_response);

		client_request->int_response_id += 1;
		memset(str_temp, 0, 101);
		snprintf(str_temp, 100, "%zd", client_request->int_response_id);

		SFINISH_SNCAT(str_response, &int_response_len,
			"messageid = ", (size_t)12,
			client_request->str_message_id, client_request->int_message_id_len,
			"\012responsenumber = ", (size_t)18,
			str_temp, strlen(str_temp),
			"\012", (size_t)1);
		if (client_request->str_transaction_id != NULL) {
			SFINISH_SNFCAT(str_response, &int_response_len,
				"transactionid = ", (size_t)16,
				client_request->str_transaction_id, client_request->int_transaction_id_len,
				"\012", (size_t)1);
		}

		struct tm tm_time;
		struct timeval tv_time;
		memset(str_temp, 0, 101);
		SFINISH_CHECK(gettimeofday(&tv_time, NULL) == 0, "gettimeofday failed");
		SDEBUG("tv_time.tv_sec: %d", tv_time.tv_sec);
#ifdef _WIN32
		SFINISH_CHECK((errno = _gmtime32_s(&tm_time, &tv_time.tv_sec)) == 0, "_gmtime32_s failed");
#else
		gmtime_r(&tv_time.tv_sec, &tm_time);
#endif
		SDEBUG("tm_time.tm_mon: %d", tm_time.tm_mon);
		SFINISH_CHECK(strftime(str_temp, 100, str_date_format, &tm_time) != 0, "strftime() failed");
		SFINISH_SNFCAT(str_response, &int_response_len,
			"START\t", (size_t)6,
			str_temp, strlen(str_temp));

		memset(str_temp, 0, 101);
		SFINISH_CHECK(strftime(str_temp, 100, str_time_format, &tm_time) != 0, "strftime() failed");
		SFINISH_SNFCAT(str_response, &int_response_len,
			"\t", (size_t)1,
			str_temp, strlen(str_temp));

		memset(str_temp, 0, 101);
		SFINISH_CHECK(snprintf(str_temp, 100, "%lu", (unsigned long)tv_time.tv_usec) != 0, "snprintf() failed");
		SFINISH_SNFCAT(str_response, &int_response_len,
			"\t", (size_t)1,
			str_temp, strlen(str_temp));

		WS_sendFrame(global_loop, client_request->parent, true, 0x01, str_response, int_response_len);
		DArray_push(client_request->arr_response, str_response);
		str_response = NULL;

		int_status = PQsendQuery(client_request->parent->cnxn, str_sql);
	} else {
		SINFO("client_request->parent: %p", client_request->parent);
		int_status = PQsendQuery(client_request->parent->cnxn, "BEGIN");
	}
	if (int_status != 1) {
		SFINISH("Query failed: %s", PQerrorMessage(client_request->parent->cnxn));
	}

	query_callback(global_loop, client_request, ws_raw_step2);

	bol_error_state = false;
finish:
	SFREE_ALL();
	if (str_response != NULL) {
		bol_error_state = false;
		memset(str_temp, 0, 101);
		client_request->int_response_id = client_request->int_response_id > 0 ? client_request->int_response_id + 1 : 1;
		snprintf(str_temp, 100, "%zd", client_request->int_response_id);
		char *_str_response = str_response;
		SFINISH_SNCAT(str_response, &int_response_len,
			"messageid = ", (size_t)12,
			client_request->str_message_id, client_request->int_message_id_len,
			"\012responsenumber = ", (size_t)18,
			str_temp, strlen(str_temp),
			"\012", (size_t)1);
		if (client_request->str_transaction_id != NULL) {
			SFINISH_SNFCAT(str_response, &int_response_len,
				"transactionid = ", (size_t)16,
				client_request->str_transaction_id, client_request->int_transaction_id_len,
				"\012", (size_t)1);
		}
		SFINISH_SNFCAT(str_response, &int_response_len,
			_str_response, strlen(_str_response));
		SFREE(_str_response);
		WS_sendFrame(global_loop, client_request->parent, true, 0x01, str_response, int_response_len);
		DArray_push(client_request->arr_response, str_response);
		str_response = NULL;
		// client_request_free(client_request);
		ws_raw_step3(global_loop, NULL, 0, client_request);
	}
	bol_error_state = false;
}

bool ws_raw_step2(EV_P, PGresult *res, ExecStatusType result, struct sock_ev_client_request *client_request) {
	struct sock_ev_client_raw *client_raw = (struct sock_ev_client_raw *)client_request->client_request_data;
	SDEBUG("ws_raw_step2");
	char *str_response = NULL;
	char *str_sql = NULL;
	char *str_rows = NULL;
	char *str_oid_type = NULL;
	char *str_int_mod = NULL;
	bool bol_sfree_all = true;
	struct tm tm_time;
	struct timeval tv_time;
	char str_temp[101];
	int int_status = 0;
	size_t int_response_len = 0;
	size_t int_sql_column_types_len = 0;
	size_t int_oid_type_len = 0;
	size_t int_int_mod_len = 0;
	size_t int_sql_temp_len = 0;
	size_t int_escaped_sql_len = 0;
	SDEFINE_VAR_ALL(str_escaped_sql, str_sql_temp, str_sql_column_types, str_error);

	// If the previous query was not the BEGIN or the end...
	if ((client_request->int_i >= 0 || !client_raw->bol_begin_transaction) && client_request->int_i < client_request->int_len) {
		// ...send the END message for the previous query
		client_request->int_response_id += 1;
		memset(str_temp, 0, 101);
		snprintf(str_temp, 100, "%zd", client_request->int_response_id);
		SFINISH_SNCAT(str_response, &int_response_len,
			"messageid = ", (size_t)12,
			client_request->str_message_id, client_request->int_message_id_len,
			"\012", (size_t)1);
		if (client_request->str_transaction_id) {
			SFINISH_SNFCAT(str_response, &int_response_len,
				"transactionid = ", (size_t)16,
				client_request->str_transaction_id, client_request->int_transaction_id_len,
				"\012", (size_t)1);
		}
		SFINISH_SNFCAT(str_response, &int_response_len,
			"responsenumber = ", (size_t)17,
			str_temp, strlen(str_temp),
			"\012", (size_t)1);

		gettimeofday(&tv_time, NULL);
#ifdef _WIN32
		SFINISH_CHECK((errno = _gmtime32_s(&tm_time, &tv_time.tv_sec)) == 0, "_gmtime32_s failed");
#else
		gmtime_r(&tv_time.tv_sec, &tm_time);
#endif
		SFINISH_CHECK(strftime(str_temp, 100, str_date_format, &tm_time) != 0, "strftime() failed");
		SFINISH_SNFCAT(str_response, &int_response_len,
			"END\t", (size_t)4,
			str_temp, strlen(str_temp));

		memset(str_temp, 0, 101);
		SFINISH_CHECK(strftime(str_temp, 100, str_time_format, &tm_time) != 0, "strftime() failed");
		SFINISH_SNFCAT(str_response, &int_response_len,
			"\t", (size_t)1,
			str_temp, strlen(str_temp));

		memset(str_temp, 0, 101);

		SFINISH_CHECK(snprintf(str_temp, 100, "%lu", (unsigned long)tv_time.tv_usec) != 0, "snprintf() failed");
		SFINISH_SNFCAT(str_response, &int_response_len,
			"\t", (size_t)1,
			str_temp, strlen(str_temp));

		SDEBUG("BEFORE str_response>%s<", str_response);


		SDEBUG("client_request->arr_response: %p", client_request->arr_response);

		WS_sendFrame(EV_A, client_request->parent, true, 0x01, str_response, int_response_len);
		DArray_push(client_request->arr_response, str_response);
		SDEBUG("AFTER");
		str_response = NULL;
	}

	client_request->int_response_id += 1;
	memset(str_temp, 0, 101);
	snprintf(str_temp, 100, "%zd", client_request->int_response_id);
	SFINISH_SNCAT(str_response, &int_response_len,
		"messageid = ", (size_t)12,
		client_request->str_message_id, client_request->int_message_id_len,
		"\012", (size_t)1);
	if (client_request->str_transaction_id) {
		SFINISH_SNFCAT(str_response, &int_response_len,
			"transactionid = ", (size_t)16,
			client_request->str_transaction_id, client_request->int_transaction_id_len,
			"\012", (size_t)1);
	}
	SFINISH_SNFCAT(str_response, &int_response_len,
		"responsenumber = ", (size_t)17,
		str_temp, strlen(str_temp),
		"\012", (size_t)1);

	SFINISH_CHECK(res != NULL, "query_callback failed!");
	client_request->int_i += 1;
	// If this isn't the COMMIT query...
	if (client_request->int_i <= client_request->int_len) {
		// ...check for errors, then handle the result

		if (client_request->int_i == 0) {
			// The BEGIN query doesn't say anything to the user, so just check for error
			str_error = _DB_get_diagnostic(client_request->parent->conn, res);
			SFINISH_CHECK(result == PGRES_COMMAND_OK, "BEGIN failed: %s", str_error);

		} else if (result == PGRES_FATAL_ERROR) {
			// This is obviously very, very, bad
			str_error = _DB_get_diagnostic(client_request->parent->conn, res);
			SFINISH("Query failed: %s", str_error);

		} else if (result == PGRES_EMPTY_QUERY) {
			// Send a special response for empty queries
			SFINISH_SNFCAT(str_response, &int_response_len,
				"EMPTY", (size_t)5);
			WS_sendFrame(EV_A, client_request->parent, true, 0x01, str_response, int_response_len);
			DArray_push(client_request->arr_response, str_response);
			str_response = NULL;

			client_request->int_response_id += 1;
			memset(str_temp, 0, 101);
			snprintf(str_temp, 100, "%zd", client_request->int_response_id);

			SFINISH_SNCAT(str_response, &int_response_len,
				"messageid = ", (size_t)12,
				client_request->str_message_id, client_request->int_message_id_len,
				"\012", (size_t)1);
			if (client_request->str_transaction_id) {
				SFINISH_SNFCAT(str_response, &int_response_len,
					"transactionid = ", (size_t)16,
					client_request->str_transaction_id, client_request->int_transaction_id_len,
					"\012", (size_t)1);
			}
			SFINISH_SNFCAT(str_response, &int_response_len,
				"responsenumber = ", (size_t)17,
				str_temp, strlen(str_temp),
				"\012", (size_t)1);
			SFINISH_SNFCAT(str_response, &int_response_len,
				"\\.", (size_t)2);

		} else if (result == PGRES_BAD_RESPONSE) {
			SFINISH("Bad response from server: %s", _DB_get_diagnostic(client_request->parent->conn, res));

		} else if (result == PGRES_NONFATAL_ERROR) {
			SFINISH("Nonfatal error: %s", _DB_get_diagnostic(client_request->parent->conn, res));

		} else if (result == PGRES_COMMAND_OK) {
			// This is for queries that don't return tuples
			str_rows = PQcmdTuples(res);
			str_rows = *str_rows == '\0' ? "0" : str_rows;
			SFINISH_SNFCAT(str_response, &int_response_len,
				"Rows Affected\012", (size_t)14,
				str_rows, strlen(str_rows),
				"\012", (size_t)1);

		} else if (result == PGRES_TUPLES_OK) {
			// This is for queries that do (duuh)
			SDEBUG("PGRES_TUPLES_OK");
			client_raw->res = res;
			SFINISH_SNCAT(str_sql_column_types, &int_sql_column_types_len,
				"SELECT ", 7);

			int int_column;
			int int_num_columns = PQnfields(res);
			for (int_column = 0; int_column < int_num_columns; int_column += 1) {
				// For some reason the types are returned as text containing the type's OID
				memset(str_temp, 0, 101);
				sprintf(str_temp, "%u", PQftype(res, int_column));
				str_oid_type = PQescapeLiteral(client_request->parent->cnxn, str_temp, strlen(str_temp));
				int_oid_type_len = strlen(str_oid_type);

				memset(str_temp, 0, 101);
				sprintf(str_temp, "%d", PQfmod(res, int_column));
				str_int_mod = PQescapeLiteral(client_request->parent->cnxn, str_temp, strlen(str_temp));
				int_int_mod_len = strlen(str_int_mod);

				// get type
				SFINISH_SNFCAT(str_sql_column_types, &int_sql_column_types_len,
					"format_type(", (size_t)12,
					str_oid_type, int_oid_type_len,
					", ", (size_t)2,
					str_int_mod, int_int_mod_len,
					")", (size_t)1,
					int_column < (int_num_columns - 1) ? "," : ";", (size_t)1);
				PQfreemem(str_oid_type);
				str_oid_type = NULL;
				PQfreemem(str_int_mod);
				str_int_mod = NULL;
			}

			// Send the query that gets the type names
			int_status = PQsendQuery(client_request->parent->cnxn, str_sql_column_types);
			SFREE(str_sql_column_types);
			if (int_status != 1) {
				SFINISH("PQsendQuery failed %s", PQerrorMessage(client_request->parent->cnxn));
			}
			query_callback(EV_A, client_request, _raw_tuples_callback);
		} else {
			SFINISH("Unexpected result status %s: %s", PQresStatus(result), _DB_get_diagnostic(client_request->parent->conn, res));
		}

		// int_i is incremented before this is run, so we counteract it
		if ((client_request->int_i - 1) >= 0 && client_raw->bol_autocommit && client_raw->bol_begin_transaction) {
			if (client_raw->bol_commit_transaction && strncmp(PQcmdStatus(res), "BEGIN", 5) == 0) {
				client_raw->bol_commit_transaction = false;
			} else if (!client_raw->bol_commit_transaction && (strncmp(PQcmdStatus(res), "COMMIT", 6) == 0 || strncmp(PQcmdStatus(res), "ROLLBACK", 8) == 0)) {
				client_raw->bol_commit_transaction = true;

			}
			SINFO("client_raw->bol_commit_transaction: %s", client_raw->bol_commit_transaction == true ? "true" : "false");
		}
	} else {
		client_request->int_response_id -= 1;
		SFREE(str_response);
	}

	// If the query returned tuples, it is handled in a different branch of the code
	if (result != PGRES_TUPLES_OK) {
		PQclear(res);
		res = NULL;
		if (str_response != NULL && client_request->int_i != 0) {
			WS_sendFrame(EV_A, client_request->parent, true, 0x01, str_response, int_response_len);
			DArray_push(client_request->arr_response, str_response);
			str_response = NULL;
		} else {
			SFREE(str_response);
		}

		client_request->int_response_id += 1;
		memset(str_temp, 0, 101);
		snprintf(str_temp, 100, "%zd", client_request->int_response_id);

		SINFO("client_raw->bol_commit_transaction: %s", client_raw->bol_commit_transaction == true ? "true" : "false");

		// If there is another query to run...
		if (client_request->int_i < client_request->int_len) {
			// ...get it from the array and run it
			str_sql = (char *)DArray_get(client_request->arr_query, (size_t)client_request->int_i);

			SFINISH_SNCAT(str_sql_temp, &int_sql_temp_len,
				str_sql, strlen(str_sql));
			str_escaped_sql = bescape_value(str_sql_temp, &int_sql_temp_len);
			SFREE(str_sql_temp);
			SFINISH_CHECK(str_escaped_sql != NULL, "bescape_value failed");
			int_escaped_sql_len = int_sql_temp_len;

			SFINISH_SNCAT(str_response, &int_response_len,
				"messageid = ", (size_t)12,
				client_request->str_message_id, client_request->int_message_id_len,
				"\012responsenumber = ", (size_t)18,
				str_temp, strlen(str_temp),
				"\012", (size_t)1);
			if (client_request->str_transaction_id != NULL) {
				SFINISH_SNFCAT(str_response, &int_response_len,
					"transactionid = ", (size_t)16,
					client_request->str_transaction_id, client_request->int_transaction_id_len,
					"\012", (size_t)1);
			}
			SFINISH_SNFCAT(str_response, &int_response_len,
				"QUERY\t", (size_t)6,
				str_escaped_sql, int_escaped_sql_len);
			WS_sendFrame(EV_A, client_request->parent, true, 0x01, str_response, int_response_len);
			DArray_push(client_request->arr_response, str_response);

			client_request->int_response_id += 1;
			memset(str_temp, 0, 101);
			snprintf(str_temp, 100, "%zd", client_request->int_response_id);
			SFINISH_SNCAT(str_response, &int_response_len,
				"messageid = ", (size_t)12,
				client_request->str_message_id, client_request->int_message_id_len,
				"\012responsenumber = ", (size_t)18,
				str_temp, strlen(str_temp),
				"\012", (size_t)1);
			if (client_request->str_transaction_id != NULL) {
				SFINISH_SNFCAT(str_response, &int_response_len,
					"transactionid = ", (size_t)16,
					client_request->str_transaction_id, client_request->int_transaction_id_len,
					"\012", (size_t)1);
			}

			// Get time for START message
			memset(str_temp, 0, 101);
			SFINISH_CHECK(gettimeofday(&tv_time, NULL) == 0, "gettimeofday failed");
			SDEBUG("tv_time.tv_sec: %d", tv_time.tv_sec);
#ifdef _WIN32
			SFINISH_CHECK((errno = _gmtime32_s(&tm_time, &tv_time.tv_sec)) == 0, "_gmtime32_s failed");
#else
			gmtime_r(&tv_time.tv_sec, &tm_time);
#endif
			SDEBUG("tm_time.tm_mon: %d", tm_time.tm_mon);
			SFINISH_CHECK(strftime(str_temp, 100, str_date_format, &tm_time) != 0, "strftime() failed");
			SFINISH_SNFCAT(str_response, &int_response_len,
				"START\t", (size_t)6,
				str_temp, strlen(str_temp));

			memset(str_temp, 0, 101);
			SFINISH_CHECK(strftime(str_temp, 100, str_time_format, &tm_time) != 0, "strftime() failed");
			SFINISH_SNFCAT(str_response, &int_response_len,
				"\t", (size_t)1,
				str_temp, strlen(str_temp));

			memset(str_temp, 0, 101);
			SFINISH_CHECK(snprintf(str_temp, 100, "%lu", (unsigned long)tv_time.tv_usec) != 0, "snprintf() failed");
			SFINISH_SNFCAT(str_response, &int_response_len,
				"\t", (size_t)1,
				str_temp, strlen(str_temp));

			WS_sendFrame(EV_A, client_request->parent, true, 0x01, str_response, int_response_len);
			DArray_push(client_request->arr_response, str_response);
			str_response = NULL;

			int_status = PQsendQuery(client_request->parent->cnxn, str_sql);
			if (int_status != 1) {
				SFINISH("Query failed: %s", PQerrorMessage(client_request->parent->cnxn));
			}
			query_callback(EV_A, client_request, ws_raw_step2);
		} else if (client_request->int_i == client_request->int_len && client_raw->bol_commit_transaction) {
			SINFO("test");
			client_request->int_response_id -= 1;
			int_status = PQsendQuery(client_request->parent->cnxn, "COMMIT");
			if (int_status != 1) {
				SFINISH("Query failed: %s", PQerrorMessage(client_request->parent->cnxn));
			}
			query_callback(EV_A, client_request, ws_raw_step2);

		// If we are finished...
		} else if (client_request->int_i > client_request->int_len || (client_request->int_i == client_request->int_len && !client_raw->bol_commit_transaction)) {
			// ...say so
			SFINISH_SNCAT(str_response, &int_response_len,
				"messageid = ", (size_t)12,
				client_request->str_message_id, client_request->int_message_id_len,
				"\012responsenumber = ", (size_t)18,
				str_temp, strlen(str_temp),
				"\012", (size_t)1);
			if (client_request->str_transaction_id != NULL) {
				SFINISH_SNFCAT(str_response, &int_response_len,
					"transactionid = ", (size_t)16,
					client_request->str_transaction_id, client_request->int_transaction_id_len,
					"\012", (size_t)1);
			}
			PGTransactionStatusType tran_status = PQtransactionStatus(client_request->parent->conn->conn);
			SFINISH_SNFCAT(str_response, &int_response_len,
				tran_status == PQTRANS_IDLE ? "TRANSACTION COMPLETED" : "TRANSACTION OPEN",
				tran_status == PQTRANS_IDLE ? (size_t)21 : (size_t)16
			);
			WS_sendFrame(EV_A, client_request->parent, true, 0x01, str_response, int_response_len);
			DArray_push(client_request->arr_response, str_response);
			str_response = NULL;
			SINFO(PQtransactionStatus(client_request->parent->conn->conn) == PQTRANS_IDLE ? "TRANSACTION COMPLETED" : "TRANSACTION OPEN");
			// client_request_free(client_request);
		}
	} else {
		client_request->int_response_id -= 1;
		SFREE(str_response);
	}
	SFREE(str_response);

	bol_error_state = false;
finish:
	SDEBUG("bol_error_state == %s", bol_error_state == true ? "true" : "false");
	// There is a possibility of SFREE_ALL being called twice, we don't want this
	// to happen
	if (bol_sfree_all == true) {
		SFREE_ALL();
		bol_sfree_all = false;
	}
	if (str_oid_type != NULL) {
		PQfreemem(str_oid_type);
		str_oid_type = NULL;
	}
	if (str_int_mod != NULL) {
		PQfreemem(str_int_mod);
		str_int_mod = NULL;
	}
	// This is duplicated below
	if (bol_error_state == true) {
		bol_error_state = false;
		char *_str_response = str_response;
		SFINISH_SNCAT(str_response, &int_response_len,
			"messageid = ", (size_t)12,
			client_request->str_message_id, client_request->int_message_id_len,
			"\012responsenumber = ", (size_t)18,
			str_temp, strlen(str_temp),
			"\012", (size_t)1);
		if (client_request->str_transaction_id != NULL) {
			SFINISH_SNFCAT(str_response, &int_response_len,
				"transactionid = ", (size_t)16,
				client_request->str_transaction_id, client_request->int_transaction_id_len,
				"\012", (size_t)1);
		}
		SFINISH_SNFCAT(str_response, &int_response_len,
			_str_response, strlen(_str_response));
		SDEBUG("       str_response : %s", str_response);
		SDEBUG("strlen(str_response): %d", strlen(str_response));
		SDEBUG("       _str_response : %s", _str_response);
		SDEBUG("strlen(_str_response): %d", strlen(_str_response));
		SFREE(_str_response);

		client_request->str_current_response = str_response;
		str_response = NULL;

		client_request->int_i = client_request->int_len + 10;
		if (PQtransactionStatus(client_request->parent->cnxn) != PQTRANS_INERROR) {
			WS_sendFrame(EV_A, client_request->parent, true, 0x01, client_request->str_current_response, strlen(client_request->str_current_response));
			DArray_push(client_request->arr_response, client_request->str_current_response);
			client_request->str_current_response = NULL;
			SDEBUG("client_request->arr_response->end: %d", client_request->arr_response->end);
			SDEBUG("client_request->arr_response->contents[client_request->arr_response->end - 1]: %s", (char *)client_request->arr_response->contents[client_request->arr_response->end - 1]);
		} else {
			int_status = PQsendQuery(client_request->parent->cnxn, "ROLLBACK");
			if (int_status != 1) {
				SERROR_NORESPONSE("Query failed: %s", PQerrorMessage(client_request->parent->cnxn));
				ws_raw_step3(EV_A, NULL, 0, client_request);
				ev_feed_event(EV_A, &client_request->parent->notify_watcher->io, EV_READ);
				// we return here on purpose, otherwise we get called again and crash
				return false;
			}
			query_callback(EV_A, client_request, ws_raw_step3);
		}
	} else {
		SFREE(str_response);
	}
	if (result == PGRES_FATAL_ERROR && res != NULL) {
		PQclear(res);
		res = NULL;
	}
	return true;
}

bool ws_raw_step3(EV_P, PGresult *res, ExecStatusType result, struct sock_ev_client_request *client_request) {
	if (EV_A != 0) {
	} // get rid of unused parameter warning
	if (result != 0) {
	} // get rid of unused parameter warning
	if (client_request != NULL) {
	} // get rid of unused parameter warning
	if (res != NULL) {
		PQclear(res);
	}
	if (client_request->str_current_response != NULL) {
		SINFO("       client_request->str_current_response : %s", client_request->str_current_response);
		SINFO("strlen(client_request->str_current_response): %d", strlen(client_request->str_current_response));
		WS_sendFrame(EV_A, client_request->parent, true, 0x01, client_request->str_current_response, strlen(client_request->str_current_response));
		DArray_push(client_request->arr_response, client_request->str_current_response);
		client_request->str_current_response = NULL;
	}
	return true;
}

bool _raw_tuples_callback(EV_P, PGresult *res, ExecStatusType result, struct sock_ev_client_request *client_request) {
	struct sock_ev_client_raw *client_raw = (struct sock_ev_client_raw *)client_request->client_request_data;
	if (result != 0) {
	} // get rid of unused parameter warning
	SDEBUG("_raw_tuples_callback");
	char *str_response = NULL;
	char str_temp[101];
	struct sock_ev_client_copy_check *client_copy_check = NULL;
	SFINISH_SALLOC(client_copy_check, sizeof(struct sock_ev_client_copy_check));
	client_copy_check->client_request = client_request;
	client_raw->copy_check = client_copy_check;
	size_t int_response_len = 0;
	int int_status = 0;

	client_request->int_response_id += 1;
	memset(str_temp, 0, 101);
	snprintf(str_temp, 100, "%zd", client_request->int_response_id);

	SFINISH_CHECK(res != NULL, "Query failed: %s", PQerrorMessage(client_request->parent->cnxn));
	SFINISH_CHECK(result == PGRES_TUPLES_OK, "Query failed: %s", PQerrorMessage(client_request->parent->cnxn));

	if (close_client_if_needed(client_request->parent, (ev_watcher *)&client_request->check, EV_READ)) {
		SDEBUG("Client %p closed", client_request->parent);
		return false;
	}

	SFINISH_SNCAT(str_response, &int_response_len,
		"messageid = ", (size_t)12,
		client_request->str_message_id, client_request->int_message_id_len,
		"\012responsenumber = ", (size_t)18,
		str_temp, strlen(str_temp),
		"\012", (size_t)1);
	if (client_request->str_transaction_id != NULL) {
		SFINISH_SNFCAT(str_response, &int_response_len,
			"transactionid = ", 16,
			client_request->str_transaction_id, client_request->int_transaction_id_len,
			"\012", (size_t)1);
	}
	memset(str_temp, 0, 101);
	snprintf(str_temp, 100, "%d", PQntuples(client_raw->res));
	SFINISH_SNFCAT(str_response, &int_response_len,
		"ROWS\t", (size_t)5,
		str_temp, strlen(str_temp));
	WS_sendFrame(EV_A, client_request->parent, true, 0x01, str_response, int_response_len);
	DArray_push(client_request->arr_response, str_response);
	str_response = NULL;

	client_request->int_response_id += 1;
	memset(str_temp, 0, 101);
	snprintf(str_temp, 100, "%zd", client_request->int_response_id);
	SFINISH_SNCAT(str_response, &int_response_len,
		"messageid = ", (size_t)12,
		client_request->str_message_id, client_request->int_message_id_len,
		"\012responsenumber = ", (size_t)18,
		str_temp, strlen(str_temp),
		"\012", (size_t)1);
	if (client_request->str_transaction_id != NULL) {
		SFINISH_SNFCAT(str_response, &int_response_len,
			"transactionid = ", (size_t)16,
			client_request->str_transaction_id, client_request->int_transaction_id_len,
			"\012", (size_t)1);
	}
	SFINISH_SNFCAT(str_response, &int_response_len,
		"COLUMNS\012", (size_t)8);

	int int_num_columns = PQnfields(client_raw->res);
	int int_column;
	for (int_column = 0; int_column < int_num_columns; int_column += 1) {
		char *str_cell = PQfname(client_raw->res, int_column);
		SFINISH_SNFCAT(str_response, &int_response_len,
			str_cell, strlen(str_cell),
			int_column < (int_num_columns - 1) ? "\t" : "\012", (size_t)1);
	}
	for (int_column = 0; int_column < int_num_columns; int_column += 1) {
		SFINISH_SNFCAT(str_response, &int_response_len,
			PQgetvalue(res, 0, int_column), strlen(PQgetvalue(res, 0, int_column)),
			int_column < (int_num_columns - 1) ? "\t" : "\012", (size_t)1);
        // we may have made a mistake about where to do this, delete this and next line next time you see this
		//(PQgetvalue(res, 0, int_column) != NULL ? PQgetvalue(res, 0, int_column) : "\N"), strlen(PQgetvalue(res, 0, int_column)),
	}
	PQclear(res);

	WS_sendFrame(EV_A, client_request->parent, true, 0x01, str_response, int_response_len);
	DArray_push(client_request->arr_response, str_response);
	str_response = NULL;

	// This will make sure that the event loop does not sleep
	increment_idle(EV_A);
	SINFO("client_raw->copy_check: %p", client_raw->copy_check);

	// This will run every iteration
	ev_check_init(&client_copy_check->check, _raw_tuples_check_callback);
	ev_check_start(EV_A, &client_copy_check->check);
	bol_error_state = false;
finish:
	// This is duplicated above
	if (bol_error_state == true) {
		bol_error_state = false;
		char *_str_response = str_response;
		SFINISH_SNCAT(str_response, &int_response_len,
			"messageid = ", (size_t)12,
			client_request->str_message_id, client_request->int_message_id_len,
			"\012responsenumber = ", (size_t)18,
			str_temp, strlen(str_temp),
			"\012", (size_t)1);
		if (client_request->str_transaction_id != NULL) {
			SFINISH_SNFCAT(str_response, &int_response_len,
				"transactionid = ", (size_t)16,
				client_request->str_transaction_id, client_request->int_transaction_id_len,
				"\012", (size_t)1);
		}
		SFINISH_SNFCAT(str_response, &int_response_len,
			_str_response, strlen(_str_response));
		SDEBUG("       str_response : %s", str_response);
		SDEBUG("strlen(str_response): %d", strlen(str_response));
		SDEBUG("       _str_response : %s", _str_response);
		SDEBUG("strlen(_str_response): %d", strlen(_str_response));
		SFREE(_str_response);

		client_request->str_current_response = str_response;
		str_response = NULL;

		client_request->int_i = client_request->int_len + 10;
		int_status = PQsendQuery(client_request->parent->cnxn, "ROLLBACK");
		if (int_status != 1) {
			SERROR_NORESPONSE("Query failed: %s", PQerrorMessage(client_request->parent->cnxn));
			ws_raw_step3(EV_A, NULL, 0, client_request);
			ev_feed_event(EV_A, &client_request->parent->notify_watcher->io, EV_READ);
			// we return here on purpose, otherwise we get called again and crash
			return false;
		}
		query_callback(EV_A, client_request, ws_raw_step3);
	} else {
		SFREE(str_response);
	}
	return true;
}

// continue copying the data
void _raw_tuples_check_callback(EV_P, ev_check *w, int revents) {
	if (revents != 0) {
	} // get rid of unused parameter warning
	SDEBUG("_raw_tuples_check_callback");
	struct sock_ev_client_copy_check *client_copy_check = (struct sock_ev_client_copy_check *)w;
	struct sock_ev_client_request *client_request = client_copy_check->client_request;
	struct sock_ev_client_raw *client_raw = (struct sock_ev_client_raw *)client_request->client_request_data;
	struct sock_ev_client *client = client_request->parent;
	PGresult *res = client_raw->res;

	char *str_sql_temp = NULL;
	char *str_sql = NULL;
	char *str_response = NULL;
	char str_temp[101];
	memset(str_temp, 0, 101);
	ssize_t int_column = 0;
	ssize_t int_num_columns = 0;
	ssize_t int_num_rows = 0;
	size_t int_response_len = 0;
	size_t int_sql_temp_len = 0;
	int int_status = 0;
	SDEFINE_VAR_ALL(str_temp1, str_escaped_sql);
	// This must not be freed

	if (close_client_if_needed(client_request->parent, (ev_watcher *)w, revents)) {
		SDEBUG("Client %p closed", client_request->parent);
		client_request->parent->client_paused_request->bol_free_watcher = true;
		ev_check_stop(EV_A, w);
		SFREE_ALL();
		return;
	}

	client_request->int_response_id += 1;
	snprintf(str_temp, 100, "%zd", client_request->int_response_id);
	SFINISH_SNCAT(str_response, &int_response_len,
		"messageid = ", (size_t)12,
		client_request->str_message_id, client_request->int_message_id_len,
		"\012responsenumber = ", (size_t)18,
		str_temp, strlen(str_temp),
		"\012", (size_t)1);
	if (client_request->str_transaction_id != NULL) {
		SFINISH_SNFCAT(str_response, &int_response_len,
			"transactionid = ", (size_t)16,
			client_request->str_transaction_id, client_request->int_transaction_id_len,
			"\012", (size_t)1);
	}

	int_num_columns = PQnfields(res);
	int_num_rows = PQntuples(res);

	do {
		if ((ssize_t)client_copy_check->int_i == int_num_rows) {
			if ((client_copy_check->int_i % 10) > 0) {
				SDEBUG("client_copy_check->str_message_id: %s", client_request->str_message_id);
				WS_sendFrame(EV_A, client, true, 0x01, str_response, int_response_len);
				DArray_push(client_request->arr_response, str_response);
				client_request->int_response_id += 1;
				memset(str_temp, 0, 101);
				snprintf(str_temp, 100, "%zd", client_request->int_response_id);
				SFINISH_SNCAT(str_response, &int_response_len,
					"messageid = ", (size_t)12,
					client_request->str_message_id, client_request->int_message_id_len,
					"\012responsenumber = ", (size_t)18,
					str_temp, strlen(str_temp),
					"\012", (size_t)1);
				if (client_request->str_transaction_id != NULL) {
					SFINISH_SNFCAT(str_response, &int_response_len,
						"transactionid = ", (size_t)16,
						client_request->str_transaction_id, client_request->int_transaction_id_len,
						"\012", (size_t)1);
				}
			}

			SFINISH_SNFCAT(str_response, &int_response_len,
				"\\.", (size_t)2);
			WS_sendFrame(EV_A, client, true, 0x01, str_response, int_response_len);
			DArray_push(client_request->arr_response, str_response);
			str_response = NULL;

			client_request->int_response_id += 1;
			memset(str_temp, 0, 101);
			snprintf(str_temp, 100, "%zd", client_request->int_response_id);

			ev_check_stop(EV_A, &client_copy_check->check);
			decrement_idle(EV_A);

			SFINISH_SNCAT(str_response, &int_response_len,
				"messageid = ", (size_t)12,
				client_request->str_message_id, client_request->int_message_id_len,
				"\012responsenumber = ", (size_t)18,
				str_temp, strlen(str_temp),
				"\012", (size_t)1);
			if (client_request->str_transaction_id != NULL) {
				SFINISH_SNFCAT(str_response, &int_response_len,
					"transactionid = ", (size_t)16,
					client_request->str_transaction_id, client_request->int_transaction_id_len,
					"\012", (size_t)1);
			}
			client_raw->res = NULL;
			PQclear(res);

			if (client_request->int_i < client_request->int_len) {
				str_sql = (char *)DArray_get(client_request->arr_query, (size_t)client_request->int_i);
				SFINISH_SNCAT(str_sql_temp, &int_sql_temp_len,
					str_sql, strlen(str_sql));
				str_escaped_sql = bescape_value(str_sql_temp, &int_sql_temp_len);
				SFREE(str_sql_temp);
				SFINISH_CHECK(str_escaped_sql != NULL, "bescape_value failed");

				SFINISH_SNFCAT(str_response, &int_response_len,
					"QUERY\t", (size_t)6,
					str_escaped_sql, int_sql_temp_len);

				WS_sendFrame(EV_A, client_request->parent, true, 0x01, str_response, int_response_len);
				DArray_push(client_request->arr_response, str_response);

				client_request->int_response_id += 1;
				memset(str_temp, 0, 101);
				snprintf(str_temp, 100, "%zd", client_request->int_response_id);
				SFINISH_SNCAT(str_response, &int_response_len,
					"messageid = ", (size_t)12,
					client_request->str_message_id, client_request->int_message_id_len,
					"\012", (size_t)1);
				if (client_request->str_transaction_id) {
					SFINISH_SNFCAT(str_response, &int_response_len,
						"transactionid = ", (size_t)18,
						client_request->str_transaction_id, client_request->int_transaction_id_len,
						"\012", (size_t)1);
				}
				SFINISH_SNFCAT(str_response, &int_response_len,
					"responsenumber = ", (size_t)17,
					str_temp, strlen(str_temp),
					"\012", (size_t)1);

				memset(str_temp, 0, 101);
				struct tm tm_time;
				struct timeval tv_time;
				gettimeofday(&tv_time, NULL);
#ifdef _WIN32
				SFINISH_CHECK((errno = _gmtime32_s(&tm_time, &tv_time.tv_sec)) == 0, "_gmtime32_s failed");
#else
				gmtime_r(&tv_time.tv_sec, &tm_time);
#endif
				SFINISH_CHECK(strftime(str_temp, 100, str_date_format, &tm_time) != 0, "strftime() failed");
				SFINISH_SNFCAT(str_response, &int_response_len,
					"START\t", (size_t)6,
					str_temp, strlen(str_temp));

				memset(str_temp, 0, 101);
				SFINISH_CHECK(strftime(str_temp, 100, str_time_format, &tm_time) != 0, "strftime() failed");
				SFINISH_SNFCAT(str_response, &int_response_len,
					"\t", (size_t)1,
					str_temp, strlen(str_temp));

				memset(str_temp, 0, 101);
				SFINISH_CHECK(snprintf(str_temp, 100, "%lu", (unsigned long)tv_time.tv_usec) != 0, "snprintf() failed");
				SFINISH_SNFCAT(str_response, &int_response_len,
					"\t", (size_t)1,
					str_temp, strlen(str_temp));

				int_status = PQsendQuery(client_request->parent->cnxn, str_sql);
				if (int_status != 1) {
					SFINISH("Query failed: %s", PQerrorMessage(client_request->parent->cnxn));
				}
				query_callback(EV_A, client_request, ws_raw_step2);
			} else if (client_request->int_i == client_request->int_len && client_raw->bol_commit_transaction) {
				client_request->int_response_id -= 1;
				SFREE(str_response);
				int_status = PQsendQuery(client_request->parent->cnxn, "COMMIT");
				if (int_status != 1) {
					SFINISH("Query failed: %s", PQerrorMessage(client_request->parent->cnxn));
				}
				query_callback(EV_A, client_request, ws_raw_step2);
			} else if (client_request->int_i > client_request->int_len || (client_request->int_i == client_request->int_len && !client_raw->bol_commit_transaction)) {
				PGTransactionStatusType tran_status = PQtransactionStatus(client_request->parent->conn->conn);
				SFINISH_SNFCAT(str_response, &int_response_len,
					tran_status == PQTRANS_IDLE ? "TRANSACTION COMPLETED" : "TRANSACTION OPEN",
					tran_status == PQTRANS_IDLE ? (size_t)21 : (size_t)16);
				WS_sendFrame(EV_A, client, true, 0x01, str_response, int_response_len);
				DArray_push(client_request->arr_response, str_response);
				str_response = NULL;
				SINFO(PQtransactionStatus(client_request->parent->conn->conn) == PQTRANS_IDLE ? "TRANSACTION COMPLETED" : "TRANSACTION OPEN");
			}

			client_raw->copy_check = NULL;
			SFREE(client_copy_check);
			break;
		}

		for (int_column = 0; int_column < int_num_columns; int_column += 1) {
			// this if checks if the value of the current cell is null so we can retutrn \N instead
			if (PQgetisnull(res, (int)client_copy_check->int_i, (int)int_column)) {
				SFINISH_SNCAT(str_temp1, &int_sql_temp_len,
					"\\N",
					(size_t)2);

			} else {
				char *str_cell = PQgetvalue(res, (int)client_copy_check->int_i, (int)int_column);
				SFINISH_SNCAT(str_sql_temp, &int_sql_temp_len,
					str_cell, strlen(str_cell));

				str_temp1 = bescape_value(str_sql_temp, &int_sql_temp_len);
				SFREE(str_sql_temp);
				SFINISH_CHECK(str_temp1 != NULL, "bescape_value failed");
			}

			//SFINISH_SNCAT(str_sql_temp, &int_sql_temp_len,
			//	PQgetvalue(res, (int)client_copy_check->int_i, (int)int_column),
			//	strlen(PQgetvalue(res, (int)client_copy_check->int_i, (int)int_column)));

			SFINISH_SNFCAT(str_response, &int_response_len,
				str_temp1, int_sql_temp_len,
				int_column < (int_num_columns - 1) ? "\t" :
				(ssize_t)client_copy_check->int_i < (int_num_rows - 1)
				&& (client_copy_check->int_i % 10) < 9 ? "\012": "",
				strlen(int_column < (int_num_columns - 1) ? "\t" :
					(ssize_t)client_copy_check->int_i < (int_num_rows - 1)
					&& (client_copy_check->int_i % 10) < 9 ? "\012": ""));
			SFREE(str_temp1);
		}

		client_copy_check->int_i += 1;
	} while ((client_copy_check->int_i % 10) > 0);

finish:
	bol_error_state = false;
	SFREE_ALL();
	if (str_response != NULL) {
		WS_sendFrame(EV_A, client, true, 0x01, str_response, strlen(str_response));
		DArray_push(client_request->arr_response, str_response);
		str_response = NULL;
	}
}


void ws_raw_free(struct sock_ev_client_request_data *client_request_data) {
	struct sock_ev_client_raw *client_raw = (struct sock_ev_client_raw *)client_request_data;
	SINFO("client_raw->copy_check: %p", client_raw->copy_check);
	if (client_raw->copy_check != NULL) {
		decrement_idle(global_loop);
		ev_check_stop(global_loop, &client_raw->copy_check->check);
		SFREE(client_raw->copy_check);
	}
	if (client_raw->res != NULL) {
		PQclear(client_raw->res);
		client_raw->res = NULL;
	}
}
#endif
