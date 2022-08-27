#ifdef _WIN32
#include <windows.h>
#include <winsock2.h>
#include <ws2tcpip.h>
//#include <crtdbg.h>

#else
#include <sys/un.h>
#include <ev.h>
#endif

#include "common_server.h"
#include "util_string.h"
#include <openssl/crypto.h>
#include <stdio.h>

#ifdef _WIN32
#include <direct.h>
#include <stdlib.h>
#endif

#ifdef _WIN32
#pragma comment(lib, "Ws2_32.lib")
#pragma comment(lib, "../lib/x86/libpq.lib")
#pragma comment(lib, "../lib/x86/ssl-45.lib")
#pragma comment(lib, "../lib/x86/crypto-43.lib")
#endif

SOCKET int_sock = INVALID_SOCKET;

ev_periodic last_activity_free_timer;
ev_periodic check_running_queries_timer;
DB_conn *log_queries_over_conn = NULL;

/*
This function is run when the program exits
*/
ev_signal exitsig;
void program_exit() {
	EV_P = global_loop;
    ev_signal_stop(EV_A, &exitsig);
	fprintf(stderr, "ENVELOPE IS SHUTTING DOWN\n");
	if (EV_A != NULL) {
		size_t int_i, int_len;

		ev_io_stop(EV_A, &_server.io);
		if (int_global_login_timeout > 0) {
			ev_periodic_stop(EV_A, &last_activity_free_timer);
		}
		if (int_global_log_queries_over > 0) {
			if (log_queries_over_conn != NULL) {
				DB_finish(log_queries_over_conn);
			}
			ev_periodic_stop(EV_A, &check_running_queries_timer);
		}

		if (_server.list_client != NULL) {
			while (List_first(_server.list_client) != NULL) {
				client_close_immediate(List_first(_server.list_client));
			}
			List_destroy(_server.list_client);
			_server.list_client = NULL;
		}

        List_destroy(list_global_running_queries);
        list_global_running_queries = NULL;

		if (_server.list_client_last_activity != NULL) {
			LIST_FOREACH(_server.list_client_last_activity, first, next, node)  {
				struct sock_ev_client_last_activity *client_last_activity = node->value;
				client_last_activity_free(client_last_activity);
			}
			List_destroy(_server.list_client_last_activity);
		}

		SFREE(str_global_log_queries_over_action_name);
		SFREE(str_global_2fa_function);
		SFREE(str_global_port);
		SFREE(str_global_api_referer_list);
		SFREE(str_global_public_api_referer_list);
		SFREE(str_global_error);
		SFREE(str_global_config_file);
		SFREE(str_global_connection_file);
		SFREE(str_global_login_group);
		SFREE(str_global_public_username);
		SFREE(str_global_public_password);
		SFREE(str_global_app_path);
		SFREE(str_global_role_path);
		SFREE(str_global_public_username);
		SFREE(str_global_public_password);
		SFREE(str_global_web_root);
		SFREE(str_global_log_level);
#ifdef _WIN32

		SFREE(ENVELOPE_PREFIX);
#endif

		for (int_i = 0, int_len = DArray_end(darr_global_connection); int_i < int_len; int_i += 1) {
			struct struct_connection *conninfo = (struct struct_connection *)DArray_get(darr_global_connection, int_i);
			if (conninfo != NULL) {
				connection_free(conninfo);
			}
		}
		DArray_destroy(darr_global_connection);

		EVP_cleanup();
		CRYPTO_cleanup_all_ex_data();
		ERR_free_strings();

#if OPENSSL_VERSION_NUMBER < 0x10100000L
		ERR_remove_thread_state(NULL);
#endif

		ev_break(EV_A, EVBREAK_ALL);
		ev_loop_destroy(EV_A);
		EV_A = NULL;

#ifdef _WIN32
		WSACleanup();
#else
		close(int_sock);
#endif
	}
	DB_finish_framework();
}

