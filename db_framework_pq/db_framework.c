#include "db_framework.h"

const char *const WONT_GUESS = "____GS_YOU_WONT_GUESS_THIS_DATA_JHDFKSHDFURIHKSDJFHUIRSDJHF____";
List *list_global_running_queries = NULL;

size_t int_global_log_queries_over = 120;
char *str_global_log_queries_over_action_name = NULL;

bool DB_init_framework() {
	PQinitOpenSSL(1, 0);
	return true;
}
#define DB_res_poll_free(A)                                                                                                          \
	if (A != NULL) {                                                                                                                 \
		if (A->list_query_node != NULL) {                                                                                            \
			QueryInfo *query_info = List_remove(list_global_running_queries, A->list_query_node);                                    \
			if (query_info != NULL) {                                                                                                \
				SFREE(query_info->str_query);                                                                                        \
				SFREE(query_info);                                                                                                   \
			}                                                                                                                        \
		}                                                                                                                            \
		SFREE(A);                                                                                                                    \
	}

char *_DB_get_diagnostic(DB_conn *conn, PGresult *res);
static void db_query_cb(EV_P, ev_io *w, int revents);
static void db_copy_out_check_cb(EV_P, ev_check *w, int revents);
static void db_cnxn_cb(EV_P, ev_io *w, int revents);

#define SUN_PROGRAM_LOWER_NAME "envelope"
#define SUN_PROGRAM_WORD_NAME "Envelope"
#define SUN_PROGRAM_UPPER_NAME "ENVELOPE"

void db_conn_error_cb(EV_P, ev_check *w, int revents) {
	if (revents != 0) {
	} // get rid of unused parameter warning
	DB_conn *conn = (void *)w;

	ev_check_stop(EV_A, &conn->check);
	ev_idle_stop(EV_A, &conn->idle);

	conn->connect_cb(EV_A, conn->cb_data, conn);
}

DB_conn *DB_connect(EV_P, void *cb_data, char *str_connstring, char *str_user,
	size_t int_user_len, char *str_password, size_t int_password_len,
	char *str_context_data, connect_cb_t connect_cb) {
	DB_conn *conn = NULL;
	PGconn *pg_conn = NULL;
	DB_poll *conn_poll = NULL;
	char *str_response = NULL;
	size_t int_escape_username_len = int_user_len;
	size_t int_escape_password_len = int_password_len;
	size_t int_conn_len = 0;
	size_t int_response_len = 0;
	SDEFINE_VAR_ALL(str_conn, str_escape_username, str_escape_password);

	SFINISH_SALLOC(conn, sizeof(DB_conn));
#ifdef _WIN32
	conn->int_sock = -1;
#endif
	conn->EV_A = EV_A;
	conn->driver = DB_DRIVER_POSTGRES;

	// Envelope uses pg_authid to authenticate
	if (str_user != NULL && str_password != NULL) {
		str_escape_username = escape_conninfo_value(str_user, &int_escape_username_len);
		str_escape_password = escape_conninfo_value(str_password, &int_escape_password_len);

		SFINISH_SNCAT(
			str_conn, &int_conn_len
			, " fallback_application_name='", (size_t)28
			, SUN_PROGRAM_WORD_NAME, strlen(SUN_PROGRAM_WORD_NAME)
			, "'", (size_t)1
			, str_connstring, strlen(str_connstring)
			, " user=", (size_t)6
			, str_escape_username, int_escape_username_len
			, " password=", (size_t)10
			, str_escape_password, int_escape_password_len
		);

		// **** WARNING ****
		// DO NOT UNCOMMENT THE NEXT LINE! THAT WILL PUT THE PASSWORD IN THE
		// CLEAR IN THE LOG!!!!
		// SDEBUG("str_conn>%s<", str_conn);
		// **** WARNING ****
	} else {
		SFINISH_SNCAT(
			str_conn, &int_conn_len
			, str_connstring, strlen(str_connstring)
		);
	}

	pg_conn = PQconnectStart(str_conn);


	SFINISH_CHECK(
		PQstatus(pg_conn) != CONNECTION_BAD
		, "cannot start connect: %s\012"
		, PQerrorMessage(pg_conn)
	);
	SFINISH_CHECK(
		PQsetnonblocking(pg_conn, 1) != -1
		, "could not set nonblocking connection: %i (%s), %s\012"
		, errno, strerror(errno), PQerrorMessage(pg_conn)
	);

	conn->int_status = 0;
	conn->conn = pg_conn;
	SFINISH_SET_CONN_PQ_SOCKET(conn);

	if (str_context_data[0] != 0) {
		SDEBUG("str_context_data: %s", str_context_data);
		SDEBUG("strlen(str_context_data): %d", strlen(str_context_data));
		conn->str_literal_context_data = DB_escape_literal(conn, str_context_data, strlen(str_context_data));
		SFINISH_CHECK(conn->str_literal_context_data != NULL, "DB_escape_literal failed on string: %s", str_context_data);
		SDEBUG("conn->str_literal_context_data: %s", conn->str_literal_context_data);
	}

	SFINISH_SALLOC(conn_poll, sizeof(DB_poll));
	conn->conn_poll = conn_poll;
	conn_poll->conn = conn;
	conn_poll->cb_data = cb_data;
	conn_poll->connect_cb = connect_cb;

	ev_io_init(&conn_poll->io, db_cnxn_cb, GET_CONN_PQ_SOCKET(conn), EV_WRITE);
	ev_io_start(EV_A, &conn_poll->io);

	SFREE_ALL();
	return conn;
finish:
	if (conn != NULL) {
		conn->int_status = -1;
		conn->cb_data = cb_data;
		conn->connect_cb = connect_cb;
        // +/-6 is to cut off FATAL\012
        SFINISH_SNCAT(
			conn->str_response, &conn->int_response_len
			, str_response + 6, int_response_len - 6
		);
		ev_check_init(&conn->check, db_conn_error_cb);
		ev_check_start(EV_A, &conn->check);
		ev_idle_init(&conn->idle, idle_cb);
		ev_idle_start(EV_A, &conn->idle);
	}
	SFREE(str_response);
	SFREE(conn_poll);
	if (pg_conn != NULL) {
		PQfinish(pg_conn);
	}
	SFREE_PWORD_ALL();
	return conn;
}

