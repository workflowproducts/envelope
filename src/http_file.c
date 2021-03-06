#include "http_file.h"

static const char *str_date_format = "%a, %d %b %Y %H:%M:%S GMT";

void http_file_step1(EV_P, struct sock_ev_client *client) {
	SDEBUG("http_file_step1");
	char *str_response = NULL;
	size_t int_response_len = 0;
	char *ptr_end_uri = NULL;
#ifdef _WIN32
	LPTSTR strErrorText = NULL;
#endif

	struct sock_ev_client_copy_check *client_copy_check = NULL;
	struct sock_ev_client_http_file *client_http_file = NULL;
	SDEFINE_VAR_ALL(str_temp, str_temp1, str_uri_temp, str_canonical_start, str_uri_for_permission_check);
	size_t int_uri_for_permission_check_len = 0;

	if (strncmp(client->str_request, "GET ", 4) == 0 || strncmp(client->str_request, "POST ", 5) == 0 || strncmp(client->str_request, "HEAD ", 5) == 0) {
		// We are good
	} else {
		char _str_temp[11] = { 0 };
		memcpy(_str_temp, client->str_request, 10);
		SFINISH("unknown request type, first ten chars of request: %s", _str_temp);
	}

	SFINISH_SALLOC(client_http_file, sizeof(struct sock_ev_client_http_file));
	client_http_file->parent = client;
	client_http_file->str_uri_part = NULL;
#ifdef _WIN32
	client_http_file->h_file = INVALID_HANDLE_VALUE;
#else
	client_http_file->int_file_fd = -1;
#endif
	client_http_file->int_response_header_len = 0;
	client_http_file->int_response_len = 0;
	client_http_file->int_read = 0;
	client_http_file->int_read_len = 0;
	client_http_file->bol_download = 0;
	client_http_file->int_written = 0;
	client_http_file->io.fd = INVALID_SOCKET;

	// get path
	client_http_file->str_uri = str_uri_path(client->str_request, client->int_request_len, &client_http_file->int_uri_len);
	SFINISH_CHECK(client_http_file->str_uri, "str_uri_path failed");
	ptr_end_uri = strchr(client_http_file->str_uri, '?');
	if (ptr_end_uri != NULL) {
		*ptr_end_uri = 0;
		client_http_file->int_uri_len = (size_t)(ptr_end_uri - client_http_file->str_uri);
	}
	ptr_end_uri = strchr(client_http_file->str_uri, '#');
	if (ptr_end_uri != NULL) {
		*ptr_end_uri = 0;
		client_http_file->int_uri_len = (size_t)(ptr_end_uri - client_http_file->str_uri);
	}

	client_http_file->bol_download = false;
	client_http_file->str_uri_part = client_http_file->str_uri;
	client_http_file->int_uri_part_len = client_http_file->int_uri_len;
	client_http_file->int_uri_len = 0;
	client_http_file->str_uri = NULL;

	str_temp = uri_to_cstr(client_http_file->str_uri_part, &client_http_file->int_uri_part_len);
	SFREE(client_http_file->str_uri_part);
	client_http_file->str_uri_part = str_temp;
	str_temp = NULL;

	str_uri_temp = client_http_file->str_uri_part;
	SDEBUG("str_uri_temp: %s", str_uri_temp);
	client_http_file->str_uri_part = NULL;
	bool bol_permission_check = false;
	if (strncmp(str_uri_temp, "/env/app/", 9) == 0) {
		str_canonical_start = canonical_full_start("/app/");
		SFINISH_CHECK(str_canonical_start != NULL, "canonical_full_start failed");
		SFINISH_SNCAT(
			str_uri_for_permission_check, &int_uri_for_permission_check_len,
			str_uri_temp + 4, client_http_file->int_uri_part_len - 4
		);
		SFINISH_SNCAT(
			client_http_file->str_uri_part, &client_http_file->int_uri_part_len,
			str_uri_temp + 9, client_http_file->int_uri_part_len - 9
		);
		bol_permission_check = true;

	} else if (strncmp(str_uri_temp, "/env/role/", 10) == 0) {
		str_canonical_start = canonical_full_start("/role/");
		SFINISH_CHECK(str_canonical_start != NULL, "canonical_full_start failed");
		SFINISH_SNCAT(
			str_uri_for_permission_check, &int_uri_for_permission_check_len,
			str_uri_temp + 4, client_http_file->int_uri_part_len - 4
		);
		SFINISH_SNCAT(
			client_http_file->str_uri_part, &client_http_file->int_uri_part_len,
			str_uri_temp + 10, client_http_file->int_uri_part_len - 10
		);
		bol_permission_check = true;

	} else {
		str_canonical_start = canonical_full_start("/web_root/");
		SFINISH_CHECK(str_canonical_start != NULL, "canonical_full_start failed");
		SFINISH_SNCAT(
			client_http_file->str_uri_part, &client_http_file->int_uri_part_len,
			str_uri_temp, client_http_file->int_uri_part_len
		);
	}
	SFREE(str_uri_temp);

	SDEBUG("str_canonical_start: %s", str_canonical_start);
	SDEBUG("client_http_file->str_uri_part: %s", client_http_file->str_uri_part);

	str_uri_temp = client_http_file->str_uri_part;
	client_http_file->str_uri_part = NULL;
	if (strncmp(str_uri_temp, "download/", 9) == 0) {
		client_http_file->bol_download = true;
		SFINISH_SNCAT(
			client_http_file->str_uri_part, &client_http_file->int_uri_part_len,
			str_uri_temp + 8, client_http_file->int_uri_part_len - 8
		);
	} else if (strncmp(str_uri_temp, "/download/", 10) == 0) {
		client_http_file->bol_download = true;
		SFINISH_SNCAT(
			client_http_file->str_uri_part, &client_http_file->int_uri_part_len,
			str_uri_temp + 9, client_http_file->int_uri_part_len - 9
		);
	} else {
		SFINISH_SNCAT(
			client_http_file->str_uri_part, &client_http_file->int_uri_part_len,
			str_uri_temp, client_http_file->int_uri_part_len
		);
	}
	SFREE(str_uri_temp);

	// empty url, default to index.html in directories
	str_temp = canonical(str_canonical_start, client_http_file->str_uri_part, "read_dir");
	if (strlen(client_http_file->str_uri_part) <= 1 || str_temp != NULL) {
		if (*(client_http_file->str_uri_part + strlen(client_http_file->str_uri_part) - 1) == '/') {
			SFINISH_SNFCAT(
				client_http_file->str_uri_part, &client_http_file->int_uri_part_len,
				"index.html", (size_t)10
			);
		} else {
			SFINISH_SNFCAT(
				client_http_file->str_uri_part, &client_http_file->int_uri_part_len,
				"/index.html", (size_t)11
			);
		}
	}
	SFREE(str_global_error);
	SFREE(str_temp);

	SFREE(client_http_file->str_uri);
	SDEBUG("client_http_file->str_uri_part: %s", client_http_file->str_uri_part);
	client_http_file->str_uri = canonical(str_canonical_start, client_http_file->str_uri_part, "valid_path");
	SFINISH_CHECK(client_http_file->str_uri != NULL, "Bad file path");
	SFREE(str_canonical_start);
	SDEBUG("client_http_file->str_uri: %s", client_http_file->str_uri);

	if (bol_permission_check == true) {
		SINFO("client_http_file->str_uri_part: %s", client_http_file->str_uri_part);
		SFINISH_CHECK(permissions_check(EV_A, client_http_file->parent->conn, str_uri_for_permission_check,
			client_http_file, http_file_step15_envelope),
			"permissions_check() failed");
	} else {
#ifdef _WIN32
		SetLastError(0);
		client_http_file->h_file =
			CreateFileA(client_http_file->str_uri, GENERIC_READ, FILE_SHARE_READ, NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
		if (client_http_file->h_file == INVALID_HANDLE_VALUE) {
			int int_err = GetLastError();
			if (int_err == ERROR_FILE_NOT_FOUND || int_err == ERROR_PATH_NOT_FOUND) {
				SFREE(client->str_http_response);
				SERROR_NORESPONSE("CreateFileA failed!");
				SFREE(str_global_error);
                SFINISH_CHECK(build_http_response(
                        "404 Not Found"
                        , "The file you are requesting is not here.", strlen("The file you are requesting is not here.")
                        , "text/plain"
                        , NULL
                        , &client->str_http_response, &client->int_http_response_len
                    ), "build_http_response failed");
				bol_error_state = false;
				goto finish;
			}
			FormatMessageA(FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_IGNORE_INSERTS, NULL, int_err,
				MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT), (LPSTR)&strErrorText, 0, NULL);

			if (strErrorText != NULL) {
				SFINISH_ERROR("CreateFile failed: 0x%X (%s)", int_err, strErrorText);
			}
		}
#else
        client_http_file->int_file_fd = open(client_http_file->str_uri, O_RDONLY | O_NONBLOCK);
        if (client_http_file->int_file_fd == -1) {
            SFREE(client->str_http_response);
            SERROR_NORESPONSE("open failed! %d (%s)", errno, strerror(errno));
            SFREE(str_global_error);
            SFINISH_CHECK(build_http_response(
                    "404 Not Found"
                    , "The file you are requesting is not here.", strlen("The file you are requesting is not here.")
                    , "text/plain"
                    , NULL
                    , &client->str_http_response, &client->int_http_response_len
                ), "build_http_response failed");
            bol_error_state = false;
            goto finish;
        }
#endif
		SFINISH_SALLOC(client_copy_check, sizeof(struct sock_ev_client_copy_check));
		client_copy_check->client_request = (struct sock_ev_client_request *)client_http_file;

		ev_check_init(&client_copy_check->check, http_file_step2);
		ev_check_start(EV_A, &client_copy_check->check);
		ev_idle_init(&client_copy_check->idle, idle_cb);
		ev_idle_start(EV_A, &client_copy_check->idle);
	}
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
		http_file_free(client_http_file);
		client_http_file = NULL;

        SFINISH_CHECK(build_http_response(
                "500 Internal Server Error"
                , str_response, int_response_len
                , "text/plain"
                , NULL
                , &client->str_http_response, &client->int_http_response_len
            ), "build_http_response failed");
	}
    SFREE(str_response);
	if (client->str_http_response != NULL) {
		http_file_free(client_http_file);
		client_http_file = NULL;
		ev_io_stop(EV_A, &client->io);
		ev_io_init(&client->io, client_write_http_cb, client->io.fd, EV_WRITE);
        ev_io_start(EV_A, &client->io);
	}
}

