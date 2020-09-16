#include "util_request.h"

char *query(char *str_request, size_t int_request_length, size_t *int_query_length) {
	char *str_return = NULL;
	SDEFINE_VAR_ALL(str_uri);

	// find the form_data by request type
	if (strncmp(str_request, "GET ", 4) == 0) {
		size_t int_uri_length = 0;
		str_uri = str_uri_path(str_request, int_request_length, &int_uri_length);
		SERROR_CHECK(str_uri != NULL, "str_uri_path failed");

		char *ptr_query = bstrstr(str_uri, int_uri_length, "?", 1);
		if (ptr_query != NULL) {
			*int_query_length = (int_uri_length - (size_t)((ptr_query + 1) - str_uri));
			char *ptr_temp = bstrstr(ptr_query + 1, *int_query_length, "#", 1);
			if (ptr_temp != NULL) {
				*int_query_length -= (size_t)(ptr_temp - (ptr_query + 1));
			}
			SERROR_SALLOC(str_return, *int_query_length + 1);
			memcpy(str_return, ptr_query + 1, *int_query_length);
			str_return[*int_query_length] = 0;
		}

	} else {
		// rewritten to work with safari, still doesn't work
		char *temp1 = bstrstr(str_request, int_request_length, "\015\012\015\012", 4);
		char *temp2 = bstrstr(str_request, int_request_length, "\012\012", 2);
		SDEBUG("temp1: %d", temp1);
		SDEBUG("temp2: %d", temp2);
		char *ptr_query = NULL;
		if (temp1 != 0 && temp2 == 0) {
			ptr_query = temp1 + 4;
		} else if (temp1 == 0 && temp2 != 0) {
			ptr_query = temp2 + 2;
		} else {
			if (temp1 < temp2) {
				ptr_query = temp1 + 4;
			} else {
				ptr_query = temp2 + 2;
			}
		}
		if (ptr_query != NULL) {
			*int_query_length = int_request_length - (size_t)(ptr_query - str_request);
			SERROR_SALLOC(str_return, *int_query_length + 1);
			memcpy(str_return, ptr_query, *int_query_length);
			str_return[*int_query_length] = 0;
		}
	}

	// return just the form_data
	SFREE_ALL();
	return str_return;
error:
	SFREE_ALL();
	return NULL;
}

char *get_cookie(char *str_all_cookie, size_t int_all_cookie_len, char *str_cookie_name, size_t *int_cookie_value_len) {
	char *str_return = NULL;
	char *ptr_cookie_end_semi = NULL;
	size_t int_cookie_end_semi = 0;
	size_t int_full_cookie_len = 0;
	SDEFINE_VAR_ALL(str_full_cookie);

	SERROR_CHECK(str_all_cookie != NULL, "cookie is required");

	SDEBUG("str_cookie 1");

	SERROR_SNCAT(str_full_cookie, &int_full_cookie_len,
		str_cookie_name, strlen(str_cookie_name),
		"=", (size_t)1);

	SDEBUG("str_cookie 2");

	// find the cookie
	SDEBUG("str_all_cookie: >%s<", str_all_cookie);
	char *ptr_cookie = bstrstr(str_all_cookie, int_all_cookie_len, str_full_cookie, int_full_cookie_len);
	SWARN_CHECK(ptr_cookie != NULL, "no cookie found");
	ptr_cookie = ptr_cookie + int_full_cookie_len; // advance cursor past cookie=
	SFREE(str_full_cookie);

	SDEBUG("str_cookie 3");

	// get cookie length
	ptr_cookie_end_semi = bstrstr(ptr_cookie, int_all_cookie_len - (ptr_cookie - str_all_cookie), ";", (size_t)1);
	int_cookie_end_semi = (size_t)(ptr_cookie_end_semi - ptr_cookie);
	*int_cookie_value_len = int_all_cookie_len - (size_t)(ptr_cookie - str_all_cookie);
	*int_cookie_value_len = ptr_cookie_end_semi != NULL && int_cookie_end_semi < (*int_cookie_value_len) ? int_cookie_end_semi : (*int_cookie_value_len);

	SDEBUG("str_cookie 4 *int_cookie_value_len: %d", *int_cookie_value_len);

	// return just the cookie
	SERROR_SALLOC(str_return, (*int_cookie_value_len) + 1);
	memcpy(str_return, ptr_cookie, *int_cookie_value_len);
	str_return[*int_cookie_value_len] = '\0';
	SDEBUG("str_return: %s", str_return);
	SDEBUG("*int_cookie_value_len: %d", *int_cookie_value_len);

	SDEBUG("str_cookie 5");

	SFREE_PWORD_ALL();
	return str_return;
error:
	SFREE_PWORD_ALL();
	SFREE_PWORD(str_return);
	return NULL;
}

