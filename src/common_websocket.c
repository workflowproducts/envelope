#include "common_websocket.h"

char *WS_handshakeResponse(char *str_websocket_key, size_t *int_response_len) {
	char *str_response = NULL;
	char *str_temp = NULL;
	char *str_temp1 = NULL;
	size_t int_temp1_len;

	SDEFINE_VAR_ALL(str_websocket_accept);

	SERROR_SNCAT(
		str_response, int_response_len
		, "HTTP/1.1 101 Switching Protocols\015\012", (size_t)34
		, "Upgrade: websocket\015\012", (size_t)20
		, "Connection: Upgrade\015\012", (size_t)21
		, "Sec-WebSocket-Accept: ", (size_t)22
	);

	// The Sec-WebSocket-Accept part is interesting.
	// The server must derive it from the Sec-WebSocket-Key that the client sent.
	// To get it, concatenate the client's Sec-WebSocket-Key and
	// "258EAFA5-E914-47DA-95CA-C5AB0DC85B11" together
	// (it's a "magic string"), take the SHA-1 hash of the result, and return the
	// base64 encoding of the hash.
	// - The above was taken from a Mozilla guide years ago.
	//		Basically, this is a challenge-response protocol so the browser can send an HTTP/1.1
	//		request that turns into a websocket while not breaking a normal HTTP server.

	// Concat
	SERROR_SNCAT(
		str_temp1, &int_temp1_len
		, str_websocket_key, strlen(str_websocket_key)
		, "258EAFA5-E914-47DA-95CA-C5AB0DC85B11", (size_t)36
	);

	// SHA and b64
	SERROR_SALLOC(str_websocket_accept, 20);
	SHA1((unsigned char *)str_temp1, strlen(str_temp1), (unsigned char *)str_websocket_accept);
	str_temp = str_websocket_accept;
	size_t int_len = 20;
	str_websocket_accept = b64encode(str_temp, &int_len);
	SERROR_CHECK(str_websocket_accept != NULL, "b64encode failed");
	SFREE(str_temp);
	SFREE(str_temp1);

	// Add it to the response
	SERROR_SNFCAT(
		str_response, int_response_len
		, str_websocket_accept, int_len
		, "\015\012Sec-WebSocket-Version: 13\015\012\015\012", (size_t)31
	);

	SFREE_ALL();
	bol_error_state = false;
	return str_response;
error:
	SFREE_ALL();
	SFREE(str_response);
	return NULL;
}

void _WS_readFrame(EV_P, struct sock_ev_client *client, void (*cb)(EV_P, WSFrame *)) {
	SDEBUG("_WS_readFrame");
	WSFrame *frame = NULL;
	struct sock_ev_client_message *client_message = NULL;
	SERROR_SALLOC(client_message, sizeof(struct sock_ev_client_message));

	SERROR_SALLOC(frame, sizeof(WSFrame));
	frame->cb = cb;
	client_message->bol_have_header = false;
	frame->str_mask = NULL;
	client_message->frame = frame;
	frame->parent = client;
	client_message->int_position = 0;

	ev_io_stop(EV_A, &client->io);

	Queue_send(client->que_message, client_message);
	ev_io_init(&client_message->io, WS_readFrame_step2, client->int_ev_sock, EV_READ);
	ev_io_start(EV_A, &client_message->io);
	//SDEBUG("client->str_request: %s", client->str_request);

	bol_error_state = false;
	return;

error:
	if (bol_error_state == true) {
		bol_error_state = false;
		WS_client_message_free(client_message);
		WS_freeFrame(frame);
		List_shift(client->que_message);
	}

	errno = 0;
}