bool http_file_step15_envelope(EV_P, void *cb_data, bool bol_group) {
	  // SDEBUG("http_file_step3");
	struct sock_ev_client_copy_check *client_copy_check = NULL;
	struct sock_ev_client_http_file *client_http_file = cb_data;
	struct sock_ev_client *client = client_http_file->parent;
	char *str_response = NULL;
	size_t int_response_len = 0;
#ifdef _WIN32
	LPTSTR strErrorText = NULL;
#endif

	SFINISH_CHECK(bol_group, "You don't have the necessary permissions for this folder.");

#ifdef _WIN32
	SetLastError(0);
	client_http_file->h_file =
		CreateFileA(client_http_file->str_uri, GENERIC_READ, FILE_SHARE_READ, NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
	if (client_http_file->h_file == INVALID_HANDLE_VALUE) {
		int int_err = GetLastError();
		if (int_err == ERROR_FILE_NOT_FOUND || int_err == ERROR_PATH_NOT_FOUND) {
			SFREE(str_response);
			SERROR_NORESPONSE("CreateFileA failed! (404)");
			SFREE(str_global_error);
            SFINISH_CHECK(build_http_response(
                    "404 Not Found"
                    , "The file you are requesting is not here.", strlen("The file you are requesting is not here.")
                    , "text/plain"
                    , NULL
                    , &client->str_http_response, &client->int_http_response_len
                ), "build_http_response failed");
			bol_error_state = false;
			goto finish;
		}
		FormatMessageA(FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_IGNORE_INSERTS, NULL, int_err,
			MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT), (LPSTR)&strErrorText, 0, NULL);

		if (strErrorText != NULL) {
			SFINISH_ERROR("CreateFile failed: 0x%X (%s)", int_err, strErrorText);
		}
	}
#else
	client_http_file->int_file_fd = open(client_http_file->str_uri, O_RDONLY | O_NONBLOCK);
	if (client_http_file->int_file_fd == -1) {
		SFREE(str_response);
		SERROR_NORESPONSE("open failed! %d (%s) (404)", errno, strerror(errno));
		SFREE(str_global_error);
        SFINISH_CHECK(build_http_response(
                "404 Not Found"
                , "The file you are requesting is not here.", strlen("The file you are requesting is not here.")
                , "text/plain"
                , NULL
                , &client->str_http_response, &client->int_http_response_len
            ), "build_http_response failed");
		bol_error_state = false;
		goto finish;
	}
#endif
	SFINISH_SALLOC(client_copy_check, sizeof(struct sock_ev_client_copy_check));
	client_copy_check->client_request = (struct sock_ev_client_request *)client_http_file;

	ev_check_init(&client_copy_check->check, http_file_step2);
	ev_check_start(EV_A, &client_copy_check->check);
	ev_idle_init(&client_copy_check->idle, idle_cb);
	ev_idle_start(EV_A, &client_copy_check->idle);

	bol_error_state = false;
finish:
#ifdef _WIN32
	if (strErrorText != NULL) {
		LocalFree(strErrorText);
		strErrorText = NULL;
	}
#endif

	if (bol_error_state) {
		bol_error_state = false;

        SFINISH_CHECK(build_http_response(
                !bol_group ? "403 Forbidden" : "500 Internal Server Error"
                , str_response, int_response_len
                , "text/plain"
                , NULL
                , &client->str_http_response, &client->int_http_response_len
            ), "build_http_response failed");
	}
    SFREE(str_response);
	if (client->str_http_response != NULL) {
		http_file_free(client_http_file);
		client_http_file = NULL;
		ev_io_stop(EV_A, &client->io);
		ev_io_init(&client->io, client_write_http_cb, client->io.fd, EV_WRITE);
        ev_io_start(EV_A, &client->io);
	}
	return true;
}