void free_last_activity(EV_P, ev_periodic *w, int revents) {
	if (EV_A != NULL) {
	} // get rid of unused parameter warning
	if (w != NULL) {
	} // get rid of unused parameter warning
	if (revents != 0) {
	} // get rid of unused parameter warning
	struct sock_ev_client_last_activity *client_last_activity = NULL;
	struct sock_ev_client *client = NULL;
	bool bol_no_clients, bol_skip = false;
	if (_server.list_client_last_activity != NULL) {
		ListNode *node = _server.list_client_last_activity->first;
		while (node != NULL) {
			SDEBUG("node: %p", node);
			client_last_activity = node->value;
			SDEBUG("client_last_activity: %p", client_last_activity);
			if (client_last_activity != NULL &&
				(ev_now(EV_A) - client_last_activity->last_activity_time) >= (double)int_global_login_timeout) {
				SDEBUG("node: %p", node);
				bol_no_clients = true;
				LIST_FOREACH(client_last_activity->list_client, first, next, node_sub) {
					client = node_sub->value;
					SDEBUG("client: %p", client);
					SDEBUG("client->bol_request_in_progress: %s",
						client != NULL ? (client->bol_request_in_progress ? "true" : "false") : "(null)");
					if (client != NULL && client->bol_request_in_progress == false) {
						bol_no_clients = false;
					} else if (client != NULL && client->bol_request_in_progress == true) {
						bol_skip = true;
						break;
					}
				}

				if (bol_skip == true) {
					bol_skip = false;
					node = node->next;
					continue;
				}

				SDEBUG("node: %p", node);

				if (bol_no_clients == false) {
					ListNode *node_sub2 = client_last_activity->list_client->first;
					for (; node_sub2 != NULL;) {
						client = node_sub2->value;
						SDEBUG("client: %p", client);
						SDEBUG("client->bol_request_in_progress: %s",
							client != NULL ? (client->bol_request_in_progress ? "true" : "false") : "(null)");
						if (client != NULL && client->bol_request_in_progress == false) {
							node_sub2 = node_sub2->next;
							client_close_immediate(client);
						} else {
							node_sub2 = node_sub2->next;
						}
						SDEBUG("node_sub2: %p", node_sub2);
					}
					node = node->next;
				} else {
					SDEBUG("node: %p", node);
					ListNode *node_temp = node;
					node = node->next;
					List_remove(_server.list_client_last_activity, node_temp);
					client_last_activity_free(client_last_activity);
				}
			} else {
				node = node->next;
			}
		}
	}
}

static const char *str_postgres_timestamp_format = "%Y/%m/%d %H:%M:%S";
void connect_cb_log_queries_over(EV_P, void *cb_data, DB_conn *conn) {
	if (cb_data != NULL) {
	} // get rid of unused parameter warning
	SERROR_CHECK(conn->int_status == 1, "%s", conn->str_response);
	
	return;
error:
	ev_break(EV_A, EVBREAK_ALL);
}

bool log_queries_over_query_cb(EV_P, void *cb_data, DB_result *res) {
	if (loop != NULL) {
	} // get rid of unused parameter warning
	if (cb_data != NULL) {
	} // get rid of unused parameter warning
	SDEBUG("connect_cb_env_step2");
	SDEFINE_VAR_ALL(str_diag);
	str_diag = DB_get_diagnostic(log_queries_over_conn, res);

	SERROR_CHECK(res != NULL, "DB_exec failed");
	SERROR_CHECK(res->status == DB_RES_TUPLES_OK, "DB_exec failed: %s", str_diag);

error:
	DB_free_result(res);
	bol_error_state = false;
	SFREE_ALL();
	return true;
}