void WS_readFrame_step2(EV_P, ev_io *w, int revents) {
	if (revents != 0) {
	} // get rid of unused parameter warning
	struct sock_ev_client_message *client_message = (struct sock_ev_client_message *)w;
	SDEBUG("client_message: %p", client_message);
	WSFrame *frame = client_message->frame;
	unsigned char *buf = NULL;
	// This was unsigned, but it was messing with the error conditionals below
	// - Unknown author, probably Nunzio
	// Note that the error handling has been changed so if anything in this function
	// errors and this value is untouched, the websocket will be closed. In most
	// cases this is fine because the client can just reconnect their session.
	// - Nunzio on 2022-11-30
	int64_t int_request_len = 0;
	SERROR_SALLOC(buf, BUF_LEN + 1);

	errno = 0;

	memset(buf, 0, BUF_LEN + 1);

	if (client_message->bol_have_header == false) {
		int_request_len = read(frame->parent->int_sock, buf, WEBSOCKET_HEADER_LENGTH);
		SERROR_CHECK(int_request_len != 0, "Libev said EV_READ, but there is nothing to read. Closing socket")
		SERROR_CHECK(int_request_len > 0, "read() failed")
		SDEBUG("int_request_len    : %d", int_request_len);
		SDEBUG("buf[0]: 0x%02x", buf[0]);
		SDEBUG("buf[1]: 0x%02x", buf[1]);
		SERROR_CHECK(int_request_len == WEBSOCKET_HEADER_LENGTH, "FAILED TO READ WEBSOCKET HEADER");
		// 0x79 == 0b01110000 (RSV bits)
		SERROR_CHECK((buf[0] & 0x70) == 0, "RSV bit set!");

		// clang-format off
		// Get details from the header
		frame->bol_fin         = (buf[0] & 0x80) >> 7;  // 0b10000000
		frame->int_opcode      =  buf[0] & 0x0f;        // 0b00001111
		frame->bol_mask        = (buf[1] & 0x80) >> 7;  // 0b10000000
		frame->int_orig_length =  buf[1] & 0x7f;        // 0b01111111
		// clang-format on
		frame->int_length = frame->int_orig_length;
		client_message->bol_have_header = true;

	}

	memset(buf, 0, BUF_LEN + 1);

	// Extended lengths
	if (frame->int_length == 126) {
		int_request_len = read(frame->parent->int_sock, buf, 2);
		if (int_request_len < -1) {
			// This is a state where we want to read (or write) but can't
			// Silently ignore it, it will be taken care of below
			goto error;
		}
		SDEBUG("int_request_len    : %d", int_request_len);
		SERROR_CHECK(int_request_len == 2, "Could not read from client");

		frame->int_length = (((uint64_t)buf[0]) << 8) | (((uint64_t)buf[1]) << 0);

	} else if (frame->int_length == 127) {
		int_request_len = read(frame->parent->int_sock, buf, 8);
		if (int_request_len < -1) {
			// This is a state where we want to read (or write) but can't
			// Silently ignore it
			goto error;
		}
		SDEBUG("int_request_len    : %d", int_request_len);
		SERROR_CHECK(int_request_len == 8, "Could not read from client");

		frame->int_length = (((uint64_t)buf[0]) << 56) | (((uint64_t)buf[1]) << 48) | (((uint64_t)buf[2]) << 40)
						  | (((uint64_t)buf[3]) << 32) | (((uint64_t)buf[4]) << 24) | (((uint64_t)buf[5]) << 16)
						  | (((uint64_t)buf[6]) << 8) | (((uint64_t)buf[7]) << 0);
	}

	memset(buf, 0, BUF_LEN + 1);

	if (frame->bol_mask == true && frame->str_mask == NULL) {
		// the mask is four bytes long
		int_request_len = read(frame->parent->int_sock, buf, 4);
		if (int_request_len < -1) {
			// This is a state where we want to read (or write) but can't
			// Silently ignore it, it will be taken care of below
			goto error;
		}
		SDEBUG("int_request_len    : %d", int_request_len);
		SERROR_CHECK(int_request_len == 4, "Could not read from client");

		SERROR_SALLOC(frame->str_mask, 4);
		memcpy(frame->str_mask, buf, 4);
	}

	// Get the length we haven't read yet
	uint64_t int_temp_length = frame->int_length - client_message->int_position;
	if (frame->str_message == NULL) {
		SERROR_SALLOC(frame->str_message, frame->int_length + 1);

		// NULL-terminate
		frame->str_message[frame->int_length] = 0;
	}

	// DEBUG("Reading, position: %u", client_message->int_position);
	// read into buf min(BUF_LEN, int_temp_length) bytes
	uint64_t int_expected_length = BUF_LEN < int_temp_length ? BUF_LEN : int_temp_length;

	if (int_expected_length > 0) {
		int_request_len = read(frame->parent->int_sock, buf, int_expected_length);
		if (int_request_len < -1) {
			// This is a state where we want to read (or write) but can't
			// Silently ignore it, it will be taken care of below
			goto error;
		}
		SDEBUG("int_request_len    : %d", int_request_len);
		SDEBUG("int_expected_length: %d", int_expected_length);
		SERROR_CHECK((uint64_t)int_request_len <= int_expected_length, "Could not read from client");
	} else {
		int_request_len = 0;
	}

	buf[int_request_len] = 0;
	// Copy to the heap
	memcpy(frame->str_message + client_message->int_position, buf, (size_t)int_request_len);
	SDEBUG("client_message->int_position: %d", client_message->int_position);
	client_message->int_position = client_message->int_position + (uint64_t)int_request_len;
	SDEBUG("client_message->int_position: %d", client_message->int_position);

	if (client_message->int_position == frame->int_length) {
		if (frame->bol_mask) {
			// Decode
			uint64_t int_i;
			for (int_i = 0; int_i < frame->int_length; int_i++) {
				frame->str_message[int_i] = frame->str_message[int_i] ^ frame->str_mask[int_i % 4];
			}
			SFREE(frame->str_mask);
		}

		ev_io_stop(EV_A, w);

		WS_client_message_free(client_message);

		if (frame->parent->client_last_activity != NULL) {
			if (frame->parent->client_last_activity != NULL) {
				SDEBUG("ev_now(EV_A)                            : %f", ev_now(EV_A));
				SDEBUG("client_last_activity                    : %p", frame->parent->client_last_activity);
				SDEBUG("client_last_activity->last_activity_time: %f", frame->parent->client_last_activity->last_activity_time);
				frame->parent->client_last_activity->last_activity_time = ev_now(EV_A);
			}
		}

		frame->cb(EV_A, frame);
	}

	SDEBUG("int_request_len: %d", int_request_len);
	SDEBUG("client_message->int_position: %d", client_message->int_position);
	SDEBUG("frame->int_length: %d", frame->int_length);
	bol_error_state = false;
	SFREE(buf);
	return;

error:
	SFREE(buf);
	SDEBUG("frame->parent: %p", frame->parent);
	SDEBUG("int_request_len: %d", int_request_len);
	SDEBUG("errno: %d", errno);

	if (int_request_len <= 0 && errno != EAGAIN) {
		SERROR_NORESPONSE("disconnect");
		SFREE(str_global_error);

		ev_io_stop(EV_A, w);

		struct sock_ev_client *client = frame->parent;
		WS_client_message_free(client_message);
		WS_freeFrame(frame);

		SERROR_CLIENT_CLOSE_NORESPONSE(client);
		bol_error_state = false;
		errno = 0;

	} else if (errno == EAGAIN) {
		SERROR_NORESPONSE("Reached EAGAIN, waiting for more data");
		SERROR_NORESPONSE("should never get to EAGAIN with libev");
		SFREE(str_global_error);
		bol_error_state = false;
		errno = 0;

	}
}