void http_file_step2(EV_P, ev_check *w, int revents) {
	if (revents != 0) {
	} // get rid of unused parameter warning
	SDEBUG("http_file_step2");
	struct tm *tm_change_stamp = NULL;
	struct tm *tm_if_modified_by = NULL;
	struct sock_ev_client_copy_check *client_copy_check = (struct sock_ev_client_copy_check *)w;
	struct sock_ev_client_http_file *client_http_file = (struct sock_ev_client_http_file *)(client_copy_check->client_request);
	struct sock_ev_client *client = client_http_file->parent;
	char *str_response = NULL;
	size_t int_response_len = 0;
	bool bol_modified = true;
    DArray *darr_headers = NULL;

	struct stat *statdata = NULL;
	SFINISH_SALLOC(statdata, sizeof(struct stat));
	stat(client_http_file->str_uri, statdata);
	SDEBUG("client_http_file->str_uri: %s", client_http_file->str_uri);

#ifdef _WIN32
	client_http_file->int_read_len = GetFileSize(client_http_file->h_file, NULL);
#else
	client_http_file->int_read_len = (ssize_t)lseek(client_http_file->int_file_fd, 0, SEEK_END);
	SFINISH_CHECK(client_http_file->int_read_len != -1, "lseek(0, SEEK_END) failed");
	SFINISH_CHECK(lseek(client_http_file->int_file_fd, 0, SEEK_SET) != -1, "lseek(0, SEEK_SET) failed");
#endif
client_http_file->int_content_len = (size_t)client_http_file->int_read_len;

	SFINISH_SALLOC(tm_change_stamp, sizeof(struct tm));
#ifdef _WIN32
	SFINISH_CHECK((errno = gmtime_s(tm_change_stamp, &(statdata->st_mtime))) == 0, "gmtime() failed");
#else
	SFINISH_CHECK(gmtime_r(&(statdata->st_mtime), tm_change_stamp) != NULL, "gmtime() failed");
#endif
	tm_change_stamp->tm_isdst = 0;

	SFINISH_SALLOC(client_http_file->str_last_modified, 101)
	SFINISH_CHECK(strftime(client_http_file->str_last_modified, 100, str_date_format, tm_change_stamp) != 0, "strftime() failed");

	if (client->str_if_modified_since != NULL) {
		bol_modified = strncmp(client_http_file->str_last_modified, client->str_if_modified_since, strlen(client->str_if_modified_since)) != 0;
	} else {
		SFREE(str_global_error);
	}

	SFINISH_SALLOC(client_http_file->str_etag, 100);
#ifdef st_mtime
#ifdef __linux__
	sprintf(client_http_file->str_etag, "%li.%li", statdata->st_ctim.tv_sec, statdata->st_ctim.tv_nsec);
#else
	sprintf(client_http_file->str_etag, "%li.%li", statdata->st_mtimespec.tv_sec, statdata->st_mtimespec.tv_nsec);
#endif
#else
	sprintf(client_http_file->str_etag, "%li", (long)statdata->st_mtime);
#endif

	if (/*strncmp(str_content_type, "text/html", 9) != 0 && */!bol_modified) {
        darr_headers = DArray_from_strings(
            "Etag", client_http_file->str_etag
            , "Last-Modified", client_http_file->str_last_modified
        );
        SFINISH_CHECK(darr_headers != NULL, "DArray_from_strings failed");
        SFINISH_CHECK(build_http_response(
                "304 Not Modified"
                , "", 0
                , NULL
                , darr_headers
                , &client->str_http_response, &client->int_http_response_len
            ), "build_http_response failed");
	} else {
		client_http_file->int_read = 0;
		client_http_file->int_response_header_len = client_http_file->int_response_len;
		client_http_file->int_response_len =
			client_http_file->int_response_header_len + (size_t)client_http_file->int_read_len;
		SFINISH_SALLOC(client_http_file->str_content, client_http_file->int_content_len + 1);
		memset(client_http_file->str_content, 0, client_http_file->int_content_len + 1);

		ev_check_stop(EV_A, &client_copy_check->check);
		ev_check_init(&client_copy_check->check, http_file_step3);
		ev_check_start(EV_A, &client_copy_check->check);
	}

	bol_error_state = false;
finish:
	SFREE(statdata);
	SFREE(tm_if_modified_by);
	SFREE(tm_change_stamp);
    if (darr_headers != NULL) {
        DArray_clear_destroy(darr_headers);
        darr_headers = NULL;
    }
	if (bol_error_state) {
		bol_error_state = false;

        SFINISH_CHECK(build_http_response(
                "500 Internal Server Error"
                , str_response, int_response_len
                , "text/plain"
                , NULL
                , &client->str_http_response, &client->int_http_response_len
            ), "build_http_response failed");
	}
    SFREE(str_response);
	if (client->str_http_response != NULL) {
		ev_check_stop(EV_A, &client_copy_check->check);
		ev_idle_stop(EV_A, &client_copy_check->idle);
		SFREE(client_copy_check);

		http_file_free(client_http_file);
		client_http_file = NULL;
		ev_io_stop(EV_A, &client->io);
		ev_io_init(&client->io, client_write_http_cb, client->io.fd, EV_WRITE);
        ev_io_start(EV_A, &client->io);
	}
}