bool _DB_exec(
	EV_P, DB_conn *conn, void *cb_data, char *str_data, size_t int_len, char *str_query, query_cb_t query_cb, copy_cb_t copy_cb) {
	SDEBUG("DB_exec");
	// Send the sql
	DB_result_poll *res_poll = NULL;
	QueryInfo *query_info = NULL;

	SERROR_SALLOC(res_poll, sizeof(DB_result_poll));

	conn->res_poll = res_poll;

	res_poll->conn = conn;
	res_poll->cb_data = cb_data;
	res_poll->query_cb = query_cb;
	res_poll->copy_cb = copy_cb;
	res_poll->str_data = str_data;
	res_poll->int_len = (int)int_len;

	int int_status = PQsendQuery(conn->conn, str_query);
	SERROR_CHECK(int_status == 1, "PQsendQuery failed %s", PQerrorMessage(conn->conn));

	PQflush(conn->conn);

	if (int_global_log_queries_over > 0) {
		SERROR_SALLOC(query_info, sizeof(QueryInfo));
		SERROR_SNCAT(
			query_info->str_query, &query_info->int_query_len
			, str_query, strlen(str_query)
		);
		query_info->int_pid = PQbackendPID(conn->conn);
		query_info->tim_start = ev_now(EV_A);
		SERROR_CHECK(List_push(list_global_running_queries, query_info), "List_push failed");
		res_poll->list_query_node = list_global_running_queries->last;
	}

	// The EV_WRITE is because if you have a query longer than SSL allows in one packet, then you're going to have a bad time
	ev_io_init(&res_poll->io, db_query_cb, conn->int_sock, EV_READ | EV_WRITE);
	ev_io_start(EV_A, &res_poll->io);

	return true;
error:
	if (query_info != NULL) {
		SFREE(query_info->str_query);
	}
	SFREE(query_info);
	conn->res_poll = NULL;
	DB_res_poll_free(res_poll);
	return false;
}

// Takes a result, returns ana array of the column names for the result
DArray *DB_get_column_names(DB_result *res) {
	DArray *darr_ret = NULL;
	char *str_temp = NULL;
	size_t int_temp_len = 0;

	int int_num_columns = PQnfields(res->res);
	darr_ret = DArray_create(sizeof(char *), 1);
	int i;
	for (i = 0; i < int_num_columns; i++) {
		char *str_cell = PQfname(res->res, i);
		SERROR_SNCAT(
			str_temp, &int_temp_len
			, str_cell, strlen(str_cell)
		);
		SDEBUG("str_temp: %s", str_temp);
		DArray_push(darr_ret, str_temp);
		str_temp = NULL;
	}

	return darr_ret;
error:
	if (darr_ret != NULL) {
		DArray_clear_destroy(darr_ret);
	}
	SFREE(str_temp);
	return NULL;
}

bool DB_get_column_types_for_query4(EV_P, void *cb_data, DB_result *res);
bool DB_get_column_types_for_query3(EV_P, void *cb_data, DB_result *res);
bool DB_get_column_types_for_query2(EV_P, void *cb_data, DB_result *res);

// Takes sql, will eventually callback with a result of the column types in one row.
// The sql does not get run, it gets prepared and then we get the description of the result, not the result.
// Then we run format_type for each type using DB_exec, then we run the callback with that result.
bool DB_get_column_types_for_query(EV_P, DB_conn *conn, char *str_sql, void *cb_data, query_cb_t column_type_cb) {
	SDEBUG("DB_get_column_types_for_query: %s", str_sql);
	DB_result_poll *res_poll = NULL;

	// Put all the stuff we will need for the callback in a struct, we will pull it out later
	DB_result_poll *res_poll_child = NULL;
	SERROR_SALLOC(res_poll_child, sizeof(DB_result_poll));
	res_poll_child->conn = conn;
	res_poll_child->cb_data = cb_data;
	res_poll_child->query_cb = column_type_cb;
	res_poll_child->str_data = NULL;

	// We need a statement name to differenciate from other preparations
	SERROR_SALLOC(res_poll_child->str_query, 50);
	snprintf(res_poll_child->str_query, 50, "temp_%d", rand() % 10000);

	// Allocate polling data
	SERROR_SALLOC(res_poll, sizeof(DB_result_poll));

	conn->res_poll = res_poll;
	res_poll->conn = conn;
	res_poll->cb_data = res_poll_child;
	res_poll->query_cb = DB_get_column_types_for_query2;
	res_poll->str_data = NULL;

	// Prepare the sql
	int int_status = PQsendPrepare(conn->conn, res_poll_child->str_query, str_sql, 0, NULL);
	SERROR_CHECK(int_status == 1, "PQsendPrepare failed %s", PQerrorMessage(conn->conn));

	// Send it off to the next step
	ev_io_init(&res_poll->io, db_query_cb, conn->int_sock, EV_READ);
	ev_io_start(EV_A, &res_poll->io);

	return true;
error:
	conn->res_poll = NULL;
	DB_res_poll_free(res_poll);
	if (res_poll_child != NULL) {
		SFREE(res_poll_child->str_query);
		DB_res_poll_free(res_poll_child);
	}
	return false;
}