void check_running_queries(EV_P, ev_periodic *w, int revents) {
	if (loop != NULL) {
	} // get rid of unused parameter warning
	if (w != NULL) {
	} // get rid of unused parameter warning
	if (revents != 0) {
	} // get rid of unused parameter warning
	QueryInfo *query_info = NULL;
	char *str_sql = NULL;
	char *str_qs = NULL;
	size_t int_qs_len = 0;
	char *str_query_enc = NULL;
	size_t int_query_enc_len = 0;
	LIST_FOREACH(list_global_running_queries, first, next, node) {
		query_info = node->value;
		if (query_info != NULL) {
			ev_tstamp now = ev_now(EV_A);
			if ((now - query_info->tim_start) > (double)int_global_log_queries_over && (now - query_info->tim_start) < ((double)int_global_log_queries_over * 2)) {
				SALWAYS_LOG("Query has been running for %zu seconds!", (size_t)(now - query_info->tim_start));
				SALWAYS_LOG("Pid: %d", query_info->int_pid);
				time_t tim_rawtime = (time_t)query_info->tim_start;
				struct tm tm_timeinfo;
#ifdef _WIN32
				SERROR_CHECK(localtime_s(&tm_timeinfo, &tim_rawtime) == 0, "localtime_s %d (%s)", errno, strerror(errno));
#else
				SERROR_CHECK(localtime_r(&tim_rawtime, &tm_timeinfo) != NULL, "localtime_r %d (%s)", errno, strerror(errno));
#endif
				char str_started[256] = { 0 };
				SERROR_CHECK(strftime(str_started, 255, str_postgres_timestamp_format, &tm_timeinfo) != 0, "strftime() failed");
				SALWAYS_LOG("Query started: %s", str_started);
				SALWAYS_LOG("Query: %s", query_info->str_query);
				SALWAYS_LOG("str_global_log_queries_over_action_name: %s", str_global_log_queries_over_action_name);

				if (str_global_log_queries_over_action_name != NULL) {
					int_query_enc_len = strlen(query_info->str_query);
					str_query_enc = cstr_to_uri(query_info->str_query, &int_query_enc_len);
					SALWAYS_LOG("str_query_enc: %s", str_query_enc);
					SALWAYS_LOG("int_query_enc_len: %zu", int_query_enc_len);
					SERROR_CHECK(str_query_enc != NULL, "cstr_to_uri failed");
					char str_pid[256] = { 0 };
					// the int type can't be long enough for this to overrun
					sprintf(str_pid, "%d", query_info->int_pid);
					SERROR_SNCAT(str_sql, &int_qs_len,
						"pid=", (size_t)4,
						str_pid, strlen(str_pid),
						"&started=", (size_t)9,
						str_started, strlen(str_started),
						"&query=", (size_t)7,
						str_query_enc, int_query_enc_len
					);
					str_qs = DB_escape_literal(log_queries_over_conn, str_sql, int_qs_len);
					SERROR_CHECK(str_qs != NULL, "DB_escape_literal failed");
					SFREE(str_sql);
					SERROR_SNCAT(str_sql, &int_qs_len,
						"SELECT ", (size_t)7,
						str_global_log_queries_over_action_name, strlen(str_global_log_queries_over_action_name),
						"(", (size_t)1,
						str_qs, strlen(str_qs),
						");", (size_t)2
					);
                    SERROR_CHECK(DB_exec(EV_A, log_queries_over_conn, NULL, str_sql, log_queries_over_query_cb), "DB_exec failed");
					SINFO("str_sql: %s", str_sql);
					SFREE(str_qs);
					SFREE(str_sql);
				}
			}
		}
	}
	SFREE(str_sql);
	SFREE(str_qs);
	SFREE(str_query_enc);
	return;
error:
	SFREE(str_sql);
	SFREE(str_qs);
	SFREE(str_query_enc);
	SERROR_NORESPONSE("MUCH BADNESS!");
}

void sig_cb(EV_P, ev_signal *w, int revents) {
	if (loop != NULL) {
	} // get rid of unused parameter warning
	if (w != NULL) {
	} // get rid of unused parameter warning
	if (revents != 0) {
	} // get rid of unused parameter warning
    program_exit();
    exit(0);
}