void http_file_step3(EV_P, ev_check *w, int revents) {
	if (revents != 0) {
	} // get rid of unused parameter warning
	// SDEBUG("http_file_step3");
	struct sock_ev_client_copy_check *client_copy_check = (struct sock_ev_client_copy_check *)w;
	struct sock_ev_client_http_file *client_http_file = (struct sock_ev_client_http_file *)(client_copy_check->client_request);
	struct sock_ev_client *client = client_http_file->parent;
	char *str_response = NULL;
	size_t int_response_len = 0;
    DArray *darr_headers = NULL;
	char *str_content_type = NULL;
	char str_content_len[51];
#ifdef _WIN32
	LPTSTR strErrorText = NULL;
#endif

	SDEBUG("client_http_file->int_response_header_len: %d", client_http_file->int_response_header_len);
	SDEBUG("client_http_file->int_read: %d", client_http_file->int_read);
	SDEBUG("client_http_file->int_read_len: %d", client_http_file->int_read_len);
	if (client_http_file->int_read == client_http_file->int_read_len) {
		ev_check_stop(EV_A, &client_copy_check->check);
		ev_idle_stop(EV_A, &client_copy_check->idle);
		SFREE(client_copy_check);
        
        snprintf(str_content_len, 50, "%zu", client_http_file->int_content_len);
        if (client_http_file->bol_download) {
            darr_headers = DArray_from_strings(
                "Etag", client_http_file->str_etag
                , "Last-Modified", client_http_file->str_last_modified
                , "Content-Length", str_content_len
                , "Content-Disposition", "attachment"
                , "Cache-Control", "max-age=0, must-revalidate"
            );
        } else {
            darr_headers = DArray_from_strings(
                "Etag", client_http_file->str_etag
                , "Content-Length", str_content_len
                , "Last-Modified", client_http_file->str_last_modified
				, "Cache-Control", "max-age=0, must-revalidate"
            );
        }
        SFINISH_CHECK(darr_headers != NULL, "DArray_from_strings failed");

        str_content_type = contenttype(client_http_file->str_uri_part);
        SFINISH_CHECK(str_content_type, "contenttype failed");
		SINFO("str_content_type: %s", str_content_type);

        SFINISH_CHECK(build_http_response(
                "200 OK"
                , "", 0
                , str_content_type
                , darr_headers
                , &client->str_http_header, &client->int_http_header_len
            ), "build_http_response failed");
        client->str_http_response = client_http_file->str_content;
        client->int_http_response_len = client_http_file->int_content_len;
        client_http_file->str_content = NULL;

        SDEBUG("client->str_http_header: %s", client->str_http_header);
        SDEBUG("client->str_http_response: %s", client->str_http_response);
		ev_io_init(&client->io, client_write_http_headers_cb, client->io.fd, EV_WRITE);
		ev_io_start(EV_A, &client->io);

#ifdef _WIN32
		CloseHandle(client_http_file->h_file);
		client_http_file->h_file = INVALID_HANDLE_VALUE;
#else
		close(client_http_file->int_file_fd);
		client_http_file->int_file_fd = -1;
#endif
        http_file_free(client_http_file);
        client_http_file = NULL;

	} else {
#ifdef _WIN32
		DWORD int_read = 0;
		BOOL bol_result = ReadFile(client_http_file->h_file,
			client_http_file->str_content + client_http_file->int_read,
			(DWORD)(client_http_file->int_read_len - client_http_file->int_read), &int_read, NULL);
		if (bol_result == FALSE) {
			int int_err = GetLastError();
			FormatMessageA(FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_IGNORE_INSERTS, NULL,
				int_err, MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT), (LPSTR)&strErrorText, 0, NULL);

			if (strErrorText != NULL) {
				SFINISH("ReadFile failed: 0x%X (%s)", int_err, strErrorText);
			}
		}
#else
		lseek(client_http_file->int_file_fd, (off_t)client_http_file->int_read, SEEK_SET);
		ssize_t int_read = read(client_http_file->int_file_fd,
			client_http_file->str_content + (off_t)client_http_file->int_read,
			(size_t)(client_http_file->int_read_len - client_http_file->int_read));
		// SDEBUG("int_read: %d", int_read);
		// SDEBUG("client->str_response +
		// client_http_file->int_response_header_len +
		// client_http_file->int_read:\n>%s<",
		// client->str_response + client_http_file->int_response_header_len +
		// client_http_file->int_read);
		SFINISH_CHECK(int_read > 0, "Read failed: %d (%s)", errno, strerror(errno));
#endif
		client_http_file->int_read += int_read;
	}

	bol_error_state = false;