// Describe the query we prepared
bool DB_get_column_types_for_query2(EV_P, void *cb_data, DB_result *res) {
	SDEBUG("DB_get_column_types_for_query2");

	DB_result_poll *res_poll_child = cb_data;
	DB_result_poll *res_poll = NULL;

	SERROR_CHECK(res != NULL, "DB_get_column_types_for_query failed");
	SERROR_CHECK(res->status == DB_RES_COMMAND_OK, "DB_get_column_types_for_query failed");

	// Allocate polling data
	SERROR_SALLOC(res_poll, sizeof(DB_result_poll));

	res_poll_child->conn->res_poll = res_poll;
	res_poll->conn = res_poll_child->conn;
	res_poll->cb_data = res_poll_child;
	res_poll->query_cb = DB_get_column_types_for_query3;
	res_poll->str_data = NULL;

	// Describe the sql
	int int_status = PQsendDescribePrepared(res_poll_child->conn->conn, res_poll_child->str_query);
	SERROR_CHECK(int_status == 1, "PQsendDescribePrepared failed %s", PQerrorMessage(res_poll_child->conn->conn));
	DB_free_result(res);

	// Send it off to the next step
	ev_io_init(&res_poll->io, db_query_cb, res_poll_child->conn->int_sock, EV_READ);
	ev_io_start(EV_A, &res_poll->io);

	return true;
error:
	DB_res_poll_free(res_poll);
	if (res_poll_child != NULL) {
		res_poll_child->conn->res_poll = NULL;
		query_cb_t query_cb = res_poll_child->query_cb;
		cb_data = res_poll_child->cb_data;

		SFREE(res_poll_child->str_query);
		DB_res_poll_free(res_poll_child);

		query_cb(EV_A, cb_data, res);
	}
	return true;
}

// Send the query we described to DB_get_column_types to get the types
bool DB_get_column_types_for_query3(EV_P, void *cb_data, DB_result *res) {
	SDEBUG("DB_get_column_types_for_query3");
	DB_result_poll *res_poll_child = cb_data;
	// DB_conn *conn = res->conn;
	SDEFINE_VAR_ALL(str_sql);
	size_t int_sql_len = 0;

	res_poll_child->res = res;

	SERROR_CHECK(res != NULL, "DB_get_column_types_for_query failed");
	SERROR_CHECK(res->status == DB_RES_COMMAND_OK, "DB_get_column_types_for_query failed");

	SERROR_SNCAT(
		str_sql, &int_sql_len
		, "DEALLOCATE ", (size_t)11
		, res_poll_child->str_query, strlen(res_poll_child->str_query)
	);
	// Run sql, callback the function the user specified, they will have a result with all the column types
	SERROR_CHECK(
		DB_exec(EV_A, res_poll_child->conn, res_poll_child, str_sql, DB_get_column_types_for_query4) == true
		, "DB_exec failed"
	);

	SFREE_ALL();
	return true;
error:
	SFREE_ALL();
	res_poll_child->conn->res_poll = NULL;
	res_poll_child->query_cb(EV_A, res_poll_child->cb_data, res);
	DB_free_result(res);
	SFREE(res_poll_child->str_query);
	DB_res_poll_free(res_poll_child);
	return false;
}

bool DB_get_column_types_for_query4(EV_P, void *cb_data, DB_result *res) {
	DB_result_poll *res_poll_child = cb_data;

	// Get the column types, and send the original callback stuff
	SERROR_CHECK(
		DB_get_column_types(EV_A, res_poll_child->res, res_poll_child->cb_data, res_poll_child->query_cb)
		, "DB_get_column_types failed"
	);

	DB_free_result(res_poll_child->res);
	DB_free_result(res);
	SFREE(res_poll_child->str_query);
	res_poll_child->conn->res_poll = NULL;
	DB_res_poll_free(res_poll_child);
	return true;
error:
	res_poll_child->query_cb(EV_A, res_poll_child->cb_data, res);
	DB_free_result(res_poll_child->res);
	DB_free_result(res);
	SFREE(res_poll_child->str_query);
	res_poll_child->conn->res_poll = NULL;
	DB_res_poll_free(res_poll_child);
	return false;
}

// Get the column types of a query, and callback with the result
bool DB_get_column_types(EV_P, DB_result *res, void *cb_data, query_cb_t column_type_cb) {
	char *str_oid_type = NULL;
	char *str_int_mod = NULL;
	SDEFINE_VAR_ALL(str_temp, str_sql, str_col_ident);
	int int_num_columns = PQnfields(res->res);
	int int_column;
	size_t int_sql_len = 0;

	// Build sql for getting the full types
	SERROR_SNCAT(
		str_sql, &int_sql_len
		, "SELECT ", (size_t)7
	);
	for (int_column = 0; int_column < int_num_columns; int_column += 1) {
		// Turn the type oid into a string
		SERROR_SALLOC(str_temp, 20);
		sprintf(str_temp, "%u", PQftype(res->res, int_column));
		str_oid_type = PQescapeLiteral(res->conn->conn, str_temp, strlen(str_temp));
		SFREE(str_temp);

		// Same for type modifier
		SERROR_SALLOC(str_temp, 20);
		sprintf(str_temp, "%d", PQfmod(res->res, int_column));
		str_int_mod = PQescapeLiteral(res->conn->conn, str_temp, strlen(str_temp));
		SFREE(str_temp);

		str_col_ident = DB_escape_identifier(res->conn, PQfname(res->res, int_column), strlen(PQfname(res->res, int_column)));
		SERROR_CHECK(str_col_ident != NULL, "Could not escape column name for identifiers. (DB_escape_identifier failed)");
		// Add them to the sql, note the "AS" clause so that the column name is
		// available in the next function
		SERROR_SNFCAT(
			str_sql, &int_sql_len
			, "format_type(", (size_t)12
			, str_oid_type, strlen(str_oid_type)
			, ", ", (size_t)2
			, str_int_mod, strlen(str_int_mod)
			, ") AS ", (size_t)5
			, str_col_ident, strlen(str_col_ident)
			, int_column < (int_num_columns - 1) ? "," : ";", (size_t)1
		);
		SFREE(str_col_ident);
		PQfreemem(str_oid_type);
		str_oid_type = NULL;
		PQfreemem(str_int_mod);
		str_int_mod = NULL;
	}
	SDEBUG("str_sql: %s", str_sql);

	// Run sql, callback the function the user specified, they will have a result with all the column types
	SERROR_CHECK(DB_exec(EV_A, res->conn, cb_data, str_sql, column_type_cb) == true, "DB_exec failed");

	SFREE_ALL();
	return true;
error:
	if (str_oid_type != NULL) {
		PQfreemem(str_oid_type);
	}
	if (str_int_mod != NULL) {
		PQfreemem(str_int_mod);
	}
	SFREE_ALL();
	return false;
}

