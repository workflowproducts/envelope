#include "http_ev.h"

#ifdef _WIN32
#ifndef EV_CONFIG_H
#define EV_CONFIG_H "ev_config.h.win32"
#include "../dependencies/libev/ev.c"
#endif // EV_CONFIG_H
void my_invalid_parameter(
	const wchar_t *expression, const wchar_t *function, const wchar_t *file, unsigned int line, uintptr_t pReserved) {
}
#else
#include "ev.c"
#endif

struct ev_loop *global_loop = NULL;

char *cb_to_name(void *cb);

void http_ev_step1(EV_P, struct sock_ev_client *client) {
	char *str_response = NULL;
	char str_response_len[255];
	size_t int_response_len = 0;
	size_t int_query_length = 0;
	size_t int_action_length = 0;
	size_t int_w_length = 0;
	SDEFINE_VAR_ALL(str_args, str_action, str_w, _str_response, str_uri);
    size_t int_uri_len;
	char str_int_i[256] = {0};
	char str_current_address[256] = {0};
	char str_current_priority[256] = {0};
	char str_current_events[256] = {0};
	// bool bol_kill = false;
	// bool bol_killed = false;
    DArray *darr_headers = NULL;

	str_args = query(client->str_request, client->int_request_len, &int_query_length);
	SFINISH_CHECK(str_args != NULL, "query() failed");

	str_action = getpar(str_args, "action", int_query_length, &int_action_length);
	SFINISH_CHECK(str_action != NULL && int_action_length > 0, "Invalid action");
	SDEBUG("str_action: %s", str_action);
	if (strcmp(str_action, "list") == 0) {
		// bol_kill = false;
		SDEBUG("listing watchers");
	} else {
		SFINISH("Invalid action");
	}

	client->cur_request = create_request(client, NULL, NULL, NULL, NULL, 0, ENVELOPE_REQ_STANDARD, NULL);
	SFINISH_CHECK(client->cur_request != NULL, "create_request failed!");

    SFINISH_SNFCAT(
        str_response, &int_response_len,
        "Connected clients:\015\012", (size_t)20
    );
    ListNode *client_node = _server.list_client->first;
    while (client_node) {
        struct sock_ev_client *client = client_node->value;
		snprintf(str_current_address, 255, "%p", client);
        SFINISH_SNFCAT(
            str_response, &int_response_len
            , "        ", (size_t)8
            , client->str_client_ip, client->int_client_ip_len
			, ": ", (size_t)2
            , client->str_username, client->int_username_len
			, " at ", (size_t)4
			, str_current_address, strlen(str_current_address)
            , client->str_websocket_key ? " (WS)" : " (HTTP)", (size_t)(client->str_websocket_key ? 5 : 7)
            , client->str_websocket_key && !client->bol_socket_is_open ? " (CLOSING)" : "", (size_t)(client->str_websocket_key && !client->bol_socket_is_open ? 10 : 0)
            , "\015\012", (size_t)2
        );
        if (client->str_websocket_key) {
            struct sock_ev_client_request *client_request = client->cur_request;
            char *str_request_type;
            if (client_request) {
                str_request_type = request_type_string(client_request->int_req_type);
                SFINISH_SNFCAT(
                    str_response, &int_response_len
                    , "        ", (size_t)8
                    , "        ", (size_t)8
                    , "current request: ", (size_t)17
                    , str_request_type, strlen(str_request_type)
                    , "\015\012", (size_t)2
                );
            }

            ListNode *request_node = client->que_request->last;
            while (request_node) {
                client_request = request_node->value;
                str_request_type = request_type_string(client_request->int_req_type);
                SFINISH_SNFCAT(
                    str_response, &int_response_len
                    , "        ", (size_t)8
                    , "        ", (size_t)8
                    , "queued request", (size_t)14
                    , str_request_type, strlen(str_request_type)
                	, "\015\012", (size_t)2
                );
                request_node = request_node->prev;
            }
        } else {
            str_uri = str_uri_path(client->str_request, client->int_request_len, &int_uri_len);
            if (!str_uri) {
                SFINISH_SNCAT(
                    str_uri, &int_uri_len
                    , "failed to get uri", (size_t)17
                );
            }
            SFINISH_SNFCAT(
                str_response, &int_response_len
                , "        ", (size_t)8
                , "        ", (size_t)8
                , str_uri, int_uri_len
                , "\015\012", (size_t)2
            );
            SFREE(str_uri);
        }
        client_node = client_node->next;
    }
    SFINISH_SNFCAT(
        str_response, &int_response_len
        , "\015\012\015\012\015\012\015\012", (size_t)8
    );

	// idles
    ssize_t int_idle_pri = NUMPRI;
    while (int_idle_pri >= 0) {
        snprintf(str_current_priority, 255, "%zd", int_idle_pri);
        ssize_t int_idle_count = EV_A->idlecnt[int_idle_pri];
        ssize_t int_current_idle = 0;
        SDEBUG("int_idle_pri: %zd", int_idle_pri);
        SDEBUG("int_idle_count: %zd", int_idle_count);
        SDEBUG("EV_A->idles[int_idle_pri]: %p", EV_A->idles[int_idle_pri]);
        while (EV_A->idles[int_idle_pri] != NULL && int_current_idle < int_idle_count) {
            ev_idle *current_idle = EV_A->idles[int_idle_pri][int_current_idle];

			snprintf(str_current_address, 255, "%p", current_idle);

            char *ptr_cb_name = cb_to_name(current_idle->cb);
            SFINISH_SNFCAT(
                str_response, &int_response_len
                , "ev_idle watcher at ", (size_t)19
                , str_current_address, strlen(str_current_address)
                , " with priority ", (size_t)15
                , str_current_priority, strlen(str_current_priority)
                , " with callback ", (size_t)15
                , ptr_cb_name, strlen(ptr_cb_name)
                , " initiator ", (size_t)11
                , current_idle->initiator, strlen(current_idle->initiator)
                , "\n", (size_t)1
            );
            int_current_idle = int_current_idle + 1;
        }
        int_idle_pri = int_idle_pri - 1;
    }

	// checks
	ssize_t int_check_count = EV_A->checkcnt;
	ssize_t int_current_check = 0;
	SDEBUG("int_check_count: %zd", int_check_count);
	SDEBUG("EV_A->checks: %p", EV_A->checks);
	while (EV_A->checks != NULL && int_current_check < int_check_count) {
		ev_check *current_check = EV_A->checks[int_current_check];

		snprintf(str_current_address, 255, "%p", current_check);

		char *ptr_cb_name = cb_to_name(current_check->cb);
		SFINISH_SNFCAT(
			str_response, &int_response_len
			, "ev_check watcher at ", (size_t)20
			, str_current_address, strlen(str_current_address)
			, " with callback ", (size_t)15
			, ptr_cb_name, strlen(ptr_cb_name)
			, " initiator ", (size_t)11
			, current_check->initiator, strlen(current_check->initiator)
			, "\n", (size_t)1
		);
		int_current_check = int_current_check + 1;
	}

	// prepares
	ssize_t int_prepares_count = EV_A->preparecnt;
	ssize_t int_current_prepare = 0;
	SDEBUG("int_prepares_count: %zd", int_prepares_count);
	SDEBUG("EV_A->prepares: %p", EV_A->prepares);
	while (EV_A->prepares != NULL && int_current_prepare < int_prepares_count) {
		ev_prepare *current_prepare = EV_A->prepares[int_current_prepare];

		snprintf(str_current_address, 255, "%p", current_prepare);

		char *ptr_cb_name = cb_to_name(current_prepare->cb);
		SFINISH_SNFCAT(
			str_response, &int_response_len
			, "ev_prepare watcher at ", (size_t)22
			, str_current_address, strlen(str_current_address)
			, " with callback ", (size_t)15
			, ptr_cb_name, strlen(ptr_cb_name)
			, " initiator ", (size_t)11
			, current_prepare->initiator, strlen(current_prepare->initiator)
			, "\n", (size_t)1
		);
		int_current_prepare = int_current_prepare + 1;
	}

	// cleanups
	ssize_t int_cleanup_count = EV_A->cleanupcnt;
	ssize_t int_current_cleanup = 0;
	SDEBUG("int_cleanup_count: %zd", int_cleanup_count);
	SDEBUG("EV_A->cleanups: %p", EV_A->cleanups);
	while (EV_A->cleanups != NULL && int_current_cleanup < int_cleanup_count) {
		ev_cleanup *current_cleanup = EV_A->cleanups[int_current_cleanup];

		snprintf(str_current_address, 255, "%p", current_cleanup);

		char *ptr_cb_name = cb_to_name(current_cleanup->cb);
		SFINISH_SNFCAT(
			str_response, &int_response_len
			, "ev_cleanup watcher at ", (size_t)22
			, str_current_address, strlen(str_current_address)
			, " with callback ", (size_t)15
			, ptr_cb_name, strlen(ptr_cb_name)
			, " initiator ", (size_t)11
			, current_cleanup->initiator, strlen(current_cleanup->initiator)
			, "\n", (size_t)1
		);
		int_current_cleanup = int_current_cleanup + 1;
	}

    // crashes
	// // periodics
	// ssize_t int_periodic_count = EV_A->periodiccnt;
	// ssize_t int_current_periodic = 0;
	// SDEBUG("int_periodic_count: %zd", int_periodic_count);
	// SDEBUG("EV_A->periodics: %p", EV_A->periodics);
	// while (EV_A->periodics != NULL && int_current_periodic < int_periodic_count) {
	// 	ev_periodic *current_periodic = (ev_periodic *)EV_A->periodics[int_current_periodic].w;

	// 	snprintf(str_current_address, 255, "%p", current_periodic);

	// 	char *ptr_cb_name = cb_to_name(current_periodic->cb);
    //     SFINISH_SNFCAT(
    //         str_response, &int_response_len,
    //         "ev_timer watcher at ", (size_t)20,
    //         str_current_address, strlen(str_current_address),
    //         " with callback ", (size_t)15,
    //         ptr_cb_name, strlen(ptr_cb_name),
    //         " initiator ", (size_t)11,
    //         current_periodic->initiator, strlen(current_periodic->initiator),
    //         "\n", (size_t)1
    //     );
	// 	int_current_periodic = int_current_periodic + 1;
	// }

    // commented because they aren't used and because it uses similar code to the periodics (and the periodics code crashes)
	// // timers
	// ssize_t int_timer_count = EV_A->timercnt;
	// ssize_t int_current_timer = 0;
	// SDEBUG("int_timer_count: %zd", int_timer_count);
	// SDEBUG("EV_A->timers: %p", EV_A->timers);
	// while (EV_A->timers != NULL && int_current_timer < int_timer_count) {
	// 	ev_timer *current_timer = (ev_timer *)EV_A->timers[int_current_timer].w;

	// 	snprintf(str_current_address, 255, "%p", current_timer);

	// 	char *ptr_cb_name = cb_to_name(current_timer->cb);
	// 	SFINISH_SNFCAT(
	// 		str_response, &int_response_len,
	// 		"ev_timer watcher at ", (size_t)20,
	// 		str_current_address, strlen(str_current_address),
	// 		" with callback ", (size_t)15,
	// 		ptr_cb_name, strlen(ptr_cb_name),
	// 		" initiator ", (size_t)11,
	// 		current_timer->initiator, strlen(current_timer->initiator),
	// 		"\n", (size_t)1
	// 	);
	// 	int_current_timer = int_current_timer + 1;
	// }

    // anfds (ios)
#ifdef _WIN32
	_invalid_parameter_handler oldHandler = _set_invalid_parameter_handler(my_invalid_parameter);
#endif
	ssize_t int_i = EV_A->anfdmax - 1;
	while (int_i >= 0) {
		ANFD *anfd = &EV_A->anfds[int_i];

#ifdef _WIN32
		unsigned long arg = 0;
		if (ioctlsocket(anfd->handle, FIONREAD, &arg) != 0) {
			int_i -= 1;
			continue;
		}
// #else
// 		unsigned long arg = 0;
// 		// All of our sockets are non-blocking
// 		if ((fcntl((int)int_i, F_GETFL, &arg) & O_NONBLOCK) == O_NONBLOCK) {
// 			int_i -= 1;
// 			continue;
// 		}
#endif

		ev_io *node = (ev_io *)anfd->head;
		while (node != NULL) {
			snprintf(str_int_i, 255, "%zu", int_i);
			snprintf(str_current_address, 255, "%p", node);
			snprintf(str_current_events, 255, "0x%x", node->events);

            char *ptr_cb_name = cb_to_name(node->cb);
            SFINISH_SNFCAT(
                str_response, &int_response_len
                , "ev_io watcher at ", (size_t)17
                , str_current_address, strlen(str_current_address)
                , " on fd ", (size_t)7
                , str_int_i, strlen(str_int_i)
                , " with callback ", (size_t)15
                , ptr_cb_name, strlen(ptr_cb_name)
				, " initiator ", (size_t)11
				, node->initiator, strlen(node->initiator)
                , ":\n", (size_t)2
            );
            SFINISH_SNFCAT(
                str_response, &int_response_len
                , "		events: ", (size_t)10
                , str_current_events, strlen(str_current_events)
                , "\n", (size_t)1
            );
            SFINISH_SNFCAT(
                str_response, &int_response_len
                , "			EV_READ			: ", (size_t)15
                , (node->events & EV_READ) == EV_READ ? "true\n" : "false\n", (size_t)((node->events & EV_READ) == EV_READ ? 5 : 6)
            );
            SFINISH_SNFCAT(
                str_response, &int_response_len
                , "			EV_WRITE		: ", (size_t)15
                , (node->events & EV_WRITE) == EV_WRITE ? "true\n" : "false\n", (size_t)((node->events & EV_WRITE) == EV_WRITE ? 5 : 6)
            );

			SDEBUG("str_response: %s", str_response);
			node = (ev_io *)((WL)node)->next;
		}
		int_i = int_i - 1;
	}
#ifdef _WIN32
	_set_invalid_parameter_handler(oldHandler);
#endif

    darr_headers = DArray_from_strings(
        "Refresh", "1"
    );
    SFINISH_CHECK(darr_headers != NULL, "DArray_from_strings failed");

    SFINISH_CHECK(
		build_http_response(
            "200 OK"
            , str_response, int_response_len
            , "text/plain"
            , darr_headers
            , &client->str_http_response, &client->int_http_response_len
        )
		, "build_http_response failed"
	);

	bol_error_state = false;
finish:
    if (darr_headers != NULL) {
        DArray_clear_destroy(darr_headers);
    }
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

char *cb_to_name(void *cb) {
	// clang-format off
	return
		(cb == http_auth_login_step2) ? "http_auth_login_step2"
		: (cb == http_auth_login_step3) ? "http_auth_login_step3"
		: (cb == http_auth_change_pw_step2) ? "http_auth_change_pw_step2"
		: (cb == http_auth_change_pw_step3) ? "http_auth_change_pw_step3"
		: (cb == http_file_step2) ? "http_file_step2"
		: (cb == http_file_step3) ? "http_file_step3"
		: (cb == http_upload_step2) ? "http_upload_step2"
		: (cb == http_upload_step3) ? "http_upload_step3"
		: (cb == client_cb) ? "client_cb"
		: (cb == client_frame_cb) ? "client_frame_cb"
		: (cb == client_send_from_cb) ? "client_send_from_cb"
		: (cb == client_request_queue_cb) ? "client_request_queue_cb"
		: (cb == cnxn_cb) ? "cnxn_cb"
		: (cb == ws_client_info_cb) ? "ws_client_info_cb"
		: (cb == client_cmd_cb) ? "client_cmd_cb"
		: (cb == client_close_timeout_prepare_cb) ? "client_close_timeout_prepare_cb"
		: (cb == server_cb) ? "server_cb"
		: (cb == _WS_readFrame) ? "_WS_readFrame"
		: (cb == WS_readFrame_step2) ? "WS_readFrame_step2"
		: (cb == WS_sendFrame) ? "WS_sendFrame"
		: (cb == WS_sendFrame_step2) ? "WS_sendFrame_step2"
		: (cb == ws_file_list_step2) ? "ws_file_list_step2"
		: (cb == ws_file_read_step2) ? "ws_file_read_step2"
		: (cb == ws_file_read_step3) ? "ws_file_read_step3"
		: (cb == ws_file_read_step4) ? "ws_file_read_step4"
		: (cb == ws_file_write_step2) ? "ws_file_write_step2"
		: (cb == ws_file_write_step3) ? "ws_file_write_step3"
		: (cb == ws_file_write_step4) ? "ws_file_write_step4"
		: (cb == ws_file_move_step2) ? "ws_file_move_step2"
		: (cb == ws_file_move_step3) ? "ws_file_move_step3"
		: (cb == ws_file_copy_step4) ? "ws_file_copy_step4"
		: (cb == ws_file_copy_step5) ? "ws_file_copy_step5"
		: (cb == ws_file_delete_step2) ? "ws_file_delete_step2"
		: (cb == ws_file_delete_step3) ? "ws_file_delete_step3"
		: (cb == ws_file_delete_step4) ? "ws_file_delete_step4"
		: (cb == ws_file_create_step2) ? "ws_file_create_step2"
		: (cb == ws_file_search_step2) ? "ws_file_search_step2"
		: (cb == ws_file_search_step3) ? "ws_file_search_step3"
#ifndef ENVELOPE_INTERFACE_LIBPQ
		: (cb == ws_insert_step15_sql_server) ? "ws_insert_step15_sql_server"
		: (cb == ws_update_step15_sql_server) ? "ws_update_step15_sql_server"
		: (cb == ws_delete_step15_sql_server) ? "ws_delete_step15_sql_server"
#endif
		: (cb == ws_file_search_step4) ? "ws_file_search_step4"
		: (cb == ws_file_search_step5) ? "ws_file_search_step5"
		: (cb == canonical_recurse_directory) ? "canonical_recurse_directory"
		: (cb == permissions_check) ? "permissions_check"
		: (cb == permissions_write_check) ? "permissions_write_check"
		: (cb == ws_select_step2) ? "ws_select_step2"
		: (cb == ws_update_step2) ? "ws_update_step2"
		: (cb == ws_update_step3) ? "ws_update_step3"
		: (cb == ws_update_step4) ? "ws_update_step4"
		: (cb == ws_update_step5) ? "ws_update_step5"
		: (cb == DB_connect) ? "DB_connect"
		: (cb == DB_get_column_types_for_query) ? "DB_get_column_types_for_query"
		: (cb == DB_get_column_types) ? "DB_get_column_types"
		: (cb == idle_cb) ? "idle_cb"
		: (cb == ddl_readable) ? "ddl_readable"
		: (cb == ev_now) ? "ev_now"
		: (cb == ev_feed_event) ? "ev_feed_event"
		: (cb == ev_feed_fd_event) ? "ev_feed_fd_event"
		: (cb == ev_backend) ? "ev_backend"
		: (cb == ev_iteration) ? "ev_iteration"
		: (cb == ev_depth) ? "ev_depth"
		: (cb == ev_set_io_collect_interval) ? "ev_set_io_collect_interval"
		: (cb == ev_set_timeout_collect_interval) ? "ev_set_timeout_collect_interval"
		: (cb == ev_set_userdata) ? "ev_set_userdata"
		: (cb == ev_userdata) ? "ev_userdata"
		: (cb == ev_set_invoke_pending_cb) ? "ev_set_invoke_pending_cb"
		: (cb == ev_set_loop_release_cb) ? "ev_set_loop_release_cb"
		: (cb == ev_loop_destroy) ? "ev_loop_destroy"
		: (cb == ev_verify) ? "ev_verify"
		: (cb == ev_loop_fork) ? "ev_loop_fork"
		: (cb == ev_invoke) ? "ev_invoke"
		: (cb == ev_pending_count) ? "ev_pending_count"
		: (cb == ev_invoke_pending) ? "ev_invoke_pending"
		: (cb == ev_run) ? "ev_run"
		: (cb == ev_break) ? "ev_break"
		: (cb == ev_ref) ? "ev_ref"
		: (cb == ev_unref) ? "ev_unref"
		: (cb == ev_now_update) ? "ev_now_update"
		: (cb == ev_suspend) ? "ev_suspend"
		: (cb == ev_resume) ? "ev_resume"
		: (cb == ev_clear_pending) ? "ev_clear_pending"
		: (cb == ev_io_start) ? "ev_io_start"
		: (cb == ev_io_stop) ? "ev_io_stop"
		: (cb == ev_timer_start) ? "ev_timer_start"
		: (cb == ev_timer_stop) ? "ev_timer_stop"
		: (cb == ev_timer_again) ? "ev_timer_again"
		: (cb == ev_timer_remaining) ? "ev_timer_remaining"
		: (cb == ev_periodic_start) ? "ev_periodic_start"
		: (cb == ev_periodic_stop) ? "ev_periodic_stop"
		: (cb == ev_periodic_again) ? "ev_periodic_again"
		: (cb == ev_signal_start) ? "ev_signal_start"
		: (cb == ev_signal_stop) ? "ev_signal_stop"
		: (cb == ev_stat_stat) ? "ev_stat_stat"
		: (cb == ev_stat_start) ? "ev_stat_start"
		: (cb == ev_stat_stop) ? "ev_stat_stop"
		: (cb == ev_idle_start) ? "ev_idle_start"
		: (cb == ev_idle_stop) ? "ev_idle_stop"
		: (cb == ev_prepare_start) ? "ev_prepare_start"
		: (cb == ev_prepare_stop) ? "ev_prepare_stop"
		: (cb == ev_check_start) ? "ev_check_start"
		: (cb == ev_check_stop) ? "ev_check_stop"
		: (cb == ev_embed_sweep) ? "ev_embed_sweep"
		: (cb == ev_embed_start) ? "ev_embed_start"
		: (cb == ev_embed_stop) ? "ev_embed_stop"
		: (cb == ev_fork_start) ? "ev_fork_start"
		: (cb == ev_fork_stop) ? "ev_fork_stop"
		: (cb == ev_cleanup_start) ? "ev_cleanup_start"
		: (cb == ev_cleanup_stop) ? "ev_cleanup_stop"
		: (cb == ev_async_start) ? "ev_async_start"
		: (cb == ev_async_stop) ? "ev_async_stop"
		: (cb == ev_async_send) ? "ev_async_send"
		: (cb == ev_once) ? "ev_once"
		: "unknown watcher";
		// clang-format on
}
