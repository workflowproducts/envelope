#pragma once

#include <stdio.h>
#include <string.h>

#include "util_salloc.h"
#include "util_string.h"
#include "common_client_struct.h"

bool build_http_response(
        char *str_response_code
        , char *str_response, size_t int_response_len
        , char *str_contenttype
        , DArray *darr_additional_header
        , char **_ptr_str_http_response, size_t *ptr_int_http_response_len);