char *str_uri_path(char *str_request, size_t int_request_length, size_t *int_uri_length) {
	char *str_return = NULL;
	char *ptr_uri = NULL;
	char *ptr_uri_end = NULL;

	// if the request is not long enough to have a URI then abort
	SERROR_CHECK(int_request_length >= 5, "request too short to parse;");

	// find uri start character
	//if (strncmp(str_request, "GET ", 4) == 0) {
	//	ptr_uri = str_request + 4;
	//} else if (strncmp(str_request, "HEAD ", 5) == 0 || strncmp(str_request, "POST ", 5) == 0) {
	//	ptr_uri = str_request + 5;
	//} else {
	//	char str_temp[11] = {0};
	//	memcpy(str_temp, str_request, 10);
	//	SERROR("unknown request type, first ten chars of request: %s", str_temp);
	//}
	// I'm putting this into http_file, that's the only place we need it. - Nunzio on 2019-05-40 at 5:42 PM
	ptr_uri = strchr(str_request, ' ') + 1;

	// return just the Request-URI
	ptr_uri_end = bstrstr(ptr_uri, (int_request_length - (size_t)(ptr_uri - str_request)), " ", 1);
	*int_uri_length = (size_t)(ptr_uri_end - ptr_uri);

	SDEBUG("*int_uri_length: %i", *int_uri_length);

	SERROR_SALLOC(str_return, *int_uri_length + 1);
	memcpy(str_return, ptr_uri, *int_uri_length);
	str_return[*int_uri_length] = '\0';
	return str_return;
error:
	SFREE(str_return);
	return NULL;
}

