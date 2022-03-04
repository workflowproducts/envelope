#include "common_server.h"

struct ev_loop *EV_A = NULL;
struct sock_ev_serv _server;

// set a socket to not blocking
int setnonblock(SOCKET int_sock) {
#ifdef _WIN32
	u_long mode = 1;
	return ioctlsocket(int_sock, FIONBIO, &mode);
#else
	int flags;
	flags = fcntl(int_sock, F_GETFL);
	flags |= O_NONBLOCK;
	return fcntl(int_sock, F_SETFL, flags);
#endif
}

// accept new client on a new connection
void server_cb(EV_P, ev_io *w, int revents) {
	if (revents != 0) {
	} // get rid of unused parameter warning
	SDEBUG("TCP stream socket has become readable");
	struct sock_ev_client *client = NULL;

	SOCKET int_client_sock;

	// since ev_io is the first member, watcher `w` has the address of the start
	// of the sock_ev_serv struct
	struct sock_ev_serv *server = (struct sock_ev_serv *)w;
	struct sockaddr_in client_address;
	socklen_t int_client_len = sizeof(client_address);

	// this will break out when there are no more clients waiting to connect
	while (1) {
		errno = 0;
		int_client_sock = accept(server->int_sock, (struct sockaddr *)&client_address, &int_client_len);
		if (int_client_sock == INVALID_SOCKET) {
			if (errno != EAGAIN && errno != EWOULDBLOCK && errno != 0) {
				char *err = strerror(errno);
				printf("accept() failed errno: %i (%s)\012", errno, err);
				abort();
			} else {
				errno = 0;
			}

			// this is where it breaks out, notice if there is an error it doesn't get
			// here
			break;
		}
		SDEBUG("accepted a client");

		SERROR_SALLOC(client, sizeof(struct sock_ev_client));
		SERROR_CHECK(List_push(server->list_client, client) == true, "Failed to push client to array");
		SDEBUG("Client %p opened", client);
		client->int_sock = int_client_sock;
		client->server = server;
		client->int_last_activity_i = -1;
		client->node = server->list_client->last;
		client->bol_handshake = false;
		client->bol_connected = false;
		client->bol_socket_is_open = true;
		client->bol_upload = false;
		client->str_boundary = NULL;
		client->int_boundary_len = 0;
		client->conn = NULL;
		client->bol_is_open = true;
		SERROR_SNCAT(client->str_request, &client->int_request_len,
			"", (size_t)0);
		client->str_response = NULL;
		client->str_message = NULL;
		client->str_cookie = NULL;
		client->que_message = NULL;
		client->client_paused_request = NULL;
		client->client_timeout_prepare = NULL;
		client->que_request = NULL;
		client->bol_request_in_progress = false;
		client->notify_watcher = NULL;
		client->int_request_len = 0;
		client->bol_ssl_handshake = false;
		client->int_current_header_start = 0;
		client->bol_full_request = false;
		client->bol_headers_parsed = false;
		client->bol_headers_evaluated = false;
		client->darr_str_header_name = DArray_create(sizeof(char *), 25);
		client->darr_str_header_value = DArray_create(sizeof(char *), 25);

        SERROR_SALLOC(client->str_client_ip, 50);
		if (inet_ntop(AF_INET, &client_address.sin_addr.s_addr, client->str_client_ip, 50) != NULL) {
			SDEBUG("Got connection from %s:%d", client->str_client_ip, ntohs(client_address.sin_port));
		} else {
			SDEBUG("Unable to get address");
		}
        client->int_client_ip_len = strlen(client->str_client_ip);

		errno = 0;

		setnonblock(client->int_sock);

#ifdef _WIN32
		client->int_ev_sock = _open_osfhandle(int_client_sock, 0);
		SERROR_CHECK(client->int_ev_sock != -1, "_open_osfhandle failed");
#else
		client->int_ev_sock = int_client_sock;
#endif
        ev_idle_init(&client->idle_request_queue, idle_cb);
		ev_io_init(&client->io, client_cb, client->int_ev_sock, EV_READ);
		ev_io_start(EV_A, &client->io);
		client = NULL;
	}
	bol_error_state = false;
error:
	return;
}

void client_last_activity_free(struct sock_ev_client_last_activity *client_last_activity) {
	if (client_last_activity != NULL) {
		SFREE(client_last_activity->str_cookie);
		SFREE(client_last_activity->str_client_ip);
	}
	SFREE(client_last_activity);
}
