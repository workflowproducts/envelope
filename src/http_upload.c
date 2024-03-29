#include "http_upload.h"

void http_upload_step1(EV_P, struct sock_ev_client *client) {
	SDEBUG("http_upload_step1");
	size_t int_response_len = 0;

	SDEFINE_VAR_ALL(str_temp, str_full_path);
	char *str_response = NULL;
	struct sock_ev_client_upload *client_upload = NULL;
#ifdef _WIN32
	LPTSTR strErrorText = NULL;
#endif

	SFINISH_SALLOC(client_upload, sizeof(struct sock_ev_client_upload));
    client->client_upload = client_upload;
	client_upload->parent = client;
	client_upload->int_written = 0;
#ifdef _WIN32
	client_upload->h_file = INVALID_HANDLE_VALUE;
#else
	client_upload->int_fd = -1;
#endif

	//char str_temp2[2049] = { 0 };
	//memcpy(str_temp2, client->str_request, 2048);
	//SDEBUG("first 2 KB: %s", str_temp2);
	//memcpy(str_temp2, client->str_request + (client->int_request_len - 1024), 1024);
	//SDEBUG("last KB:");
	//size_t int_i = 0;
	//while (int_i < 1024) {
	//	putchar(str_temp2[int_i]);
	//	int_i += 1;
	//}
	//fflush(stdout);

	// Get upload from request
	client_upload->sun_current_upload = get_sun_upload(client);
	SFINISH_CHECK(client_upload->sun_current_upload != NULL, "get_sun_upload failed");
	SDEBUG("upload length: %zu", client_upload->sun_current_upload->int_file_content_len);

	SDEBUG("after end of content: %s", client_upload->sun_current_upload->ptr_file_content + client_upload->sun_current_upload->int_file_content_len);

	client_upload->ptr_content = client_upload->sun_current_upload->ptr_file_content;
	//SDEBUG("upload contents: %p", client_upload->ptr_content);

	SFINISH_SNCAT(
		client_upload->str_file_name, &client_upload->int_file_name_len
		, client_upload->sun_current_upload->str_name, strlen(client_upload->sun_current_upload->str_name)
	);

	client_upload->str_canonical_start = canonical_full_start(client_upload->str_file_name);
	SFINISH_CHECK(
		client_upload->str_canonical_start != NULL
		, "canonical_full_start() failed, %s"
		, client_upload->str_canonical_start
	);

	str_temp = client_upload->str_file_name;
	client_upload->str_file_name = canonical_strip_start(str_temp);
	SFINISH_CHECK(
		client_upload->str_file_name != NULL
		, "canonical_strip_start() failed, %s"
		, str_temp
	);

	str_full_path = canonical(client_upload->str_canonical_start, client_upload->str_file_name, "valid_path");
	SFINISH_CHECK(str_full_path != NULL, "invalid path: %s", client_upload->str_file_name);
	SDEBUG("str_full_path: %s", str_full_path);

	SDEBUG("str_temp: %s", str_temp);
	SDEBUG("client_upload->str_canonical_start: %s", client_upload->str_canonical_start);
	SDEBUG("client_upload->str_file_name: %s", client_upload->str_file_name);

	SFINISH_CHECK(permissions_write_check(EV_A, client->conn, str_temp, client_upload, http_upload_step2),
		"permissions_write_check() failed");
	SFREE(str_temp);

    bol_error_state = false;
finish:
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
		http_upload_free(client_upload);
	}
}

bool http_upload_step2(EV_P, void *cb_data, bool bol_group) {
	struct sock_ev_client_upload *client_upload = (struct sock_ev_client_upload *)cb_data;
	struct sock_ev_client *client = client_upload->parent;
	char *str_response = NULL;
	size_t int_response_len = 0;
	SDEFINE_VAR_ALL(str_temp);
#ifdef _WIN32
	char *strErrorText = NULL;
#endif

	SFINISH_CHECK(bol_group, "You don't have the necessary permissions for this folder.");

	// Make sure the file doesn't already exist
	str_temp = canonical(client_upload->str_canonical_start, client_upload->str_file_name, "read_file");
	SFINISH_CHECK(str_temp == NULL, "File already exists.");
	SFREE(str_global_error);

	// Now open the file
	str_temp = canonical(client_upload->str_canonical_start, client_upload->str_file_name, "write_file");
	SFINISH_CHECK(str_temp != NULL, "Invalid path.");
#ifdef _WIN32
	SetLastError(0);
	client_upload->h_file = CreateFileA(str_temp, GENERIC_WRITE, 0, NULL, CREATE_NEW, FILE_ATTRIBUTE_NORMAL, NULL);
	if (client_upload->h_file == INVALID_HANDLE_VALUE) {
		int int_err = GetLastError();
		FormatMessageA(
			FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_IGNORE_INSERTS, NULL, int_err
			, MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT), (LPSTR)&strErrorText, 0, NULL
		);

		if (strErrorText != NULL) {
			SFINISH("CreateFile failed: 0x%X (%s)", int_err, strErrorText);
		}
	}