bool WS_sendFrame(EV_P, struct sock_ev_client *client, bool bol_fin, int8_t int_opcode, char *str_message, uint64_t int_length) {
	SDEBUG("WS_sendFrame");
	char *str_response = NULL;

	if (client->bol_is_open == false) {
		return true;
	}

	// TODO: split frames for long messages
	int8_t int_orig_length = (int8_t)(int_length > 126 ? int_length > 65535 ? 127 : 126 : int_length);
	struct sock_ev_client_message *client_message = NULL;

	SERROR_SALLOC(client_message, sizeof(struct sock_ev_client_message));
	SERROR_SALLOC(client_message->frame, sizeof(WSFrame));

	client_message->int_message_header_length =
		WEBSOCKET_HEADER_LENGTH + (int_orig_length < 126 ? 0 : int_orig_length == 126 ? 2 : int_orig_length == 127 ? 8 : 0);
	client_message->int_length = int_length;
	client_message->frame->parent = client;
	client_message->frame->int_opcode = int_opcode;

	// Allocate enough space for the message
	SERROR_SALLOC(str_response, client_message->int_message_header_length + client_message->int_length + 1);

	SDEBUG("bol_fin                                        : %d", bol_fin);
	SDEBUG("(bol_fin << 7)                                 : %d", (bol_fin << 7));
	SDEBUG("(bol_fin << 7) | int_opcode                    : %d", (bol_fin << 7) | int_opcode);
	SDEBUG("(bol_fin << 7) | (char)int_opcode)             : %d", ((bol_fin << 7) | (char)int_opcode));
	SDEBUG("((char)bol_fin << 7) | int_opcode)             : %d", (((char)bol_fin << 7) | int_opcode));
	SDEBUG("((char)bol_fin << 7) | (char)int_opcode)       : %d", (((char)bol_fin << 7) | (char)int_opcode));
	SDEBUG("(char)((bol_fin << 7) | int_opcode)            : %d", (char)((bol_fin << 7) | int_opcode));
	SDEBUG("(char)((bol_fin << 7) | (char)int_opcode)      : %d", (char)((bol_fin << 7) | (char)int_opcode));
	SDEBUG("(char)(((char)bol_fin << 7) | int_opcode)      : %d", (char)(((char)bol_fin << 7) | int_opcode));
	SDEBUG("(char)(((char)bol_fin << 7) | (char)int_opcode): %d", (char)(((char)bol_fin << 7) | (char)int_opcode));
	SDEBUG("int_opcode                                     : %d", int_opcode);
	str_response[0] = (char)((bol_fin << 7) | int_opcode); // FIN/OPCODE
	str_response[1] = (char)(0x00 | int_orig_length);	  // MASK/length
	// Extended lengths
	if (int_orig_length == 126) {
		str_response[2] = (char)((int_length & 0xff00) >> 8);
		str_response[3] = (char)((int_length & 0x00ff) >> 0);
	} else if (int_orig_length == 127) {
		str_response[2] = (char)((int_length & 0xff00000000000000) >> 56);
		str_response[3] = (char)((int_length & 0x00ff000000000000) >> 48);
		str_response[4] = (char)((int_length & 0x0000ff0000000000) >> 40);
		str_response[5] = (char)((int_length & 0x000000ff00000000) >> 32);
		str_response[6] = (char)((int_length & 0x00000000ff000000) >> 24);
		str_response[7] = (char)((int_length & 0x0000000000ff0000) >> 16);
		str_response[8] = (char)((int_length & 0x000000000000ff00) >> 8);
		str_response[9] = (char)((int_length & 0x00000000000000ff) >> 0);
	}

	memcpy(str_response + client_message->int_message_header_length, str_message, int_length);
	client_message->frame->str_message = str_response;

	SDEBUG("bol_fin         : %d", bol_fin);
	SDEBUG("int_opcode      : %d", int_opcode);
	SDEBUG("str_response[0] : %d", str_response[0]);
	SDEBUG("str_response[0] : %x", str_response[0]);
	SDEBUG("str_response[1] : %d", str_response[1]);
	SDEBUG("str_response + 2: %s", str_response + 2);

	str_response = NULL;

	Queue_send(client->que_message, client_message);
	ev_io_init(&client_message->io, WS_sendFrame_step2, client->int_ev_sock, EV_WRITE);
	ev_io_start(EV_A, &client_message->io);
	SDEBUG("waiting for writable on client %p", client);

	bol_error_state = false;
	return true;

error:
	SFREE(str_response);
	if (client_message != NULL) {
		WS_client_message_free(client_message);
		WS_freeFrame(client_message->frame);
	}
	return false;
}

