#pragma once

#include "db_framework.h"
#include "util_darray.h"
#include "util_list_queue.h"
#include <arpa/inet.h>
#include <ev.h>

#ifdef ENVELOPE_INTERFACE_LIBPQ
typedef bool (*sock_ev_client_query_callback_function)(EV_P, PGresult *, ExecStatusType, struct sock_ev_client_request *);
#else
typedef bool (*sock_ev_client_query_callback_function)(EV_P, void *, int, struct sock_ev_client_request *);
#endif

struct sock_ev_client_query_callback_watcher {
	ev_io io;
	struct sock_ev_client_request *client_request;
	sock_ev_client_query_callback_function callback;
};

#define cnxn conn->conn

#ifndef _WIN32
#ifndef SOCKET
#define UNDEF_SOCKET
#define SOCKET int
#endif
#endif

#define GET_CLIENT_PQ_SOCKET(A) A->conn->int_sock

/*
This header is just a bunch of structs to represent the client
*/

struct sock_ev_client_cnxn {
	ev_io io;

	struct sock_ev_client *parent;
};

struct sock_ev_client_reconnect_timer {
	ev_prepare prepare;
	ev_idle idle;

	ev_tstamp close_time;

	struct sock_ev_client *parent;
};

struct sock_ev_client_timeout_prepare {
	ev_prepare prepare;

	ev_tstamp close_time;

	struct sock_ev_client *parent;
};
#define client_timeout_prepare_free(A)                                                                                           \
	_client_timeout_prepare_free(A);                                                                                             \
	A = NULL;
void _client_timeout_prepare_free(struct sock_ev_client_timeout_prepare *client_timeout_prepare);

struct sock_ev_client_paused_request {
	ev_watcher *watcher;
	ev_idle idle;
	int revents;
	bool bol_free_watcher;
	bool bol_increment_watcher;
};
void client_paused_request_free(struct sock_ev_client_paused_request *client_paused_request);

struct sock_ev_client_request_watcher {
	ev_check check;
	ev_idle idle;

	struct sock_ev_client *parent;
};

struct sock_ev_client_notify_watcher {
	ev_io io;

	struct sock_ev_client *parent;
};

typedef struct WSFrame {
	uint64_t int_length;
	uint16_t int_orig_length;
	int8_t int_opcode;
	bool bol_fin;
	bool bol_mask;
	char *str_mask;
	char *str_message;
	struct sock_ev_client *parent;
	void (*cb)(EV_P, struct WSFrame *);
} WSFrame;

struct sock_ev_client_message {
	ev_io io;
	WSFrame *frame;
	bool bol_have_header;
	uint8_t int_ioctl_count;
	uint64_t int_message_header_length;
	uint64_t int_length;
	uint64_t int_written;
	uint64_t int_position;
	uint64_t int_message_num;
};

struct sock_ev_client {
	ev_io io;
	ev_idle idle_request_queue;

	connect_cb_t connect_cb;

	bool bol_is_open;
	bool bol_socket_is_open;
	bool bol_ssl_handshake;

	char *str_username;
	char *str_database;
	char *str_connname;
	char *str_connname_folder;
	char *str_conn;
	char *str_cookie;
	char *str_all_cookie;
	size_t int_all_cookie_len;
	char *str_session_id;
	char *str_referer;
	char *str_host;
	char *str_user_agent;
	char *str_if_modified_since;
	char *str_websocket_key;

	size_t int_username_len;
	size_t int_database_len;
	size_t int_connname_len;
	size_t int_connname_folder_len;
	size_t int_conn_len;
	size_t int_referer_len;

	ListNode *node;
	ssize_t int_last_activity_i;
	char *str_client_ip;
    size_t int_client_ip_len;
	bool bol_handshake;
	bool bol_connected;

	bool bol_public;

	bool bol_upload;
	char *str_boundary;
	size_t int_boundary_len;

	char *str_request;
	char *str_response;

	int int_ev_sock;
	SOCKET int_sock;
	struct sock_ev_serv *server;

	char *str_message;
	size_t int_message_len;
	char *str_notice;

	Queue *que_message;

	struct sock_ev_client_timeout_prepare *client_timeout_prepare;
	struct sock_ev_client_paused_request *client_paused_request;
	struct sock_ev_client_reconnect_timer *client_reconnect_timer;

	DB_conn *conn;

	struct sock_ev_client_request *cur_request;
	Queue *que_request;
	struct sock_ev_client_request_watcher *client_request_watcher;
	struct sock_ev_client_request_watcher *client_request_watcher_search;
	struct sock_ev_client_copy_check *client_copy_check;
	struct sock_ev_client_copy_io *client_copy_io;
	bool bol_request_in_progress;

	struct sock_ev_client_notify_watcher *notify_watcher;
	struct sock_ev_client_cnxn *reconnect_watcher;

	bool bol_http;
	bool bol_full_request;
	bool bol_headers_parsed;
	bool bol_headers_evaluated;
	size_t int_current_header_start;
	size_t int_form_data_start;
	size_t int_form_data_length;
	DArray *darr_str_header_name;
	DArray *darr_str_header_value;

	size_t int_request_len;
	size_t int_request_full_len;
};

enum {
	ENVELOPE_REQ_SELECT = 0,
	ENVELOPE_REQ_INSERT = 1,
	ENVELOPE_REQ_UPDATE = 2,
	ENVELOPE_REQ_DELETE = 3,
	ENVELOPE_REQ_BEGIN = 4,
	ENVELOPE_REQ_COMMIT = 5,
	ENVELOPE_REQ_ROLLBACK = 6,
	ENVELOPE_REQ_RAW = 7,
	ENVELOPE_REQ_FILE = 8,
	ENVELOPE_REQ_INFO = 9,
	ENVELOPE_REQ_ACTION = 10,
	ENVELOPE_REQ_ACCEPT = 11,
	ENVELOPE_REQ_AUTH = 12,
	ENVELOPE_REQ_STANDARD = 13
};


typedef struct sock_ev_client_request_data *sock_ev_client_request_datap;
typedef void(*sock_ev_client_request_data_free_func)(sock_ev_client_request_datap);
struct sock_ev_client_request_data {
	sock_ev_client_request_data_free_func free;
};

struct sock_ev_client_request {
	ev_check check;
	ev_idle idle;
	struct sock_ev_client *parent;
	struct sock_ev_client_query_callback_watcher *cb_data;

	WSFrame *frame;
	char *str_message_id;
	size_t int_message_id_len;
	char *str_transaction_id;
	size_t int_transaction_id_len;
	char *ptr_query;
	DArray *arr_query;
	ssize_t int_response_id;
	DArray *arr_response;
	ssize_t int_i;
	ssize_t int_len;

	bool bol_cancel_return;

	struct sock_ev_client_request_data *client_request_data;
	size_t int_req_type;

	// copy out stuff goes here
	size_t int_num_rows;
	size_t int_row_num;
	size_t int_current_response_length;
	char *str_current_response;
};

struct sock_ev_client_copy_check {
	ev_check check;
	ev_idle idle;

	DB_result *res;
	size_t int_i;
	size_t int_len;
	ssize_t int_response_len;
	ssize_t int_written;
	char *str_response;
	struct sock_ev_client_request *client_request;
};

struct sock_ev_client_copy_io {
	ev_io io;

	struct sock_ev_client_copy_check *client_copy_check;
};

#ifdef _WIN32
#else
#ifdef UNDEF_SOCKET
#undef SOCKET
#endif
#endif