bool check_referer(char *_str_referer, size_t _int_referer_len, char *_str_referer_list) {
	// Use this for testing:
	// fprintf(stderr, "check_referer(\"localhost\", 9, \"localhost\"): %i\012", check_referer("localhost", 9, strdup("localhost")));
	// fprintf(stderr, "check_referer(\"localhost\", 9, \"loCAlhost\"): %i\012", check_referer("localhost", 9, strdup("loCAlhost")));
	// fprintf(stderr, "check_referer(\"localhost\", 9, \"*\"): %i\012", check_referer("localhost", 9, strdup("*")));
	// fprintf(stderr, "check_referer(\"localhost\", 9, \"test,asdf\"): %i\012", check_referer("localhost", 9, strdup("test,asdf")));
	// fprintf(stderr, "check_referer(\"test\", 4, \"test,asdf\"): %i\012", check_referer("test", 9, strdup("test,asdf")));
	// fprintf(stderr, "check_referer(\"asdfa\", 5, \"test,asdf\"): %i\012", check_referer("asdfa", 9, strdup("test,asdf")));
	// fprintf(stderr, "check_referer(\"asdf\", 4, \"testa,asdf\"): %i\012", check_referer("asdf", 9, strdup("testa,asdf")));
	// fprintf(stderr, "check_referer(\"te.stasdf\", 9, \"test,*.stasdf\"): %i\012", check_referer("te.stasdf", 9, strdup("test,*.stasdf")));
	// fprintf(stderr, "check_referer(\"https://te.stasdf/test\", 23, \"test,*.stasdf\"): %i\012", check_referer("https://te.stasdf/test", 23, strdup("test,*.stasdf")));
	// fprintf(stderr, "check_referer(\"https://tea.stasdf/test\", 24, \"test,*.stasdf\"): %i\012", check_referer("https://tea.stasdf/test", 24, strdup("test,*.stasdf")));
	// fprintf(stderr, "check_referer(\"https://te.satasdf/test\", 24, \"test,*.stasdf\"): %i\012", check_referer("https://te.satasdf/test", 24, strdup("test,*.stasdf")));

	char *str_referer = NULL;
	char *str_referer_list = NULL;
	char *ptr_referer_start = NULL;
	char *ptr_referer_end = NULL;
	char *ptr_tok = NULL;
	char *ptr_tok_cmp = NULL;
	char *ptr_cmp = NULL;
	size_t int_cmp_len = 0;
	size_t int_referer_len = 0;
	if (strncmp(_str_referer_list, "*", 2) == 0) {
		return true;
	}

	if (strncmp(_str_referer, "http", 4) == 0) {
		ptr_referer_start = strstr(_str_referer, "://") + 3;
	} else {
		ptr_referer_start = _str_referer;
	}
	SDEBUG("ptr_referer_start: %s", ptr_referer_start);
	ptr_referer_end = strstr(ptr_referer_start, "/");
	if (ptr_referer_end != NULL) {
		int_referer_len = (ptr_referer_end - ptr_referer_start);
	} else {
        int_referer_len = _int_referer_len - (ptr_referer_start - _str_referer);
    }
	SDEBUG("ptr_referer_end: %s", ptr_referer_end);
	SDEBUG("int_referer_len: %d", int_referer_len);
	SDEBUG("_int_referer_len: %d", _int_referer_len);
	SDEBUG("ptr_referer_end - ptr_referer_start: %d", ptr_referer_end - ptr_referer_start);
	SERROR_SNCAT(
		str_referer, &int_referer_len,
		ptr_referer_start, int_referer_len
	);
	SDEBUG("str_referer: %s", str_referer);
	SDEBUG("str_referer: %s", str_referer);

	// strtok is not thread-safe, but we aren't using multiple threads
	// if we end up using threads at some point, we will need to write
	// a thread-safe version of this loop
    SERROR_SNCAT(str_referer_list, &int_cmp_len, _str_referer_list, strlen(_str_referer_list), ",", (size_t)1);
	ptr_tok = strtok(str_referer_list, ",");
	while (ptr_tok != NULL) {
		SDEBUG("ptr_tok: %s", ptr_tok);
		if (ptr_tok[0] == '*') {
			ptr_tok_cmp = ptr_tok + 1;
			ptr_cmp = str_referer + int_referer_len - strlen(ptr_tok_cmp);
			int_cmp_len = int_referer_len - strlen(ptr_tok_cmp);
		} else {
			ptr_tok_cmp = ptr_tok;
			ptr_cmp = str_referer;
			int_cmp_len = int_referer_len;
		}
		SDEBUG("ptr_cmp: %s", ptr_cmp);
		SDEBUG("ptr_tok_cmp: %s", ptr_tok_cmp);
		if (strncasecmp(ptr_cmp, ptr_tok_cmp, int_cmp_len) == 0) {
			return true;
		}

		ptr_tok = strtok(NULL, ",");
	}

    SFREE(str_referer_list);
	return false;
error:
    SFREE(str_referer_list);
	return false;
}