void WS_sendFrame_step2(EV_P, ev_io *w, int revents) {
	if (revents != 0) {
	} // get rid of unused parameter warning
	SDEBUG("WS_sendFrame_step2");
	struct sock_ev_client_message *client_message = (struct sock_ev_client_message *)w;
	WSFrame *frame = client_message->frame;
	SINFO("got writable on client %p for message %p", client_message->frame->parent, client_message);

	if (client_message->frame->parent->que_message->last->value != (void *)client_message) {
		return;
	}

	if (frame->parent->bol_socket_is_open == false) {
		SDEBUG("frame->parent->bol_socket_is_open == false");
		ev_io_stop(EV_A, w);
		WS_client_message_free(client_message);
		WS_freeFrame(frame);
		return;
	}

	errno = 0;

	// Send and free
	SINFO(
		"attempting to write %d bytes at offset %d"
		, (client_message->int_message_header_length + client_message->int_length) - client_message->int_written
		, client_message->int_written
	);
	ssize_t int_len = write(
		frame->parent->int_sock, frame->str_message + client_message->int_written
		, (client_message->int_message_header_length + client_message->int_length) - client_message->int_written
	);
	if (int_len < 0) {
		SERROR("write() failed");
	}
	SINFO("wrote %d bytes", int_len);
	client_message->int_written += (uint64_t)int_len;
	if (client_message->int_written < client_message->int_length) {
		bol_error_state = false;
		return;
	} else {
		if (frame->parent->client_last_activity != NULL) {
			if (frame->parent->client_last_activity != NULL) {
				SDEBUG("ev_now(EV_A)                            : %f", ev_now(EV_A));
				SDEBUG("client_last_activity                    : %p", frame->parent->client_last_activity);
				SDEBUG("client_last_activity->last_activity_time: %f", frame->parent->client_last_activity->last_activity_time);
				frame->parent->client_last_activity->last_activity_time = ev_now(EV_A);
			}
		}

		SINFO("sent message with opcode %x", frame->int_opcode);
		ev_io_stop(EV_A, w);
		WS_client_message_free(client_message);
		WS_freeFrame(frame);
		bol_error_state = false;
		return;
	}

error:
	if (errno == EAGAIN) {
		SERROR_NORESPONSE("should never get to EAGAIN with libev");
		SFREE(str_global_error);
		errno = 0;
		bol_error_state = false;
	} else if (int_len == -1 || errno == EPIPE) {
		SERROR_NORESPONSE("int_len: %d, fd: %d, w: %p, disconnect", int_len, w->fd, w);

		ev_io_stop(EV_A, w);

		struct sock_ev_client *client = frame->parent;
		WS_client_message_free(client_message);
		WS_freeFrame(frame);
		client_message = NULL;

		while (client->que_message->last != NULL) {
                        client_message = client->que_message->last->value;
                        ev_io_stop(EV_A, &client_message->io);
                        WSFrame *frame = client_message->frame;
                        // This removes this node from the queue, so that the next element we want
                        // is the last one
                        WS_client_message_free(client_message);
                        WS_freeFrame(frame);
                }
		client->bol_is_open = false;

		SERROR_CLIENT_CLOSE_NORESPONSE(client);
		errno = 0;
		bol_error_state = false;
	}
}

void WS_client_message_free(struct sock_ev_client_message *client_message) {
	if (client_message != NULL) {
		QUEUE_FOREACH(client_message->frame->parent->que_message, node) {
			if (client_message == node->value) {
				List_remove(client_message->frame->parent->que_message, node);
				break;
			}
		}
		ev_io_stop(global_loop, &client_message->io);
	}
	SFREE(client_message);
}

void _WS_freeFrame(WSFrame *frame) {
	if (frame != NULL) {
		SFREE(frame->str_message);
		SFREE(frame->str_mask);
	}
	SFREE(frame);
}