// Move to the next row of the result
DB_fetch_status DB_fetch_row(DB_result *res) {
	if (res->bol_first_row && res->int_len > 0) {
		res->bol_first_row = false;
		return DB_FETCH_OK;
	}
	res->int_row++;
	if (res->int_row < res->int_len) {
		return DB_FETCH_OK;
	} else {
		return DB_FETCH_END;
	}
}

// Get values of the current row
DArray *DB_get_row_values(DB_result *res) {
	// TODO: If this is run before the first DB_fetch_row then give an intelligent error
	DArray *darr_ret = NULL;
	char *str_temp = NULL;
	size_t int_length;
	int int_num_columns = PQnfields(res->res);
	darr_ret = DArray_create(sizeof(char *), 1);
	int i;
	for (i = 0; i < int_num_columns; i++) {
		// If the current value is null, then forget it
		if (PQgetisnull(res->res, res->int_row, i)) {
			DArray_push(darr_ret, NULL);
		} else {
			int_length = (size_t)PQgetlength(res->res, res->int_row, i);
			SERROR_SALLOC(str_temp, int_length + 1);
			memcpy(str_temp, PQgetvalue(res->res, res->int_row, i), int_length);
			str_temp[int_length] = '\0';
			DArray_push(darr_ret, str_temp);
			str_temp = NULL;
		}
	}

	return darr_ret;
error:
	if (darr_ret != NULL) {
		DArray_clear_destroy(darr_ret);
	}
	SFREE(str_temp);
	return NULL;
}

// Get lengths for each value of the current row
DArray *DB_get_row_lengths(DB_result *res) {
	DArray *darr_ret = NULL;
	ssize_t *int_temp = NULL;
	int int_num_columns = PQnfields(res->res);
	darr_ret = DArray_create(sizeof(ssize_t *), 1);
	int i;
	for (i = 0; i < int_num_columns; i++) {
		SERROR_SALLOC(int_temp, sizeof(ssize_t));
		if (PQgetisnull(res->res, res->int_row, i)) {
			*int_temp = -1;
		} else {
			*int_temp = PQgetlength(res->res, res->int_row, i);
		}
		DArray_push(darr_ret, int_temp);
		int_temp = NULL;
	}

	return darr_ret;

error:
	if (darr_ret != NULL) {
		DArray_clear_destroy(darr_ret);
	}
	SFREE(int_temp);
	return NULL;
}

// Free the result
void _DB_free_result(DB_result *res) {
	if (res != NULL) {
		PQclear(res->res);
		SFREE(res);
	}
}

char *DB_get_diagnostic(DB_conn *conn, DB_result *res) {
	char *str_response = res != NULL ? _DB_get_diagnostic(conn, res->res) : strdup("");
	return str_response;
}

char *_DB_get_diagnostic(DB_conn *conn, PGresult *res) {
	// DO NOT MESS WITH THE RETURN FORMAT OF THIS FUNCTION WITHOUT UPDATING THE JS
	char *str_response = NULL;
	size_t int_response_len = 0;
	size_t int_temp_len = 0;
	char *str_temp = NULL;

	// get vars with error stuff
	char *return_error = PQerrorMessage(conn->conn);
	if (return_error == NULL) {
		return NULL;
	}
	char *return_detail = PQresultErrorField(res, PG_DIAG_MESSAGE_DETAIL);
	char *return_hint = PQresultErrorField(res, PG_DIAG_MESSAGE_HINT);
	char *return_query = PQresultErrorField(res, PG_DIAG_INTERNAL_QUERY);
	char *return_context = PQresultErrorField(res, PG_DIAG_CONTEXT);
	char *return_err_pos = PQresultErrorField(res, PG_DIAG_STATEMENT_POSITION);

	// coalesce vars
	return_error = return_error != NULL ? strdup(return_error) : strdup("");
	return_detail = return_detail != NULL ? strdup(return_detail) : strdup("");
	return_hint = return_hint != NULL ? strdup(return_hint) : strdup("");
	return_query = return_query != NULL ? strdup(return_query) : strdup("");
	return_context = return_context != NULL ? strdup(return_context) : strdup("");
	return_err_pos = return_err_pos != NULL ? strdup(return_err_pos) : strdup("");

	SFINISH_CHECK(return_error != NULL, "return_error failed");
	SFINISH_CHECK(return_detail != NULL, "return_detail failed");
	SFINISH_CHECK(return_hint != NULL, "return_hint failed");
	SFINISH_CHECK(return_query != NULL, "return_query failed");
	SFINISH_CHECK(return_context != NULL, "return_context failed");
	SFINISH_CHECK(return_err_pos != NULL, "return_err_pos failed");

	SDEBUG(
		"postgres execute error\012\
error: %s\012\
detail: %s\012\
hint: %s\012\
query: %s\012\
context: %s\012\
err_pos: %s\012"
		, return_error, return_detail, return_hint, return_query, return_context, return_err_pos
	);

	str_temp = return_error;
	int_temp_len = strlen(str_temp);
	return_error = bescape_value(str_temp, &int_temp_len);
	SFINISH_CHECK(return_error != NULL, "bescape_value failed");
	SFREE(str_temp);

	str_temp = return_detail;
	int_temp_len = strlen(str_temp);
	return_detail = bescape_value(str_temp, &int_temp_len);
	SFINISH_CHECK(return_detail != NULL, "bescape_value failed");
	SFREE(str_temp);

	str_temp = return_hint;
	int_temp_len = strlen(str_temp);
	return_hint = bescape_value(str_temp, &int_temp_len);
	SFINISH_CHECK(return_hint != NULL, "bescape_value failed");
	SFREE(str_temp);

	str_temp = return_query;
	int_temp_len = strlen(str_temp);
	return_query = bescape_value(str_temp, &int_temp_len);
	SFINISH_CHECK(return_query != NULL, "bescape_value failed");
	SFREE(str_temp);

	str_temp = return_context;
	int_temp_len = strlen(str_temp);
	return_context = bescape_value(str_temp, &int_temp_len);
	SFINISH_CHECK(return_context != NULL, "bescape_value failed");
	SFREE(str_temp);

	str_temp = return_err_pos;
	int_temp_len = strlen(str_temp);
	return_err_pos = bescape_value(str_temp, &int_temp_len);
	SFINISH_CHECK(return_err_pos != NULL, "bescape_value failed");
	SFREE(str_temp);

	// build response
	SFINISH_SNCAT(
		str_response, &int_response_len
		, "", (size_t)0
	);
	// clang-format off
	SFINISH_SNFCAT(
		str_response, &int_response_len
		, "FATAL\012error_text\t", (size_t)17
		, return_error, strlen(return_error)
		, "\012error_detail\t", (size_t)14
		, return_detail, strlen(return_detail)
		, "\012error_hint\t", (size_t)12
		, return_hint, strlen(return_hint)
		, "\012error_query\t", (size_t)13
		, return_query, strlen(return_query)
		, "\012error_context\t", (size_t)15
		, return_context, strlen(return_context)
		, "\012error_position\t", (size_t)16
		, return_err_pos, strlen(return_err_pos)
		, "\012", (size_t)1
	);
// clang-format on

finish:
	// free
	SFREE(str_temp);
	SFREE(return_error);
	SFREE(return_detail);
	SFREE(return_hint);
	SFREE(return_query);
	SFREE(return_context);
	SFREE(return_err_pos);

	return str_response;
}

