#pragma once

#include <assert.h>
#include <stdbool.h>
#include <stdlib.h>

#include "util_string.h"
#include "util_error.h"
#include "util_salloc.h"

typedef struct DArray {
	size_t end;
	size_t max;
	size_t element_size;
	size_t expand_rate;
	void **contents;
} DArray;
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
DArray *DArray_create(size_t element_size, size_t initial_max);
void DArray_destroy(DArray *array);
void DArray_clear(DArray *array);
bool DArray_expand(DArray *array);
bool DArray_contract(DArray *array);
size_t DArray_push(DArray *array, void *el);
void *DArray_pop(DArray *array);
void DArray_clear_destroy(DArray *array);
bool DArray_set(DArray *array, size_t i, void *el);
void *DArray_get(DArray *array, size_t i);
void *DArray_remove(DArray *array, size_t i);
void *DArray_new(DArray *array);

#define DArray_last(A) ((A)->contents[(A)->end - 1])
#define DArray_first(A) ((A)->contents[0])
#define DArray_end(A) ((A)->end)
#define DArray_count(A) DArray_end(A)
#define DArray_max(A) ((A)->max)

#define DEFAULT_EXPAND_RATE 300

#define DArray_free(E) free((E))

typedef int (*DArray_compare)(const void *a, const void *b);

int darray_strcmp(char **a, char **b);

void DArray_qsort(DArray *array, DArray_compare cmp);

DArray *split_cstr(char *str_to_split, const char *str_delim);
DArray *_DArray_from_strings(size_t int_count, ...);

#define DArray_from_strings(...) _DArray_from_strings(VA_NUM_ARGS(__VA_ARGS__), ##__VA_ARGS__)
