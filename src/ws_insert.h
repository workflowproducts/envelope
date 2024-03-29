#pragma once

#include "common_client.h"
#include "common_util_sql.h"
#include "common_websocket.h"
#include "util_idle.h"

struct sock_ev_client_insert {
	struct sock_ev_client_request_data self;

	char *ptr_values;

	char *str_return_columns;
	size_t int_return_columns_length;
	char *str_pk_columns;
	size_t int_pk_columns_len;
	char *str_pk_join_clause;
	char *str_pk_where_clause;
	char *str_pk_return_where_clause;
	size_t int_pk_return_where_clause_len;
	char *str_column_names;
	char *str_schema_literal;
	char *str_table_literal;
#ifndef ENVELOPE_INTERFACE_LIBPQ
	char *str_return_escaped_columns;
	char *str_insert_column_names;
	char *str_insert_parameter_markers;
	size_t int_return_escaped_columns_len;
#endif
	DArray *darr_insert_queries;
	size_t int_current_insert_query;
	char *str_real_table_name;
	char *str_temp_table_name;
	char *str_sql;
	// These are for http_file:
	DArray *darr_column_types;
	DArray *darr_column_values;
	DArray *darr_pk;
	DArray *darr_sequence;
	char *str_table_return_where;
	size_t int_table_return_where_len;
	char *str_sequence_name;
    bool bol_pk_provided;
	char *str_result;
	char *str_identity_column_name;
	size_t int_currval_len;
	size_t int_data_len;

	char *str_return_order_by;
	size_t int_return_order_by_len;

	char *str_table_alias;
	size_t int_table_alias_len;

	//variable lengths
	size_t int_real_table_name_len;
	size_t int_temp_table_name_len;
	size_t int_column_names_len;
	size_t int_insert_column_names_len;
	size_t int_insert_parameter_markers_len;
	size_t int_pk_join_clause_len;
	size_t int_pk_where_clause_len;
	size_t int_identity_column_name_len;
	size_t int_return_columns_len;
	size_t int_sql_len;
	size_t int_result_len;
};

/*
********************************** REQUEST FORMAT
************************************
INSERT\t[<schemaname>\t]<tablename>
RETURN\t(<tabseperatedcolumns>|*)
PK\t(<tabseperatedcolumns>|*)
SEQ\t<tabseperatedsequencenames>
[ORDER BY\t<returnorderby>]

<columnname>[\t<columnname>[...]]
<columnvalue>[\t<columnvalue>[...]]
[<columnvalue>[\t<columnvalue>[...]]]
[...]
*/

/*
This function will:
1. parse request into variables
2. create first temp table to hold data the client sent
*/
void ws_insert_step1(EV_P, struct sock_ev_client_request *client_request);

#ifndef ENVELOPE_INTERFACE_LIBPQ
/*
This function will drop the identity column we make
*/
bool ws_insert_step15_sql_server(EV_P, void *cb_data, DB_result *res);
#endif

/*
create first temp table query came back
This function will send copy command to send data into the first temp table (view mode)
*/
bool ws_insert_step2(EV_P, void *cb_data, DB_result *res);

/*
This function will determine if we are working with a table or a view
*/
bool ws_insert_step3(EV_P, void *cb_data, DB_result *res);

/*
This function will run the proper code for a table or a view
*/
bool ws_insert_step4(EV_P, void *cb_data, DB_result *res);

/*
View Mode:
This function will create second temp table to hold the inserted rows (this
allows us to see the effect of defaults, rules and triggers)
*/
bool ws_insert_view_step1(EV_P, struct sock_ev_client_request *client_request);

#ifndef ENVELOPE_INTERFACE_LIBPQ
/*
This function will drop the identity column we make
*/
bool ws_insert_view_step15_sql_server(EV_P, void *cb_data, DB_result *res);
#endif

/*
create second temp table query came back
This function will generate queries to insert into the actual table, and also insert the values
	touched by triggers etc into the second temp table
*/
bool ws_insert_view_step2(EV_P, void *cb_data, DB_result *res);

/*
An insert query came back
This function will run 1 insert query
	if it is the last query, ws_insert_step7 is the callback
	else ws_insert_step6 is the callback
*/
bool ws_insert_view_step3(EV_P, void *cb_data, DB_result *res);

/*
Last insert query came back
This function will start copy query from the second temp table
*/
bool ws_insert_view_step4(EV_P, void *cb_data, DB_result *res);

/*
Table Mode:
This function will select the current values for all sequences
*/
bool ws_insert_table_step1(EV_P, struct sock_ev_client_request *client_request);

/*
Sequence query came back
This function will basically:
INSERT INTO <table> (<columns>)
SELECT <columns>
	FROM temp_insert;
*/
bool ws_insert_table_step2(EV_P, void *cb_data, DB_result *res);

/*
Insert query came back
This function will start copy query from the realt table using xmin and the sequences
*/
bool ws_insert_table_step3(EV_P, void *cb_data, DB_result *res);

/*
This function will free the data associated with the client_insert struct
*/
void ws_insert_free(struct sock_ev_client_request_data *client_request_data);