// It isn't practical to return a length for these functions because PQescapeLiteral doesn't
// Escape string for use in a query
char *DB_escape_literal(DB_conn *conn, char *str, size_t int_len) {
	SDEBUG("str: %s", str);
	char *str_output = NULL;
	size_t int_output_len = 0;
	char *str_temp = NULL;
	if (str == NULL) {
		return NULL;
	}
	if (check_to_escape(str, false)) {
		str_temp = PQescapeLiteral(conn->conn, str, int_len);
		SDEBUG("str_temp: %s", str_temp);
		SERROR_SNCAT(
			str_output, &int_output_len
			, str_temp, strlen(str_temp)
		);
		PQfreemem(str_temp);
	} else {
		SERROR_SNCAT(
			str_output, &int_output_len
			, str, strlen(str)
		);
	}
	SDEBUG("str_output: %s", str_output);
	return str_output;
error:
	if (str_temp) {
		PQfreemem(str_temp);
	}
	SFREE(str_output);
	return NULL;
}

// Escape object name for use in a query
char *DB_escape_identifier(DB_conn *conn, char *str, size_t int_len) {
	char *str_output = NULL;
	size_t int_output_len = 0;
	char *str_temp = NULL;
	if (str == NULL) {
		return NULL;
	}
	if (check_to_escape(str, true)) {
		str_temp = PQescapeIdentifier(conn->conn, str, int_len);
		SERROR_SNCAT(
			str_output, &int_output_len
			, str_temp, strlen(str_temp)
		);
		PQfreemem(str_temp);
	} else {
		SERROR_SNCAT(
			str_output, &int_output_len
			, str, strlen(str)
		);
	}
	return str_output;
error:
	if (str_temp) {
		PQfreemem(str_temp);
	}
	SFREE(str_output);
	return NULL;
}

char *DB_cancel_query(DB_conn *conn) {
	char str_temp1[256] = { 0 };
	PGcancel *cancel_request = PQgetCancel(conn->conn);
	int int_ret_val = PQcancel(cancel_request, str_temp1, 255);
	PQfreeCancel(cancel_request);
	if (int_ret_val != 1) {
		return SERROR_RESPONSE("PQcancel failed: %s", str_temp1);
	}
	if (conn->copy_check != NULL) {
		ev_check_stop(conn->EV_A, &conn->copy_check->check);
		ev_idle_stop(conn->EV_A, &conn->idle);
		PQclear(conn->copy_check->res);
		SFREE(conn->copy_check);
	}
	if (conn->res_poll != NULL) {
		ev_io_stop(conn->EV_A, &conn->res_poll->io);
		DB_res_poll_free(conn->res_poll);
	}

	return NULL;
}

void _DB_finish(DB_conn *conn) {
#ifdef _WIN32
	if (conn->int_sock != -1) {
		_close(conn->int_sock);
		conn->int_sock = -1;
	} else {
		// this is here because otherwise the above else isn't run
		SINFO("conn->int_sock == -1");
	}
#endif

	SDEBUG("conn->copy_check: %p", conn->copy_check);
	if (conn->copy_check != NULL) {
		ev_check_stop(conn->EV_A, &conn->copy_check->check);
		ev_idle_stop(conn->EV_A, &conn->idle);
		PQclear(conn->copy_check->res);
		SFREE(conn->copy_check);
	}
	if (conn->res_poll != NULL) {
		ev_io_stop(conn->EV_A, &conn->res_poll->io);
		DB_res_poll_free(conn->res_poll);
	}
	if (conn->conn_poll != NULL) {
		ev_io_stop(conn->EV_A, &conn->conn_poll->io);
		SFREE(conn->conn_poll);
	}

	SFREE(conn->str_response);
	SFREE(conn->str_literal_context_data);
	PQfinish(conn->conn);
	SFREE(conn);
}

