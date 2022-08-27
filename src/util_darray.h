/*
Taken from:
https://github.com/zedshaw/liblcthw/blob/master/src/lcthw/darray.h

See also:
http://c.learncodethehardway.org/book/ex34.html

Description:
DArrays are dynamic length arrays.

Thank you Zed A. Shaw

Copyright (c) 2010, Zed A. Shaw.  All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.

    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

    * Neither the name of the Learn C The Hard Way, Zed A. Shaw, nor the names
      of its contributors may be used to endorse or promote products
      derived from this software without specific prior written
      permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
#pragma once

#include <assert.h>
#include <stdbool.h>
#include <stdlib.h>

#include "util_string.h"
#include "util_error.h"
#include "util_salloc.h"

// INTERNAL

typedef struct DArray {
	size_t end;
	size_t max;
	size_t element_size;
	size_t expand_rate;
	void **contents;
} DArray;

#define DARRAY_DEFAULT_EXPAND_RATE 300

bool _DArray_destroy(DArray *darr_input);
bool _DArray_clear_destroy(DArray *darr_input);

// EXAMPLES: BASIC USAGE
/*
// push and pop
DArray *darr_result = DArray_create(sizeof(char *), 1);
DArray_push(darr_result, "test1");
DArray_push(darr_result, "test2");
char *str_test = DArray_pop(darr_result);
DArray_destroy(darr_result); //array variables are not allocated, so just destroy

// build array from multiple strings
DArray *darr_result = DArray_from_strings(
    "test1"
    , "test2"
    , "test3"
);
char *str_test = DArray_get(darr_result, 2);
DArray_clear_destroy(darr_result); //array variables are allocated, so clear and destroy

// split on delimiter
DArray *darr_result = split_cstr("test2,test1", ",");
DArray_qsort(darr_result, (DArray_compare)darray_strcmp);
char *str_test = DArray_pop(darr_result);
DArray_clear_destroy(darr_result); // array variables are allocated, so clear and destroy
*/
// EXTERNAL

DArray *DArray_create(size_t int_element_size, size_t int_initial_max);
bool DArray_push(DArray *darr_input, void *el);
void *DArray_pop(DArray *darr_input);

bool DArray_clear(DArray *darr_input);
#define DArray_destroy(E) _DArray_destroy((E)); E = NULL
#define DArray_clear_destroy(E) _DArray_clear_destroy((E)); E = NULL

bool DArray_set(DArray *darr_input, size_t i, void *el);

void *DArray_get(DArray *darr_input, size_t i);
void *DArray_remove(DArray *darr_input, size_t i);
void *DArray_new(DArray *darr_input);

#define DArray_last(A) ((A)->contents[(A)->end - 1])
#define DArray_first(A) ((A)->contents[0])
#define DArray_end(A) ((A)->end)
#define DArray_count(A) DArray_end(A)
#define DArray_max(A) ((A)->max)


typedef int (*DArray_compare)(const void *a, const void *b);

int darray_strcmp(char *a, char *b);

bool DArray_qsort(DArray *darr_input, DArray_compare func_cmp);

DArray *split_cstr(char *str_to_split, const char *str_delimiter);
DArray *_DArray_from_strings(size_t int_count, ...);

#define DArray_from_strings(...) _DArray_from_strings(VA_NUM_ARGS(__VA_ARGS__), ##__VA_ARGS__)
