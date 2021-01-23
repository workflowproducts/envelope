#include "util_response.h"

bool build_http_response(
        char *str_response_code
        , char *str_response, size_t int_response_len
        , char *str_contenttype
        , DArray *darr_additional_header
        , char **_ptr_str_http_response, size_t *ptr_int_http_response_len) {
    char str_length[50];
    size_t int_i = 0;
    size_t int_len = 0;

    if (int_response_len > 0) {
        snprintf(str_length, 50, "%zu", int_response_len);
    }
    SERROR_SNCAT(
        *_ptr_str_http_response, ptr_int_http_response_len
        , "HTTP/1.1 ", (size_t)9
        , str_response_code, strlen(str_response_code)
        , "\015\012", (size_t)2
        , "Server: envelope\015\012", (size_t)18
        , "Connection: close\015\012", (size_t)19
    );
    if (int_response_len > 0) {
        SERROR_SNFCAT(
            *_ptr_str_http_response, ptr_int_http_response_len
            , "Content-Length: ", (size_t)16
            , str_length, strlen(str_length)
            , "\015\012", (size_t)2
        );
    }
    if (str_contenttype != NULL) {
        SERROR_SNFCAT(
            *_ptr_str_http_response, ptr_int_http_response_len
            , "Content-Type: ", (size_t)14
            , str_contenttype, strlen(str_contenttype)
            , "\015\012", (size_t)2
        );
    }

    if (darr_additional_header) {
       int_len = DArray_count(darr_additional_header);
    }

    // int_len is 0 if we don't have the array
    while (int_i < int_len) {
        SERROR_SNFCAT(
            *_ptr_str_http_response, ptr_int_http_response_len
            , DArray_get(darr_additional_header, int_i), strlen(DArray_get(darr_additional_header, int_i))
            , ": ", (size_t)2
            , DArray_get(darr_additional_header, int_i + 1), strlen(DArray_get(darr_additional_header, int_i + 1))
            , "\015\012", (size_t)2
        );

        int_i = int_i + 2;
    }

    SERROR_SNFCAT(
        *_ptr_str_http_response, ptr_int_http_response_len
        , "\015\012", (size_t)2
        , str_response, (size_t)int_response_len
    );

    return true;
error:
    return false;
}