static void db_query_cb(EV_P, ev_io *w, int revents) {
	if (revents != 0) {
	} // get rid of unused parameter warning
	DB_copy_check *db_copy_check = NULL;
	DB_result_poll *res_poll = (DB_result_poll *)w;
	DB_result *db_res = NULL;
	DB_conn *conn = res_poll->conn;
	SDEBUG("db_query_cb: w->fd %d, conn->int_sock %d, PQsocket(conn->conn) %d, conn %p, conn->conn %p", w->fd, conn->int_sock, PQsocket(conn->conn), conn, conn->conn);
	SDEBUG("revents: %d", revents);
	SDEBUG("EV_READ: %d", (revents & EV_READ) == EV_READ);
	SDEBUG("EV_WRITE: %d", (revents & EV_WRITE) == EV_WRITE);
	SDEBUG("w->events: %d", w->events);
	SDEBUG("EV_READ: %d", (w->events & EV_READ) == EV_READ);
	SDEBUG("EV_WRITE: %d", (w->events & EV_WRITE) == EV_WRITE);
	SDEBUG("w->active: %d", w->active);

	PGresult *res = NULL;
	DArray *arr_res = NULL;

	ExecStatusType result = 0;
	int int_status = 1;
	int int_status2 = 1;
	size_t int_i = 0, int_j = 0, int_len = 0;
	query_cb_t query_cb = NULL;

	SDEFINE_VAR_ALL(str_error);

	if ((revents & EV_WRITE) == EV_WRITE) {
		if (PQflush(conn->conn) == 0) {
			ev_io_set(w, w->fd, EV_READ);
		}
	}
	if ((revents & EV_READ) == EV_READ) {
		int_status = PQconsumeInput(conn->conn);
		if (int_status != 1) {
			SERROR_NORESPONSE("PQconsumeInput failed %s", PQerrorMessage(conn->conn));
			conn->res_poll = NULL;
			ev_io_stop(EV_A, &res_poll->io);
			res_poll->query_cb(EV_A, res_poll->cb_data, db_res);
			DB_res_poll_free(res_poll);
			return;
		}
	}

	int_status2 = PQisBusy(conn->conn);
	SDEBUG("PQisBusy: %d", int_status2);

	if (int_status2 != 1) {
		arr_res = DArray_create(1, sizeof(PGresult *));
		query_cb = res_poll->query_cb;

		// Here we get all of the results and push them to an array
		int_j = 0;
		res = PQgetResult(conn->conn);
		result = PQresultStatus(res);
		while (
			res != NULL
			// This is because if we keep calling
			//		PQgetResult while we are in a COPY state,
			//		we keep getting a COPY result
			// Also note, this will only work if the COPY is the only query
			&& (
				int_j == 0
				|| (
					result != PGRES_COPY_OUT
					&& result != PGRES_COPY_IN
				)
			)
		) {
			DArray_push(arr_res, res);
			res = PQgetResult(conn->conn);
			result = PQresultStatus(res);
			int_j += 1;
		}
		SDEBUG("result: %d", result);
		SDEBUG("PGRES_COPY_OUT: %d", PGRES_COPY_OUT);
		SDEBUG("PGRES_COPY_IN: %d", PGRES_COPY_IN);
		if (result == PGRES_COPY_OUT) {
			SERROR_SALLOC(db_copy_check, sizeof(DB_copy_check));
			db_copy_check->copy_cb = res_poll->copy_cb;
			db_copy_check->cb_data = res_poll->cb_data;
			db_copy_check->conn = res_poll->conn;
			db_copy_check->res = res;
			ev_check_init(&db_copy_check->check, db_copy_out_check_cb);
			ev_check_start(EV_A, &db_copy_check->check);
			res_poll->conn->copy_check = db_copy_check;

			ev_idle_init(&conn->idle, idle_cb);
			ev_idle_start(EV_A, &conn->idle);

			int_i = 0;
			int_len = DArray_end(arr_res);
			while (int_i < int_len) {
				res = DArray_get(arr_res, int_i);
				if (res != NULL) {
					PQclear(res);
				}
				int_i++;
			}
			DArray_destroy(arr_res);
			conn->res_poll = NULL;
			ev_io_stop(EV_A, &res_poll->io);
			DB_res_poll_free(res_poll);
			SFREE_ALL();
			return;
		} else if (result == PGRES_COPY_IN) {
			SDEBUG("result == PGRES_COPY_IN");
			int_status = PQputCopyData(conn->conn, res_poll->str_data, res_poll->int_len);
			SDEBUG("res_poll->int_len = %d", res_poll->int_len);
			SDEBUG("int_status = %d", int_status);
			SERROR_CHECK(int_status == 1, "PQputCopyData failed: %s", PQerrorMessage(conn->conn));
			int_status = PQputCopyEnd(conn->conn, 0);
			SDEBUG("int_status = %d", int_status);
			SERROR_CHECK(int_status == 1, "PQputCopyEnd failed: %s", PQerrorMessage(conn->conn));

			PQclear(res);

			int_i = 0;
			int_len = DArray_end(arr_res);
			SDEBUG("int_len = %d", int_len);
			while (int_i < int_len) {
				res = DArray_get(arr_res, int_i);
				if (res != NULL) {
					PQclear(res);
				}
				int_i++;
			}

			DArray_destroy(arr_res);
			SFREE_ALL();
			SDEBUG("w->active: %d", w->active);

			ev_io_set(w, w->fd, EV_READ | EV_WRITE);
			return;
		} else {
			ev_io_stop(EV_A, &res_poll->io);
		}
		/*
		// This is actually not reached at all - Nunzio on March 17, 2017
		if (res != NULL) {
			// This is only reached in the case of a copy, in which case, this needs to be cleared (see above)
			PQclear(res);
			res = NULL;
		}*/

		conn->res_poll = NULL;
		// Now we loop through the gathered results
		int_len = DArray_end(arr_res);
		while (int_i < int_len) {
			res = DArray_get(arr_res, int_i);
			result = PQresultStatus(res);

			// Build a DB_result
			SERROR_SALLOC(db_res, sizeof(DB_result));
			// clang-format off
            db_res->status =
                result == PGRES_TUPLES_OK       ? DB_RES_TUPLES_OK      :
                result == PGRES_COMMAND_OK      ? DB_RES_COMMAND_OK     :
                result == PGRES_COPY_OUT        ? DB_RES_COPY_OUT       :
                result == PGRES_COPY_IN         ? DB_RES_COPY_IN        :
                result == PGRES_FATAL_ERROR     ? DB_RES_FATAL_ERROR    :
                result == PGRES_NONFATAL_ERROR  ? DB_RES_NONFATAL_ERROR :
                result == PGRES_BAD_RESPONSE    ? DB_RES_BAD_RESPONSE   :
                result == PGRES_EMPTY_QUERY     ? DB_RES_EMPTY_QUERY    :       DB_RES_UTIL_ERROR;
			// clang-format on
			db_res->res = res;
			db_res->conn = conn;
			db_res->bol_first_row = true;
			db_res->int_row = 0;
			db_res->int_len = (result == PGRES_TUPLES_OK ? (long)PQntuples(res) : 0);
			db_res->int_len = (result == PGRES_COMMAND_OK ? strtol(PQcmdTuples(res), NULL, 10) : db_res->int_len);

			if (res_poll->copy_cb != NULL) {
				str_error = _DB_get_diagnostic(conn, res);
				res_poll->copy_cb(EV_A, false, true, res_poll->cb_data, str_error, strlen(str_error));
				SFREE(str_global_error);
				SFREE(str_error);
				DB_free_result(db_res);
			} else if (query_cb != NULL) {
				query_cb(EV_A, res_poll->cb_data, db_res);
				SFREE(str_global_error);
			} else {
				DB_free_result(db_res);
			}

			int_i += 1;
		}
		// If we break out early, we need to free all of the remaining results
		while (int_i < int_len) {
			res = DArray_get(arr_res, int_i);
			if (res != NULL) {
				PQclear(res);
			}
			int_i++;
		}

		DArray_destroy(arr_res);
		DB_res_poll_free(res_poll);
	}
	SFREE_ALL();
	return;
error:
	SFREE_ALL();
	// Same as above
	while (int_i < int_len) {
		res = DArray_get(arr_res, int_i);
		if (res != NULL) {
			PQclear(res);
		}
		int_i++;
	}
	conn->res_poll = NULL;
	DArray_destroy(arr_res);
	DB_res_poll_free(res_poll);

	// There is no danger of this being an invalid free
	SFREE(db_res);
}

