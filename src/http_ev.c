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

char *cb_to_name(void *cb);

void http_ev_step1(struct sock_ev_client *client) {
	char *str_response = NULL;
	char str_response_len[255];
	size_t int_response_len = 0;
	size_t int_query_length = 0;
	size_t int_action_length = 0;
	size_t int_w_length = 0;
	struct sock_ev_client_copy_io *client_copy_io = NULL;
	struct sock_ev_client_copy_check *client_copy_check = NULL;
	SDEFINE_VAR_ALL(str_args, str_action, str_w, _str_response, str_uri);
    size_t int_uri_len;
	char str_int_i[256] = {0};
	char str_current_address[256] = {0};
	char str_current_priority[256] = {0};
	char str_current_events[256] = {0};
	bool bol_kill = false;
	bool bol_killed = false;

	str_args = query(client->str_request, client->int_request_len, &int_query_length);
	SFINISH_CHECK(str_args != NULL, "query() failed");

	str_action = getpar(str_args, "action", int_query_length, &int_action_length);
	SFINISH_CHECK(str_action != NULL && int_action_length > 0, "Invalid action");
	SDEBUG("str_action: %s", str_action);
	if (strcmp(str_action, "list") == 0) {
		bol_kill = false;
	} else if (strcmp(str_action, "kill") == 0) {
		str_w = getpar(str_args, "w", int_query_length, &int_w_length);
		SFINISH_CHECK(str_w != NULL && int_w_length > 0, "Invalid w");

		bol_kill = true;
	} else {
		SFINISH("Invalid action");
	}

	SFINISH_SALLOC(client_copy_io, sizeof(struct sock_ev_client_copy_io));
	SFINISH_SALLOC(client_copy_check, sizeof(struct sock_ev_client_copy_check));
	client_copy_io->client_copy_check = client_copy_check;

	client->cur_request = create_request(client, NULL, NULL, NULL, NULL, 0, ENVELOPE_REQ_STANDARD, NULL);
	SFINISH_CHECK(client->cur_request != NULL, "create_request failed!");
	client_copy_check->client_request = client->cur_request;

    SFINISH_SNFCAT(
        client_copy_check->str_response, &int_response_len,
        "Connected clients:\015\012", (size_t)20
    );
    ListNode *client_node = _server.list_client->first;
    while (client_node) {
        struct sock_ev_client *client = client_node->value;
        SFINISH_SNFCAT(
            client_copy_check->str_response, &int_response_len,
            "        ", (size_t)8,
            client->str_client_ip, client->int_client_ip_len,
            client->str_websocket_key ? " (WS)" : " (HTTP)", (size_t)(client->str_websocket_key ? 5 : 7),
            client->str_websocket_key &&client->bol_is_open ? " (CLOSING)" : "", (size_t)(client->str_websocket_key && client->bol_is_open ? 10 : 0),
            "\015\012", (size_t)2
        );
        if (client->str_websocket_key) {
            struct sock_ev_client_request *client_request = client->cur_request;
            char *str_request_type;
            if (client_request) {
                str_request_type = request_type_string(client_request->int_req_type);
                SFINISH_SNFCAT(
                    client_copy_check->str_response, &int_response_len,
                    "        ", (size_t)8,
                    "        ", (size_t)8,
                    "current request: ", (size_t)17,
                    str_request_type, strlen(str_request_type),
                    "\015\012", (size_t)2
                );
            }

            ListNode *request_node = client->que_request->last;
            while (request_node) {
                client_request = request_node->value;
                str_request_type = request_type_string(client_request->int_req_type);
                SFINISH_SNFCAT(
                    client_copy_check->str_response, &int_response_len,
                    "        ", (size_t)8,
                    "        ", (size_t)8,
                    str_request_type, strlen(str_request_type)
                );
                request_node = request_node->prev;
            }
        } else {
            str_uri = str_uri_path(client->str_request, client->int_request_len, &int_uri_len);
            if (!str_uri) {
                SFINISH_SNCAT(
                    str_uri, &int_uri_len,
                    "failed to get uri", (size_t)17
                );
            }
            SFINISH_SNFCAT(
                client_copy_check->str_response, &int_response_len,
                "        ", (size_t)8,
                "        ", (size_t)8,
                str_uri, int_uri_len,
                "\015\012", (size_t)2
            );
            SFREE(str_uri);
        }
        client_node = client_node->next;
    }
    SFINISH_SNFCAT(
        client_copy_check->str_response, &int_response_len,
        "\015\012\015\012\015\012\015\012", (size_t)8
    );

	// idles
    ssize_t int_idle_pri = NUMPRI;
    while (int_idle_pri >= 0) {
        snprintf(str_current_priority, 255, "%zd", int_idle_pri);
        ssize_t int_idle_count = global_loop->idlecnt[int_idle_pri];
        ssize_t int_current_idle = 0;
        SDEBUG("int_idle_pri: %zd", int_idle_pri);
        SDEBUG("int_idle_count: %zd", int_idle_count);
        SDEBUG("global_loop->idles[int_idle_pri]: %p", global_loop->idles[int_idle_pri]);
        while (global_loop->idles[int_idle_pri] != NULL && int_current_idle < int_idle_count) {
            ev_idle *current_idle = global_loop->idles[int_idle_pri][int_current_idle];

			snprintf(str_current_address, 255, "%p", current_idle);

            char *ptr_cb_name = cb_to_name(current_idle->cb);
            SFINISH_SNFCAT(
                client_copy_check->str_response, &int_response_len,
                "ev_idle watcher at ", (size_t)19,
                str_current_address, strlen(str_current_address),
                " with priority ", (size_t)15,
                str_current_priority, strlen(str_current_priority),
                " with callback ", (size_t)15,
                ptr_cb_name, strlen(ptr_cb_name),
                " initiator ", (size_t)11,
                current_idle->initiator, strlen(current_idle->initiator),
                "\n", (size_t)1
            );
            int_current_idle = int_current_idle + 1;
        }
        int_idle_pri = int_idle_pri - 1;
    }

	// checks
	ssize_t int_check_count = global_loop->checkcnt;
	ssize_t int_current_check = 0;
	SDEBUG("int_check_count: %zd", int_check_count);
	SDEBUG("global_loop->checks: %p", global_loop->checks);
	while (global_loop->checks != NULL && int_current_check < int_check_count) {
		ev_check *current_check = global_loop->checks[int_current_check];

		snprintf(str_current_address, 255, "%p", current_check);

		char *ptr_cb_name = cb_to_name(current_check->cb);
		SFINISH_SNFCAT(
			client_copy_check->str_response, &int_response_len,
			"ev_check watcher at ", (size_t)20,
			str_current_address, strlen(str_current_address),
			" with callback ", (size_t)15,
			ptr_cb_name, strlen(ptr_cb_name),
			" initiator ", (size_t)11,
			current_check->initiator, strlen(current_check->initiator),
			"\n", (size_t)1
		);
		int_current_check = int_current_check + 1;
	}

	// prepares
	ssize_t int_prepares_count = global_loop->preparecnt;
	ssize_t int_current_prepare = 0;
	SDEBUG("int_prepares_count: %zd", int_prepares_count);
	SDEBUG("global_loop->prepares: %p", global_loop->prepares);
	while (global_loop->prepares != NULL && int_current_prepare < int_prepares_count) {
		ev_prepare *current_prepare = global_loop->prepares[int_current_prepare];

		snprintf(str_current_address, 255, "%p", current_prepare);

		char *ptr_cb_name = cb_to_name(current_prepare->cb);
		SFINISH_SNFCAT(
			client_copy_check->str_response, &int_response_len,
			"ev_prepare watcher at ", (size_t)22,
			str_current_address, strlen(str_current_address),
			" with callback ", (size_t)15,
			ptr_cb_name, strlen(ptr_cb_name),
			" initiator ", (size_t)11,
			current_prepare->initiator, strlen(current_prepare->initiator),
			"\n", (size_t)1
		);
		int_current_prepare = int_current_prepare + 1;
	}

	// cleanups
	ssize_t int_cleanup_count = global_loop->cleanupcnt;
	ssize_t int_current_cleanup = 0;
	SDEBUG("int_cleanup_count: %zd", int_cleanup_count);
	SDEBUG("global_loop->cleanups: %p", global_loop->cleanups);
	while (global_loop->cleanups != NULL && int_current_cleanup < int_cleanup_count) {
		ev_cleanup *current_cleanup = global_loop->cleanups[int_current_cleanup];

		snprintf(str_current_address, 255, "%p", current_cleanup);

		char *ptr_cb_name = cb_to_name(current_cleanup->cb);
		SFINISH_SNFCAT(
			client_copy_check->str_response, &int_response_len,
			"ev_cleanup watcher at ", (size_t)22,
			str_current_address, strlen(str_current_address),
			" with callback ", (size_t)15,
			ptr_cb_name, strlen(ptr_cb_name),
			" initiator ", (size_t)11,
			current_cleanup->initiator, strlen(current_cleanup->initiator),
			"\n", (size_t)1
		);
		int_current_cleanup = int_current_cleanup + 1;
	}

    // crashes
	// // periodics
	// ssize_t int_periodic_count = global_loop->periodiccnt;
	// ssize_t int_current_periodic = 0;
	// SDEBUG("int_periodic_count: %zd", int_periodic_count);
	// SDEBUG("global_loop->periodics: %p", global_loop->periodics);
	// while (global_loop->periodics != NULL && int_current_periodic < int_periodic_count) {
	// 	ev_periodic *current_periodic = (ev_periodic *)global_loop->periodics[int_current_periodic].w;

	// 	snprintf(str_current_address, 255, "%p", current_periodic);

	// 	char *ptr_cb_name = cb_to_name(current_periodic->cb);
    //     SFINISH_SNFCAT(
    //         client_copy_check->str_response, &int_response_len,
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
	// ssize_t int_timer_count = global_loop->timercnt;
	// ssize_t int_current_timer = 0;
	// SDEBUG("int_timer_count: %zd", int_timer_count);
	// SDEBUG("global_loop->timers: %p", global_loop->timers);
	// while (global_loop->timers != NULL && int_current_timer < int_timer_count) {
	// 	ev_timer *current_timer = (ev_timer *)global_loop->timers[int_current_timer].w;

	// 	snprintf(str_current_address, 255, "%p", current_timer);

	// 	char *ptr_cb_name = cb_to_name(current_timer->cb);
	// 	SFINISH_SNFCAT(
	// 		client_copy_check->str_response, &int_response_len,
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
	ssize_t int_i = global_loop->anfdmax - 1;
	while (int_i >= 0) {
		ANFD *anfd = &global_loop->anfds[int_i];

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
                client_copy_check->str_response, &int_response_len,
                "ev_io watcher at ", (size_t)17,
                str_current_address, strlen(str_current_address),
                " on fd ", (size_t)7,
                str_int_i, strlen(str_int_i),
                " with callback ", (size_t)15,
                ptr_cb_name, strlen(ptr_cb_name),
				" initiator ", (size_t)11,
				node->initiator, strlen(node->initiator),
                ":\n", (size_t)2
            );
            SFINISH_SNFCAT(
                client_copy_check->str_response, &int_response_len,
                "		events: ", (size_t)10,
                str_current_events, strlen(str_current_events),
                "\n", (size_t)1
            );
            SFINISH_SNFCAT(
                client_copy_check->str_response, &int_response_len,
                "			EV_READ			: ", (size_t)15,
                (node->events & EV_READ) == EV_READ ? "true\n" : "false\n", (size_t)((node->events & EV_READ) == EV_READ ? 5 : 6)
            );
            SFINISH_SNFCAT(
                client_copy_check->str_response, &int_response_len,
                "			EV_WRITE		: ", (size_t)15,
                (node->events & EV_WRITE) == EV_WRITE ? "true\n" : "false\n", (size_t)((node->events & EV_WRITE) == EV_WRITE ? 5 : 6)
            );

			SDEBUG("client_copy_check->str_response: %s", client_copy_check->str_response);
			node = (ev_io *)((WL)node)->next;
		}
		int_i = int_i - 1;
	}