#else
	client_upload->int_fd = open(str_temp, O_TRUNC | O_WRONLY | O_CREAT, 0770);
	SFINISH_CHECK(client_upload->int_fd >= 0, "open() failed!");
#endif

	ev_check_init(&client_upload->check, http_upload_step3);
	ev_check_start(EV_A, &client_upload->check);
	ev_idle_init(&client_upload->idle, idle_cb);
	ev_idle_start(EV_A, &client_upload->idle);

	bol_error_state = false;
finish:
#ifdef _WIN32
	if (strErrorText != NULL) {
		LocalFree(strErrorText);
		strErrorText = NULL;
	}
#endif
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
		http_upload_free(client_upload);
	}
	return true;
}

void http_upload_step3(EV_P, ev_check *w, int revents) {
	if (loop != NULL) {} // get rid of unused parameter warning
	if (revents != 0) {} // get rid of unused parameter warning
	struct sock_ev_client_upload *client_upload = (struct sock_ev_client_upload *)w;
	struct sock_ev_client *client = client_upload->parent;
	char *str_response = NULL;
	size_t int_response_len = 0;
#ifdef _WIN32
	LPTSTR strErrorText = NULL;
#endif

#ifdef _WIN32
	DWORD int_temp = 0;
	BOOL bol_result = WriteFile(
		client_upload->h_file, client_upload->ptr_content + client_upload->int_written
		, (DWORD)(client_upload->sun_current_upload->int_file_content_len - client_upload->int_written), &int_temp, NULL
	);
	if (bol_result == FALSE) {
		int int_err = GetLastError();
		FormatMessageA(
			FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_IGNORE_INSERTS, NULL, int_err
			, MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT), (LPSTR)&strErrorText, 0, NULL
		);

		if (strErrorText != NULL) {
			SFINISH("WriteFile failed: 0x%X (%s)", int_err, strErrorText);
		}
	}
#else
	ssize_t int_temp = 0;
	int_temp = write(
		client_upload->int_fd, client_upload->ptr_content + client_upload->int_written
		, (size_t)((ssize_t)client_upload->sun_current_upload->int_file_content_len - client_upload->int_written)
	);
	SFINISH_CHECK(int_temp != -1, "write failed");
#endif
	client_upload->int_written += int_temp;

	if (client_upload->int_written == (ssize_t)client_upload->sun_current_upload->int_file_content_len) {
        SFINISH_CHECK(
			build_http_response(
                "200 OK"
                , "Upload Succeeded\012", strlen("Upload Succeeded\012")
                , "text/plain"
                , NULL
                , &client->str_http_response, &client->int_http_response_len
            )
			, "build_http_response failed"
		);
        ev_check_stop(EV_A, w);
	}

	bol_error_state = false;
finish:
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
		http_upload_free(client_upload);
	}
}

void http_upload_free(struct sock_ev_client_upload *to_free) {
	EV_P = global_loop;
#ifdef _WIN32
	if (to_free->h_file != INVALID_HANDLE_VALUE) {
		CloseHandle(to_free->h_file);
		to_free->h_file = INVALID_HANDLE_VALUE;
	}
#else
	if (to_free->int_fd > -1) {
		close(to_free->int_fd);
		to_free->int_fd = -1;
	}
#endif
    ev_check_stop(EV_A, &to_free->check);
    ev_idle_stop(EV_A, &to_free->idle);
	SFREE(to_free->str_canonical_start);
	SFREE(to_free->str_file_name);
	SFREE_SUN_UPLOAD(to_free->sun_current_upload);
	SFREE(to_free);
}