static void db_copy_out_check_cb(EV_P, ev_check *w, int revents) {
	if (revents != 0) {
	} // get rid of unused parameter warning
	DB_copy_check *copy_check = (DB_copy_check *)w;

	char *str_response = NULL;
	size_t int_response_len = 0;

	char **buffer_ptr_ptr = NULL;
	PGresult *res = NULL;
	ExecStatusType result = 0;

	int int_status = 0;

	SFINISH_CHECK(copy_check->conn != NULL, "copy_check->conn == NULL");
	SFINISH_SALLOC(buffer_ptr_ptr, sizeof(void *));

	int int_i = 0;

	do {
		int_status = PQgetCopyData(copy_check->conn->conn, buffer_ptr_ptr, 0);
		// continue copying
		if (int_status > 0) {
			bool bol_ret = copy_check->copy_cb(EV_A, true, false, copy_check->cb_data, *buffer_ptr_ptr, strlen(*buffer_ptr_ptr));
			if (bol_ret == false) {
				PQfreemem(*buffer_ptr_ptr);
				break;
			}

			// fail
		} else if (int_status == -2) {
			SFINISH("Copy statement failed: %s", PQerrorMessage(copy_check->conn->conn));

			// success, end of data
		} else if (int_status == -1) {
			res = PQgetResult(copy_check->conn->conn);
			result = PQresultStatus(res);
			PQclear(res);
			res = PQgetResult(copy_check->conn->conn);
			while (res != NULL) {
				PQclear(res);
				res = PQgetResult(copy_check->conn->conn);
			}
			if (result == PGRES_FATAL_ERROR) {
				SFINISH("Failed to copy query: %s", PQerrorMessage(copy_check->conn->conn));
			}

			void *cb_data = copy_check->cb_data;
			copy_cb_t copy_cb = copy_check->copy_cb;

			ev_check_stop(EV_A, &copy_check->check);
			ev_idle_stop(EV_A, &copy_check->conn->idle);
			PQclear(copy_check->res);

			// ev_io_init(&res_poll->io, db_query_cb, conn->int_sock, EV_READ);
			// ev_io_start(EV_A, &copy_check->res_poll->io);

			SDEBUG("SFREE(copy_check);");
			copy_check->conn->copy_check = NULL;
			SFREE(copy_check);
			// client_request_free(client_request);
			// client_request_free takes care of this
			// SFREE(client_insert);

			SFINISH_SNCAT(
				str_response, &int_response_len
				, "TRANSACTION COMPLETED", (size_t)21
			);
			copy_cb(EV_A, true, true, cb_data, str_response, strlen(str_response));
		}
		int_i += 1;
		PQfreemem(*buffer_ptr_ptr);
	} while (int_status > 0 && int_i < 10);

	bol_error_state = false;
finish:
	SFREE(buffer_ptr_ptr);
	if (bol_error_state == true || int_status == -2 || result == PGRES_FATAL_ERROR) {
		bol_error_state = false;

		SFREE(str_response);

		if (copy_check) {
			res = res != NULL ? res : PQgetResult(copy_check->conn->conn);
			str_response = _DB_get_diagnostic(copy_check->conn, res);

			copy_cb_t copy_cb = copy_check->copy_cb;
			ev_idle_stop(EV_A, &copy_check->conn->idle);
			ev_check_stop(EV_A, &copy_check->check);
			PQclear(copy_check->res);
			copy_check->conn->copy_check = NULL;
			copy_cb(EV_A, false, true, copy_check->cb_data, str_response, strlen(str_response));
			SFREE(copy_check);
		}
		if (res) {
			PQclear(res);
		}
	}
	SFREE(str_response);
}

bool db_conn_cb_context_data(EV_P, void *cb_data, DB_result *res) {
	char *str_response = NULL;
	DB_poll *conn_poll = cb_data;
	DB_conn *conn = conn_poll->conn;
    size_t int_response_len = 0;

	SFINISH_CHECK(res != NULL, "failed to set context data");
	SFINISH_CHECK(res->status == DB_RES_COMMAND_OK, "failed to set context data, res->status = %d: %s", res->status, res->conn->str_response);

	conn->int_status = 1;
	conn->conn_poll = NULL;
	conn_poll->connect_cb(EV_A, conn_poll->cb_data, conn);
	SFREE(conn_poll);
finish:
	if (str_response != NULL) {
		conn->int_status = -1;
		SFREE(conn->str_response);
        // +/-6 is to cut off FATAL\012
        SFINISH_SNCAT(
			conn->str_response, &conn->int_response_len
			, str_response + 6, int_response_len - 6
		);
		SFREE(str_response);
		conn->conn_poll = NULL;
		conn_poll->connect_cb(EV_A, conn_poll->cb_data, conn);
		// This is because the callback is required to call DB_finish
		// DB_finish(conn);
		SFREE(conn_poll);
	}
	DB_free_result(res);
	return true;
}