/*
Program entry point
*/
int main(int argc, char *const *argv) {
	EV_P = NULL;
#ifdef _WIN32
	WORD w_version_requested;
	WSADATA wsa_data;
	int err;
	w_version_requested = MAKEWORD(2, 2);

	err = WSAStartup(w_version_requested, &wsa_data);
	if (err != 0) {
		printf("WSAStartup failed with error: %d\n", err);
		return 1;
	}
#endif
#ifdef _WIN32
	SERROR_CHECK(_getcwd(cwd, sizeof(cwd)) != NULL, "getcwd failed");
#else
	SERROR_CHECK(getcwd(cwd, sizeof(cwd)) != NULL, "getcwd failed");
#endif

	// This would be an SERROR_CHECK, but the parse_options function already
	// prints an error if it fails
	if (parse_options(argc, argv) == false) {
		goto error;
	}
	SINFO("Configuration finished");

	EV_A = global_loop = ev_default_loop(0);
	SERROR_CHECK(EV_A != NULL, "ev_default_loop failed!");
    ev_signal_init(&exitsig, sig_cb, SIGINT);
    ev_signal_start(EV_A, &exitsig);

	if (int_global_login_timeout > 0) {
		memset(&last_activity_free_timer, 0, sizeof(ev_periodic));
		ev_periodic_init(&last_activity_free_timer, free_last_activity, 0, 10, NULL);
		ev_periodic_start(EV_A, &last_activity_free_timer);
	}

	if (int_global_log_queries_over > 0) {
		if (str_global_log_queries_over_action_name != NULL) {
			log_queries_over_conn = DB_connect(EV_A, NULL, get_connection_info("", NULL),
				str_global_public_username, strlen(str_global_public_username),
				str_global_public_password, strlen(str_global_public_password),
				"", connect_cb_log_queries_over);
		}
		memset(&check_running_queries_timer, 0, sizeof(ev_periodic));
		ev_periodic_init(&check_running_queries_timer, check_running_queries, 0, (ev_tstamp)(int_global_log_queries_over) / 10, NULL);
		ev_periodic_start(EV_A, &check_running_queries_timer);
	}

	memset(&_server, 0, sizeof(_server));

#ifdef _WIN32
#else
	// clear sigpipe handler
	signal(SIGPIPE, SIG_IGN);
#endif

	struct addrinfo hints;
	struct addrinfo *res;

	// atexit(program_exit);

	SERROR_CHECK(DB_init_framework(), "DB_init_framework() failed");

	// Initialize AES
	SSL_library_init();
	init_aes_key_iv();

#ifdef _WIN32
#else
	if (strncmp(str_global_port, "unix:", 5) == 0) {
		struct sockaddr_un addr;
		int_sock = socket(PF_UNIX, SOCK_STREAM, 0);
		SERROR_CHECK(int_sock != INVALID_SOCKET, "Failed to create socket");

		memset(&addr, 0, sizeof(addr));
		addr.sun_family = AF_UNIX;
		memcpy(addr.sun_path, str_global_port + 5, strlen(str_global_port + 5));
		unlink(addr.sun_path);
		SINFO("addr.sun_path: %s", addr.sun_path);
		SERROR_CHECK(bind(int_sock, (struct sockaddr *)&addr, sizeof(addr)) != -1, "bind failed");
		chmod(addr.sun_path, 0666);

	} else {
#endif
		// Get address info
		memset(&hints, 0, sizeof(hints));
		hints.ai_family = AF_INET;
		hints.ai_socktype = SOCK_STREAM;
		hints.ai_flags = AI_PASSIVE;
		int int_status = getaddrinfo(NULL, str_global_port, &hints, &res);
		SERROR_CHECK(int_status == 0, "getaddrinfo failed: %d (%s)", int_status, gai_strerror(int_status));

		// Get socket to bind
		int_sock = socket(res->ai_family, res->ai_socktype, res->ai_protocol);
		SERROR_CHECK(int_sock != INVALID_SOCKET, "Failed to create socket");

		// Set socket to reuse the address
		int bol_reuseaddr = 1;
		SERROR_CHECK(setsockopt((int)int_sock, SOL_SOCKET, SO_REUSEADDR, &bol_reuseaddr, sizeof(int)) != -1, "setsockopt failed");

		((struct sockaddr_in *)(res->ai_addr))->sin_addr.s_addr = htonl(bol_global_local_only ? INADDR_LOOPBACK : INADDR_ANY);
		// Bind socket
		SERROR_CHECK(bind(int_sock, res->ai_addr, (socklen_t)res->ai_addrlen) != -1, "bind failed");

		freeaddrinfo(res);
#ifdef _WIN32
#else
	}
#endif

	// Listen on socket
	SERROR_CHECK(listen(int_sock, 10) != -1, "listen failed");

	// Set socket to NONBLOCK
	setnonblock(int_sock);

	// Create Client List
	_server.list_client = List_create();
	SERROR_CHECK(_server.list_client, "List_create failed");
	_server.list_client_last_activity = List_create();
	SERROR_CHECK(_server.list_client_last_activity, "List_create failed");
	_server.int_sock = int_sock;

// Add callback for readable data
#ifdef _WIN32
	int fd = _open_osfhandle(int_sock, 0);
	ev_io_init(&_server.io, server_cb, fd, EV_READ);
#else
	ev_io_init(&_server.io, server_cb, int_sock, EV_READ);
#endif
	ev_io_start(EV_A, &_server.io);

	printf("\n\nOpen http://<this computer's ip>:%s/ in your web browser\n", str_global_port);
	fflush(0);

	ev_run(EV_A, 0);

	program_exit();
	return 0;
error:
	if (EV_A != NULL) {
		program_exit();
	}
	return 1;
}