#ifdef _WIN32
	_set_invalid_parameter_handler(oldHandler);
#endif

	// pendings?
	// ssize_t pendingpri = NUMPRI - 1;
	// while (pendingpri >= 0 && (bol_kill == false || bol_killed == false)) {
	// 	ssize_t int_i = global_loop->pendingcnt[pendingpri] - 1;
	// 	while (int_i >= 0 && (bol_kill == false || bol_killed == false)) {
	// 		if (global_loop->pendings[pendingpri] == NULL) {
	// 			int_i -= 1;
	// 			continue;
	// 		}

	// 		snprintf(str_current_address, 255, "%p", global_loop->pendings[pendingpri][int_i].w);
	// 		snprintf(str_current_priority, 255, "%zu", pendingpri);
	// 		snprintf(str_current_events, 255, "0x%x", global_loop->pendings[pendingpri][int_i].events);

	// 		if (bol_kill) {
	// 			if (strcmp(str_current_address, str_w) == 0) {
	// 				ev_check_stop(global_loop, (ev_check *)global_loop->pendings[pendingpri][int_i].w);
	// 				bol_killed = true;
	// 			}
	// 		} else {
	// 			char *ptr_cb_name = cb_to_name(global_loop->pendings[pendingpri][int_i].w->cb);
	// 			SFINISH_SNFCAT(
	// 				client_copy_check->str_response, &int_response_len,
	// 				"	watcher at ", (size_t)12,
	// 				str_current_address, strlen(str_current_address),
	// 				" with priority ", (size_t)15,
	// 				str_current_priority, strlen(str_current_priority),
	// 				" with callback ", (size_t)15,
	// 				ptr_cb_name, strlen(ptr_cb_name),
	// 				" initiator ", (size_t)11,
	// 				global_loop->pendings[pendingpri][int_i].w->initiator, strlen(global_loop->pendings[pendingpri][int_i].w->initiator),
	// 				":\n", (size_t)2
	// 			);
	// 			SFINISH_SNFCAT(
	// 				client_copy_check->str_response, &int_response_len,
	// 				"		events: ", (size_t)10,
	// 				str_current_events, strlen(str_current_events),
	// 				"\n", (size_t)1
	// 			);
	// 			SFINISH_SNFCAT(
	// 				client_copy_check->str_response, &int_response_len,
	// 				"			EV_IDLE			: ", (size_t)15,
	// 				global_loop->pendings[pendingpri][int_i].events == EV_IDLE ? "true\n" : "false\n", (size_t)(global_loop->pendings[pendingpri][int_i].events == EV_IDLE ? 5 : 6)
	// 			);
	// 			SFINISH_SNFCAT(
	// 				client_copy_check->str_response, &int_response_len,
	// 				"			EV_PREPARE		: ", (size_t)17,
	// 				global_loop->pendings[pendingpri][int_i].events == EV_PREPARE ? "true\n" : "false\n", (size_t)(global_loop->pendings[pendingpri][int_i].events == EV_PREPARE ? 5 : 6)
	// 			);
	// 			SFINISH_SNFCAT(
	// 				client_copy_check->str_response, &int_response_len,
	// 				"			EV_CHECK		: ", (size_t)15,
	// 				global_loop->pendings[pendingpri][int_i].events == EV_CHECK ? "true\n\n" : "false\n\n", (size_t)(global_loop->pendings[pendingpri][int_i].events == EV_CHECK ? 6 : 7)
	// 			);
	// 		}

	// 		int_i -= 1;
	// 		SDEBUG("client_copy_check->str_response: %s", client_copy_check->str_response);
	// 	}

	// 	pendingpri -= 1;
	// }

    snprintf(str_response_len, 255, "%zu", int_response_len);
    _str_response = client_copy_check->str_response;
    SDEBUG("client_copy_check->str_response: %s", client_copy_check->str_response);
    client_copy_check->int_response_len = (ssize_t)int_response_len;
    SFINISH_SNCAT(
        client_copy_check->str_response, &int_response_len,
        "HTTP/1.1 200 OK\015\012", strlen("HTTP/1.1 200 OK\015\012"),
        "Content-Length: ", strlen("Content-Length: "),
        str_response_len, strlen(str_response_len),
        "\015\012", strlen("\015\012"),
        "Refresh: 1\015\012", strlen("Refresh: 1\015\012"),
        "Content-Type: text/plain\015\012", strlen("Content-Type: text/plain\015\012"),
        "\015\012", strlen("\015\012"),
        _str_response, client_copy_check->int_response_len
    );
    client_copy_check->int_response_len = (ssize_t)int_response_len;
    SFREE(_str_response);
    SDEBUG("client_copy_check->str_response: %s", client_copy_check->str_response);

	ev_io_init(&client_copy_io->io, http_ev_step2, client->int_ev_sock, EV_WRITE);
	ev_io_start(global_loop, &client_copy_io->io);

	bol_error_state = false;