static void db_cnxn_cb(EV_P, ev_io *w, int revents) {
	if (revents != 0) {
	} // get rid of unused parameter warning
	DB_poll *conn_poll = (DB_poll *)w;
	DB_conn *conn = conn_poll->conn;
	char *str_response = NULL;
	char *str_sql = NULL;
	size_t int_sql_len = 0;
	size_t int_response_len = 0;

	PostgresPollingStatusType status = PQconnectPoll(conn->conn);

	// Some debug info
	switch (PQstatus(conn->conn)) {
		case CONNECTION_STARTED:
			SDEBUG("waiting for connection to be made.");
			break;
		case CONNECTION_MADE:
			SDEBUG("connection OK; waiting to send.");
			break;
		case CONNECTION_AWAITING_RESPONSE:
			SDEBUG("waiting for a response from the server.");
			break;
		case CONNECTION_AUTH_OK:
			SDEBUG("received authentication; waiting for backend start-up to finish.");
			break;
		case CONNECTION_SSL_STARTUP:
			SDEBUG("negotiating SSL encryption.");
			break;
		case CONNECTION_SETENV:
			SDEBUG("negotiating environment-driven parameter settings.");
			break;
		case CONNECTION_OK:
			SDEBUG("CONNECTION_OK");
			break;
		case CONNECTION_BAD:
			SDEBUG("CONNECTION_BAD");
			break;
		case CONNECTION_NEEDED:
			SDEBUG("CONNECTION_NEEDED");
			break;
		case CONNECTION_CHECK_WRITABLE:
			SDEBUG("CONNECTION_CHECK_WRITABLE");
			break;
		case CONNECTION_CONSUME:
			SDEBUG("CONNECTION_CONSUME");
			break;
		case CONNECTION_GSS_STARTUP:
			SDEBUG("CONNECTION_GSS_STARTUP");
			break;
		case CONNECTION_CHECK_TARGET:
			SDEBUG("CONNECTION_CHECK_TARGET");
			break;
		case CONNECTION_CHECK_STANDBY:
			SDEBUG("CONNECTION_CHECK_STANDBY");
			break;
	}

	if (status == PGRES_POLLING_OK) {
		// Connection made
		SDEBUG("PGRES_POLLING_OK");
		ev_io_stop(EV_A, &conn_poll->io);
		//conn_poll->connect_cb(EV_A, conn_poll->cb_data, conn);
		//SFREE(conn_poll);
		if (conn->str_literal_context_data != NULL) {
			SFINISH_SNCAT(
				str_sql, &int_sql_len
				, "SET sunny.context_info = ", (size_t)25
				, conn->str_literal_context_data, strlen(conn->str_literal_context_data)
				, ";", (size_t)1
			);
			SDEBUG("str_sql: %s", str_sql);
			DB_exec(EV_A, conn, conn_poll, str_sql, db_conn_cb_context_data);
		} else {
			conn->int_status = 1;
			conn->conn_poll = NULL;
			conn_poll->connect_cb(EV_A, conn_poll->cb_data, conn);
			SFREE(conn_poll);
		}

	} else if (status == PGRES_POLLING_FAILED) {
		// Connection failed
		SDEBUG("PGRES_POLLING_FAILED");
		SFINISH("Connect failed: %s", PQerrorMessage(conn->conn));

	} else if (status == PGRES_POLLING_READING) {
		// We want to read
		SDEBUG("PGRES_POLLING_READING");

		ev_io_stop(EV_A, w);
		ev_io_set(w, GET_CONN_PQ_SOCKET(conn), EV_READ);
		ev_io_start(EV_A, w);

	} else if (status == PGRES_POLLING_WRITING) {
		// We want to write
		SDEBUG("PGRES_POLLING_WRITING");

		ev_io_stop(EV_A, w);
		ev_io_set(w, GET_CONN_PQ_SOCKET(conn), EV_WRITE);
		ev_io_start(EV_A, w);
	}
	bol_error_state = false;
finish:
	SFREE(str_sql);
	if (str_response != NULL) {
		ev_io_stop(EV_A, w);
		conn->int_status = -1;
		SFREE(conn->str_response);
        // +/-6 is to cut off FATAL\012
        SFINISH_SNCAT(conn->str_response, &conn->int_response_len, str_response + 6, int_response_len - 6);
		SFREE(str_response);
		conn->conn_poll = NULL;
		conn_poll->connect_cb(EV_A, conn_poll->cb_data, conn);
		// This is because the callback is required to call DB_finish
		// DB_finish(conn);
		SFREE(conn_poll);
	}
}

/* Expands a parameter value for a connection info string
*
* src must be a C-string with a NUL terminator
*/
char *escape_conninfo_value(char *str_src, size_t *int_len) {
	char *str_result = NULL;
	char *ptr_dest = NULL;
	char *ptr_src_start = str_src;

	size_t int_old_len = *int_len;
	SERROR_SALLOC(str_result, (*int_len * 2) + 3);
	ptr_dest = str_result;
	if (*int_len == 0) {
		SERROR_NORESPONSE("escape_conninfo_value: strlen = 0");
		*str_result = '\0';
		return str_result;
	}

	*(ptr_dest++) = '\'';
	*int_len = 1;
	char c;

	while ((size_t)(str_src - ptr_src_start) < int_old_len) {
		c = *(str_src++);
		switch (c) {
			case '\\':
				*(ptr_dest++) = '\\';
				*(ptr_dest++) = '\\';
				*int_len += 2;
				break;
			case '\'':
				*(ptr_dest++) = '\\';
				*(ptr_dest++) = '\'';
				*int_len += 2;
				break;
			default:
				*(ptr_dest++) = c;
				*int_len += 1;
		}
	}

	*(ptr_dest++) = '\'';
	*int_len += 1;
	*ptr_dest = '\0'; /* Ensure nul terminator */

	return str_result;
error:
	SFREE(str_result);
	return NULL;
}