sun_upload *get_sun_upload(struct sock_ev_client *client) {
	sun_upload *sun_return = NULL;
	//SDEFINE_VAR_ALL(str_name);
	SERROR_SALLOC(sun_return, sizeof(sun_upload));
	char *ptr_request = NULL;
	char *ptr_request_end = client->str_request + client->int_request_len;
	char *ptr_name = NULL;
	char *ptr_file_content = NULL;
	char *ptr_file_content_end = NULL;
	char *ptr_name_end = NULL;
	size_t int_temp = 0;
	size_t int_next_line = 0;
	size_t int_name_len = 0;

	SERROR_CHECK(client->str_boundary != NULL, "boundary is null");

	// get first content chunk
	ptr_request = bstrstr(
		client->str_request + client->int_form_data_start, client->int_request_len - client->int_form_data_start
		, client->str_boundary, client->int_boundary_len
	);
	SERROR_CHECK(ptr_request != NULL, "couldn't find boundary in string");
	int_temp = find_next_line(ptr_request, ptr_request_end - ptr_request);
	SERROR_CHECK(int_temp > 0, "malformed upload request");

	// is it the file name?
	ptr_name = bstrstr(
		ptr_request, ptr_request_end - ptr_request
		, "name=\"", 6
	);
	SERROR_CHECK(ptr_name != NULL, "malformed upload request");
	ptr_name = ptr_name + 6;

	ptr_name_end = bstrstr(
		ptr_name, ptr_request_end - ptr_name
		, "\"", 1
	);
	SERROR_CHECK(ptr_name_end != NULL, "malformed upload request");

	if (strncmp(ptr_name, "file_name", 9) == 0) {
		// grab file name
		int_next_line = find_next_line(ptr_name, ptr_request_end - ptr_name);
		ptr_file_content = ptr_name;
		while (int_next_line > 0) {
			ptr_name = ptr_name + int_next_line;
			if (int_next_line < 3) {
				// this is the name length
				int_next_line = find_next_line(ptr_name, ptr_request_end - ptr_name);
				while (ptr_name[int_next_line - 1] == '\015' || ptr_name[int_next_line - 1] == '\012') {
					int_next_line = int_next_line - 1;
				}
				SERROR_SNCAT(sun_return->str_name, &sun_return->int_name_len, ptr_name, int_next_line);
				SDEBUG("sun_return->int_name_len: %d", sun_return->int_name_len);
				SDEBUG("sun_return->str_name: %s", sun_return->str_name);

				break;
			}
			int_next_line = find_next_line(ptr_name, ptr_request_end - ptr_name);
		}

		// get second chunk, make sure it's the content, then store the pointer/length
		ptr_request = bstrstr(
			client->str_request, client->int_request_len
			, client->str_boundary, client->int_boundary_len
		);
		SERROR_CHECK(ptr_request_end != NULL, "malformed upload request");
		SDEBUG("ptr_request: %s", ptr_request);
		ptr_request = ptr_request + 1;
		ptr_request = bstrstr(
			ptr_request, client->int_request_len - (ptr_request - client->str_request)
			, client->str_boundary, client->int_boundary_len
		);
		SERROR_CHECK(ptr_request_end != NULL, "malformed upload request");
		SDEBUG("ptr_request: %s", ptr_request);
		ptr_request_end = brstrstr(
			client->str_request, client->int_request_len
			, client->str_boundary, client->int_boundary_len
		);
		SERROR_CHECK(ptr_request != NULL, "malformed upload request");
		SDEBUG("ptr_request_end: %s", ptr_request_end);
		int_temp = find_next_line(ptr_request, ptr_request_end - ptr_request);
		SERROR_CHECK(int_temp > 0, "malformed upload request");

		// is it the file content?
		ptr_name = bstrstr(
			ptr_request, ptr_request_end - ptr_request
			, "name=\"", 6
		);
		SERROR_CHECK(ptr_name != NULL, "malformed upload request");
		SDEBUG("ptr_name: %s", ptr_name);
		ptr_name = ptr_name + 6;

		ptr_name_end = bstrstr(
			ptr_name, ptr_request_end - ptr_name
			, "\"", 1
		);
		SERROR_CHECK(ptr_name_end != NULL, "malformed upload request");
		SDEBUG("ptr_name_end: %s", ptr_name_end);

		SERROR_CHECK(strncmp(ptr_name, "file_content", 12) == 0, "malformed upload request");
		ptr_file_content = ptr_name;
		int_next_line = find_next_line(ptr_file_content, ptr_request_end - ptr_file_content);
		while (int_next_line > 3) {
			ptr_file_content = ptr_file_content + int_next_line;
			int_next_line = find_next_line(ptr_file_content, ptr_request_end - ptr_file_content);
		}
		int_next_line = find_next_line(ptr_file_content, ptr_request_end - ptr_file_content);
		ptr_file_content = ptr_file_content + int_next_line;
		SDEBUG("ptr_file_content: %s", ptr_file_content);
		// we're here
		sun_return->ptr_file_content = ptr_file_content;

		ptr_file_content_end = brstrstr(
			client->str_request, client->int_request_len,
			client->str_boundary, client->int_boundary_len
		);
		SERROR_CHECK(ptr_file_content_end != NULL, "malformed upload request");

		ptr_file_content_end = ptr_file_content_end - 1;
		while (*ptr_file_content_end == '\015' || *ptr_file_content_end == '\012') {
			ptr_file_content_end = ptr_file_content_end - 1;
		}

		sun_return->int_file_content_len = ptr_file_content_end - ptr_file_content;
		SDEBUG("ptr_file_content_end: %s", ptr_file_content_end);
		SDEBUG("sun_return->int_file_content_len: %d", sun_return->int_file_content_len);

	} else {
		// make sure its the content, then store the pointer/length
		SERROR_CHECK(strncmp(ptr_name, "file_content", 12) == 0, "malformed upload request");
		ptr_file_content = ptr_name;
		int_next_line = find_next_line(ptr_file_content, ptr_request_end - ptr_file_content);
		while (int_next_line > 3) {
			ptr_file_content = ptr_file_content + int_next_line;
			int_next_line = find_next_line(ptr_file_content, ptr_request_end - ptr_file_content);
		}
		int_next_line = find_next_line(ptr_file_content, ptr_request_end - ptr_file_content);
		ptr_file_content = ptr_file_content + int_next_line;
		// we're here
		sun_return->ptr_file_content = ptr_file_content;

		ptr_file_content_end = brstrstr(
			client->str_request, client->int_request_len,
			client->str_boundary, client->int_boundary_len
		);
		SERROR_CHECK(ptr_file_content_end != NULL, "malformed upload request");

		ptr_file_content_end = brstrstr(
			client->str_request, ptr_file_content_end - client->str_request,
			client->str_boundary, client->int_boundary_len
		);
		SERROR_CHECK(ptr_file_content_end != NULL, "malformed upload request");

		ptr_file_content_end = ptr_file_content_end - 1;
		while (*ptr_file_content_end == '\015' || *ptr_file_content_end == '\012') {
			ptr_file_content_end = ptr_file_content_end - 1;
		}

		sun_return->int_file_content_len = ptr_file_content_end - ptr_file_content;
		SDEBUG("ptr_file_content_end: %s", ptr_file_content_end);
		SDEBUG("sun_return->int_file_content_len: %d", sun_return->int_file_content_len);

		// search from end for file name
		// get last content chunk
		ptr_request_end = brstrstr(
			client->str_request, client->int_request_len
			, client->str_boundary, client->int_boundary_len
		);
		SERROR_CHECK(ptr_request_end != NULL, "malformed upload request");
		ptr_request = brstrstr(
			client->str_request, ptr_request_end - client->str_request
			, client->str_boundary, client->int_boundary_len
		);
		SERROR_CHECK(ptr_request != NULL, "malformed upload request");
		int_temp = find_next_line(ptr_request, ptr_request_end - ptr_request);
		SERROR_CHECK(int_temp > 0, "malformed upload request");

		// is it the file name?
		ptr_name = bstrstr(
			ptr_request, ptr_request_end - ptr_request
			, "name=\"", 6
		);
		SERROR_CHECK(ptr_name != NULL, "malformed upload request");
		ptr_name = ptr_name + 6;

		ptr_name_end = bstrstr(
			ptr_name, ptr_request_end - ptr_name
			, "\"", 1
		);
		SERROR_CHECK(ptr_name_end != NULL, "malformed upload request");

		if (strncmp(ptr_name, "file_name", 9) == 0) {
			// grab file name
			int_next_line = find_next_line(ptr_name, ptr_request_end - ptr_name);
			ptr_file_content = ptr_name;
			while (int_next_line > 0) {
				ptr_name = ptr_name + int_next_line;
				if (int_next_line < 3) {
					// this is the name length
					int_next_line = find_next_line(ptr_name, ptr_request_end - ptr_name);
					while (ptr_name[int_next_line - 1] == '\015' || ptr_name[int_next_line - 1] == '\012') {
						int_next_line = int_next_line - 1;
					}
					SERROR_SNCAT(sun_return->str_name, &sun_return->int_name_len, ptr_name, int_next_line);
					SDEBUG("sun_return->int_name_len: %d", sun_return->int_name_len);
					SDEBUG("sun_return->str_name: %s", sun_return->str_name);

					break;
				}
				int_next_line = find_next_line(ptr_name, ptr_request_end - ptr_name);
			}
		}
	}

	//SERROR_SALLOC(sun_return, sizeof(sun_upload));
    //sun_return->str_name = str_name;
    //str_name = NULL;
    //sun_return->int_name_len = int_name_len;
    //sun_return->ptr_file_content = ptr_file_content;
    //sun_return->int_file_content_len = int_file_content_len;


	//SFREE_ALL();
	return sun_return;
error:
	//SFREE_ALL();
	SFREE(sun_return);
	return NULL;
}

void free_sun_upload(sun_upload *sun_current_upload) {
	SFREE(sun_current_upload->str_name);
	SFREE(sun_current_upload);
}