finish:
    if (darr_headers != NULL) {
        DArray_clear_destroy(darr_headers);
        darr_headers = NULL;
    }
	if (bol_error_state) {
		bol_error_state = false;

        SFREE(client->str_http_header);
        SFINISH_CHECK(build_http_response(
                "500 Internal Server Error"
                , str_response, int_response_len
                , "text/plain"
                , NULL
                , &client->str_http_response, &client->int_http_response_len
            ), "build_http_response failed");
	}
    SFREE(str_response);
    // if client->str_http_header is non-empty, we are already taken care of
	if (client->str_http_response != NULL && client->str_http_header == NULL) {
        if (client_copy_check != NULL) {
            ev_check_stop(EV_A, &client_copy_check->check);
            ev_idle_stop(EV_A, &client_copy_check->idle);
        }
		SFREE(client_copy_check);

        if (client_http_file != NULL) {
		    http_file_free(client_http_file);
        }
		client_http_file = NULL;
		ev_io_stop(EV_A, &client->io);
		ev_io_init(&client->io, client_write_http_cb, client->io.fd, EV_WRITE);
        ev_io_start(EV_A, &client->io);
	}
}

void http_file_free(struct sock_ev_client_http_file *client_http_file) {
	EV_P = global_loop;
	if (client_http_file != NULL) {
		if (client_http_file->io.fd != INVALID_SOCKET) {
			SDEBUG("test");
			ev_io_stop(EV_A, &client_http_file->io);
		}
#ifdef _WIN32
		if (client_http_file->h_file != INVALID_HANDLE_VALUE) {
			CloseHandle(client_http_file->h_file);
			client_http_file->h_file = INVALID_HANDLE_VALUE;
		}
#else
		if (client_http_file->int_file_fd > -1) {
			close(client_http_file->int_file_fd);
			client_http_file->int_file_fd = -1;
		}
#endif
		SFREE(client_http_file->str_etag);
		SFREE(client_http_file->str_last_modified);
		SFREE(client_http_file->str_content);
		SFREE(client_http_file->str_uri_part);
		SFREE(client_http_file->str_uri);
		SFREE(client_http_file);
	}
}
