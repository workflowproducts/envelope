#pragma once

#include "common_client.h"
#include "util_darray.h"
#include "util_error.h"
#include "util_sql_split.h"
#include "util_string.h"
#include "ws_insert.h"
#include "ws_select.h"
#include "ws_update.h"

/*
This function splits the query with DArray_sql_split and makes sure there is only one query
*/
bool query_is_safe(char *str_query);

/*
This function takes a SELECT/INSERT/UPDATE/DELETE request and returns the table name
*/
char *get_table_name(char *_str_query, size_t int_query_len, size_t *ptr_int_table_name_len);

/*
This function takes a INSERT/UPDATE/DELETE request and returns the table name without the schema
Note: doesn't support SELECT because it doesn't support subqueries (because they themselves have aliases)
*/
char *get_table_alias_name(char *_str_query, size_t int_query_len, size_t *ptr_int_table_name_len);

/*
This function takes an INSERT request and returns the schema and table names as literals
*/
bool get_schema_and_table_name(DB_conn *conn, char *_str_query, size_t int_query_len, char **ptr_str_schema_literal, char **ptr_str_table_literal);
/*
This function takes a SELECT/INSERT/UPDATE request and returns the return columns
*/
char *get_return_columns(char *_str_query, size_t int_query_len, char *str_table_name, size_t int_table_name_len, size_t *ptr_int_return_columns_len);

#ifndef ENVELOPE_INTERFACE_LIBPQ
/*
This function takes a SELECT/INSERT/UPDATE request and returns the return columns in a format that concatinates and escapes them
*/
char *get_return_escaped_columns(DB_driver driver, char *_str_query, size_t int_query_len, char *str_table_name, size_t int_table_name_len, size_t *ptr_int_return_columns_len);
#endif

/*
This function takes a INSERT/UPDATE request and returns the hash columns
*/
char *get_hash_columns(char *_str_query, size_t int_query_len, size_t *ptr_int_hash_columns_len);
/*
This function takes the result of get_hash_columns() and gives you an appropriate where clause
*/
char *get_hash_where(DB_driver driver,  char *str_columns, size_t int_columns_len, char *str_temp_table_name, size_t int_temp_table_name_len, size_t *ptr_int_hash_where_len);
/*
This function handles the copy out functionality for websockets.
*/
bool ws_copy_check_cb(EV_P, bool bol_success, bool bol_last, void *cb_data, char *str_response, size_t int_len);

typedef bool (*readable_cb_t)(EV_P, void *cb_data, bool bol_group);
typedef struct {
	void *cb_data;
	readable_cb_t readable_cb;
} DB_readable_poll;

bool permissions_check(EV_P, DB_conn *conn, char *str_path, void *cb_data, readable_cb_t readable_cb);
bool permissions_write_check(EV_P, DB_conn *conn, char *str_path, void *cb_data, readable_cb_t readable_cb);
char *canonical_strip_start(char *str_path);
char *canonical_full_start(char *str_path);

/* Determine the group permissions of a user */
bool ddl_readable(EV_P, DB_conn *conn, char *str_path, bool bol_writeable, void *cb_data, readable_cb_t readable_cb);
