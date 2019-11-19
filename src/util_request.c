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

char *request_header(char *str_request, size_t _int_request_len, char *str_header_name, size_t *int_header_value_len) {
	char *str_return = NULL;
	size_t int_request_len = _int_request_len;
    size_t int_header_name_len = strlen(str_header_name);
	char *ptr_end = bstrstr(str_request, int_request_len, "\015\012\015\012", 4);
	if (ptr_end == NULL) { ptr_end = bstrstr(str_request, int_request_len, "\015\015", 2); }
	if (ptr_end == NULL) { ptr_end = bstrstr(str_request, int_request_len, "\012\012", 2); }
	SFREE(str_global_error);
	if (ptr_end == NULL) { return NULL; }

	int_request_len = (ptr_end + 1) - str_request;
	SDEBUG("str_request: %s", str_request);
	SDEBUG("ptr_end: %s", ptr_end);
	SDEBUG("int_request_len: %d", int_request_len);

	// Find the header in the request
	char *ptr_header = bstrstri(str_request, int_request_len, str_header_name, int_header_name_len);

	SWARN_CHECK(ptr_header != NULL, "bstrstr failed");
    ptr_header += int_header_name_len;

	while (*ptr_header != ':' && !isspace(*ptr_header)) {
        ptr_header = bstrstri(str_request, (int_request_len - (size_t)(ptr_header - str_request)), str_header_name, int_header_name_len);

		SWARN_CHECK(ptr_header != NULL, "bstrstr failed");
        ptr_header += int_header_name_len;
    }

	ptr_header = strchr(ptr_header, ':');
	SWARN_CHECK(ptr_header != NULL, "strchr failed");
	ptr_header += 1;
	while (isspace(*ptr_header)) {
		ptr_header += 1;
	}
	while (ptr_header[*int_header_value_len] != '\015' && ptr_header[*int_header_value_len] != '\012') {
		*int_header_value_len += 1;
	}

	SERROR_SALLOC(str_return, *int_header_value_len + 1);
	memcpy(str_return, ptr_header, *int_header_value_len);
	str_return[*int_header_value_len] = '\0';
	SDEBUG("str_return: %s", str_return);
	SDEBUG("*int_header_value_len: %d", *int_header_value_len);

	return str_return;
error:

	SFREE(str_return);
	return NULL;
}