finish:
	if (bol_error_state) {
		bol_error_state = false;

		char *_str_response = str_response;
		char *str_temp =
			"HTTP/1.1 500 Internal Server Error\015\012"
			"Server: " SUN_PROGRAM_LOWER_NAME "\015\012"
			"Connection: close\015\012\015\012";
		SFINISH_SNCAT(str_response, &int_response_len, str_temp, strlen(str_temp), _str_response, strlen(_str_response));
		SFREE(_str_response);
	}
	SFREE_ALL();
	ssize_t int_len_response = 0;
	if (str_response != NULL && (int_len_response = write(client->int_sock, str_response, strlen(str_response))) < 0) {
		SERROR_NORESPONSE("write() failed");
		ev_io_stop(global_loop, &client->io);
		SFREE(client->str_request);
		SERROR_CHECK_NORESPONSE(client_close(client), "Error closing Client");
	}
	SFREE(str_response);
}

void http_ev_step2(EV_P, ev_io *w, int revents) {
	if (revents != 0) {
	} // get rid of unused parameter warning
	struct sock_ev_client_copy_io *client_copy_io = (struct sock_ev_client_copy_io *)w;
	struct sock_ev_client_copy_check *client_copy_check = client_copy_io->client_copy_check;
	struct sock_ev_client_request *client_request = client_copy_check->client_request;
	char *str_response = NULL;
	char *_str_response = NULL;

	SDEBUG("client_copy_check->str_response: %s", client_copy_check->str_response);

	ssize_t int_response_len =
		write(client_request->parent->int_sock, client_copy_check->str_response + client_copy_check->int_written,
			(size_t)(client_copy_check->int_response_len - client_copy_check->int_written));

	SDEBUG("write(%i, %p, %i): %z", client_request->parent->int_sock,
		client_copy_check->str_response + client_copy_check->int_written,
		client_copy_check->int_response_len - client_copy_check->int_written, int_response_len);

	if (int_response_len < 0 && errno != EAGAIN) {
		SFINISH("write(%i, %p, %i) failed: %i", client_request->parent->int_sock,
			client_copy_check->str_response + client_copy_check->int_written,
			client_copy_check->int_response_len - client_copy_check->int_written, int_response_len);
	} else {
		// int_response_len can't be negative at this point
		client_copy_check->int_written += (ssize_t)int_response_len;
	}

	if (client_copy_check->int_written == client_copy_check->int_response_len) {
		ev_io_stop(EV_A, w);

		SFREE(client_copy_check->str_response);
		SFREE(client_copy_check);
		SFREE(client_copy_io);

		SDEBUG("DONE");
		struct sock_ev_client *client = client_request->parent;
		SFINISH_CLIENT_CLOSE(client);
		client_request = NULL;
	}

	bol_error_state = false;
finish:
	_str_response = str_response;
	if (bol_error_state) {
		if (client_copy_check != NULL) {
			ev_io_stop(EV_A, w);
			SFREE(client_copy_check->str_response);
			SFREE(client_copy_check);
			SFREE(client_copy_io);
		}
		str_response = NULL;
		bol_error_state = false;

		char *str_temp =
			"HTTP/1.1 500 Internal Server Error\015\012"
			"Server: " SUN_PROGRAM_LOWER_NAME "\015\012"
			"Connection: close\015\012\015\012";
		SFINISH_SNCAT(str_response, (size_t *)&int_response_len,
			str_temp, strlen(str_temp),
			_str_response, strlen(_str_response));
		SFREE(_str_response);
	}
	if (str_response != NULL) {
		int_response_len = write(client_request->parent->int_sock, str_response, strlen(str_response));
		SDEBUG("int_response_len: %d", int_response_len);
		if (int_response_len < 0) {
			SERROR_NORESPONSE("write() failed");
		}
		ev_io_stop(EV_A, &client_request->parent->io);
		SFREE(client_request->parent->str_request);
		SDEBUG("ERROR");
		SERROR_CHECK_NORESPONSE(client_close(client_request->parent), "Error closing Client");
	}
	SFREE(str_response);
}

char *cb_to_name(void *cb) {
	// clang-format off
	return
		(cb == http_auth_login_step2) ? "http_auth_login_step2"
		: (cb == http_auth_login_step3) ? "http_auth_login_step3"
		: (cb == http_auth_change_pw_step2) ? "http_auth_change_pw_step2"
		: (cb == http_auth_change_pw_step3) ? "http_auth_change_pw_step3"
		: (cb == http_auth_change_database_step2) ? "http_auth_change_database_step2"
		: (cb == http_file_step2) ? "http_file_step2"
		: (cb == http_file_step3) ? "http_file_step3"
		: (cb == http_file_write_cb) ? "http_file_write_cb"
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
		: (cb == ws_select_step4) ? "ws_select_step4"
		: (cb == ws_update_step2) ? "ws_update_step2"
		: (cb == ws_update_step4) ? "ws_update_step4"
		: (cb == ws_update_step5) ? "ws_update_step5"
		: (cb == ws_update_step6) ? "ws_update_step6"
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