char *str_cookie(char *str_request, size_t int_request_len, char *str_cookie_name, size_t *int_cookie_value_len) {
	char *str_return = NULL;
	char *ptr_cookie_end_semi = NULL;
	size_t int_cookie_end_semi = 0;
	size_t int_full_cookie_len = 0;
	SDEFINE_VAR_ALL(str_cookie, str_full_cookie);

	SDEBUG("str_cookie 1");

	SERROR_SNCAT(str_full_cookie, &int_full_cookie_len,
		str_cookie_name, strlen(str_cookie_name),
		"=", (size_t)1);

	SDEBUG("str_cookie 2");

	// find the cookie
	str_cookie = request_header(str_request, int_request_len, "Cookie", int_cookie_value_len);
	SWARN_CHECK(str_cookie != NULL, "no cookie found");
	char *ptr_cookie = bstrstr(str_cookie, *int_cookie_value_len, str_full_cookie, int_full_cookie_len);
	SWARN_CHECK(ptr_cookie != NULL, "no cookie found");
	ptr_cookie = ptr_cookie + int_full_cookie_len; // advance cursor past cookie=
	SFREE(str_full_cookie);

	SDEBUG("str_cookie 3");

	// get cookie length
	ptr_cookie_end_semi = bstrstr(ptr_cookie, (*int_cookie_value_len) - (size_t)(ptr_cookie - str_cookie), ";", (size_t)1);
	int_cookie_end_semi = (size_t)(ptr_cookie_end_semi - ptr_cookie);
	*int_cookie_value_len = (*int_cookie_value_len) - (size_t)(ptr_cookie - str_cookie);
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

bool check_referer(char *_str_referer, size_t _int_referer_len, char *str_referer_list) {
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
	char *ptr_referer_end = NULL;
	char *ptr_tok = NULL;
	char *ptr_tok_cmp = NULL;
	char *ptr_cmp = NULL;
	size_t int_cmp_len = 0;
	size_t int_referer_len = 0;
	if (strncmp(str_referer_list, "*", 2) == 0) {
		return true;
	}

	if (strncmp(_str_referer, "http", 4) == 0) {
		ptr_referer_end = strstr(_str_referer, "://") + 3;
	} else {
		ptr_referer_end = _str_referer;
	}
	SDEBUG("ptr_referer_end: %s", ptr_referer_end);
	SERROR_SNCAT(
		str_referer, &int_referer_len,
		ptr_referer_end, _int_referer_len - (ptr_referer_end - _str_referer)
	);
	SDEBUG("str_referer: %s", str_referer);
	ptr_referer_end = strstr(str_referer, "/");
	if (ptr_referer_end != NULL) {
		*ptr_referer_end = 0;
		int_referer_len = (ptr_referer_end - str_referer);
	}
	SDEBUG("str_referer: %s", str_referer);

	// strtok is not thread-safe, but we aren't using multiple threads
	// if we end up using threads at some point, we will need to write
	// a thread-safe version of this loop
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

	return false;
error:
	return false;
}

sun_upload *get_sun_upload(char *str_request, size_t int_request_len) {
	sun_upload *sun_return = NULL;
	char *boundary_ptr = NULL;
	char *boundary_end_ptr = NULL;
	char *boundary_end_ptr_cr = NULL;
	size_t int_boundary_len = 0;
	SDEFINE_VAR_ALL(str_boundary, str_content_type, str_name);

    ////GET BOUNDARY
	boundary_ptr = bstrstri(str_request, int_request_len, "CONTENT-TYPE: MULTIPART/FORM-DATA; BOUNDARY=", 44);
	SERROR_CHECK(boundary_ptr != NULL, "Cannot find boundary for request");
    boundary_ptr += 44;

	boundary_end_ptr_cr = strchr(boundary_ptr, 13);
	boundary_end_ptr = boundary_end_ptr_cr != 0 ? boundary_end_ptr_cr : strchr(boundary_ptr, 10);
	int_boundary_len = (size_t)((boundary_end_ptr - boundary_ptr) + 2);

	int_boundary_len = int_boundary_len + 1; // newline
	SERROR_SALLOC(str_boundary, int_boundary_len + 1); // null byte
	memcpy(str_boundary + 2, boundary_ptr, int_boundary_len - 2);
	// This was adding two dashes to the end, but that was actually not working
	// (the file name was coming in after the file content),
	// and now I found out that you need them at the beginning instead (they are
	// added to the the end as well, but only for the last boundary)
	// - Nunzio on Wed Feb 17 at 2:26 PM
	str_boundary[0] = '-';
	str_boundary[1] = '-';
	str_boundary[int_boundary_len] = '\012';
	str_boundary[int_boundary_len + 1] = '\0';

	SDEBUG(">BOUNDARY|%s<", str_boundary);

	////GET FILE NAME
	// get file name
	char *ptr_name = bstrstri(str_request, 4192, "CONTENT-DISPOSITION: FORM-DATA; NAME=\"FILE_NAME\"", 48);
	if (ptr_name == NULL) {
		ptr_name = brstrstri(str_request, int_request_len, "CONTENT-DISPOSITION: FORM-DATA; NAME=\"FILE_NAME\"", 48);
	}

	SERROR_CHECK(ptr_name != NULL, "No Content Disposition for File Name, (Maybe there is no file name?)");
	ptr_name += 48;

	char *ptr_name_dos = strstr(ptr_name, "\015\012\015\012");
	char *ptr_name_unix = strstr(ptr_name, "\012\012");
	char *ptr_name_mac = strstr(ptr_name, "\015\015");
	// clang-format off
	ptr_name =
		ptr_name_dos > ptr_name_unix	? ptr_name_dos  + 4 :
		ptr_name_dos > ptr_name_mac		? ptr_name_dos  + 4 :
		ptr_name_unix > ptr_name_mac	? ptr_name_unix + 2 :
											ptr_name_mac  + 2;
	// clang-format on

	// copy file name
	char *str_name_carriage = strchr(ptr_name, '\015');
	char *str_name_newline = strchr(ptr_name, '\012');
	char *str_name_boundary = strstr(ptr_name, str_boundary);
	// clang-format off
	size_t int_name_len =
		(str_name_carriage < str_name_newline ? str_name_carriage :
		str_name_carriage < str_name_boundary ? str_name_carriage :
		str_name_boundary) - ptr_name;
	// clang-format on
	SERROR_SALLOC(str_name, int_name_len + 1);
	memcpy(str_name, ptr_name, int_name_len);
	str_name[int_name_len] = '\0';
	SDEBUG(">FILE NAME|%s<", str_name);

	////GET FILE
	// get file content
	SDEBUG("str_request: %20.20s", str_request);

	char *ptr_file_content = bstrstri(str_request, int_request_len, "CONTENT-DISPOSITION: FORM-DATA; NAME=\"FILE_CONTENT\"", 51);
	SERROR_CHECK(ptr_file_content != NULL, "No Content Disposition for File "
										   "Content, (Maybe there is no file "
										   "content?)");
	ptr_file_content += 51;

	SDEBUG("str_request + int_request_len d: %d", str_request + int_request_len);
	SDEBUG("ptr_file_content: %20.20s", ptr_file_content);

	char *ptr_file_content_dos = strstr(ptr_file_content, "\015\012\015\012");
	char *ptr_file_content_unix = strstr(ptr_file_content, "\012\012");
	char *ptr_file_content_mac = strstr(ptr_file_content, "\015\015");
	// clang-format off
    ptr_file_content =
            ptr_file_content_dos  > ptr_file_content_unix   ? ptr_file_content_dos  + 4 :
            ptr_file_content_dos  > ptr_file_content_mac    ? ptr_file_content_dos  + 4 :
            ptr_file_content_unix > ptr_file_content_mac    ? ptr_file_content_unix + 2 :
                                                              ptr_file_content_mac  + 2;
	// clang-format on

	// copy file content
	size_t int_file_content_len =
		(size_t)(brstrstr(ptr_file_content, (size_t)((str_request + int_request_len) - ptr_file_content), str_boundary,
					 int_boundary_len) -
				 ptr_file_content);
	// clang-format off
    // This is because the browser sends a newline after the file content
    // - Nunzio on Wed Feb 17 at 2:26 PM
    int_file_content_len -=
            ptr_file_content_dos  > ptr_file_content_unix   ? 2 :
            ptr_file_content_dos  > ptr_file_content_mac    ? 2 :
															  1;
	// clang-format on
    SERROR_SALLOC(sun_return, sizeof(sun_upload));
    sun_return->str_name = str_name;
    str_name = NULL;
    sun_return->int_name_len = int_name_len;
    sun_return->ptr_file_content = ptr_file_content;
    sun_return->int_file_content_len = int_file_content_len;


	SFREE_ALL();
	return sun_return;
error:
	SFREE_ALL();
	SFREE(sun_return);
	return NULL;
}

void free_sun_upload(sun_upload *sun_current_upload) {
	SFREE(sun_current_upload->str_name);
	SFREE(sun_current_upload);
}
