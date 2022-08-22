#include "util_darray.h"

DArray *DArray_create(size_t int_element_size, size_t int_initial_max) {
	DArray *arr_return = NULL;
	
	SERROR_CHECK(int_element_size > 0, "You must set an int_element_size > 0.");
	SERROR_CHECK(int_initial_max > 0, "You must set an int_initial_max > 0.");
	
	SERROR_SALLOC(arr_return, sizeof(DArray));
	
	SDEBUG("DArray_create(%p)", arr_return);
	
	SERROR_SALLOC(arr_return->contents, int_initial_max * sizeof(void *));
	
	arr_return->end = 0;
	arr_return->max = int_initial_max;
	arr_return->element_size = int_element_size;
	arr_return->expand_rate = DEFAULT_EXPAND_RATE;
	
	return arr_return;
error:
	SFREE(arr_return);
	return NULL;
}

void DArray_clear(DArray *arr_input) {
	SDEBUG("DArray_clear(%p)", arr_input);
	
	size_t i = 0;
	if (arr_input->element_size > 0) {
		for (i = 0; i < arr_input->end; i++) {
			SDEBUG("clear: %i", i);
			SFREE(arr_input->contents[i]);
		}
	}
}

static inline bool DArray_resize(DArray *arr_input, size_t int_newsize) {
	SERROR_CHECK(int_newsize > 0, "The newsize must be > 0.");
	
	arr_input->max = int_newsize;
	
	SERROR_SREALLOC(arr_input->contents, arr_input->max * sizeof(void *));
	
	return true;
error:
	return false;
}

// When array is too small, instead of increasing by one we increase by DArray->expand_rate
// that way we're not reallocating for every item
bool DArray_expand(DArray *arr_input) {
	size_t old_max = arr_input->max;
	
	SERROR_CHECK(DArray_resize(arr_input, arr_input->max + arr_input->expand_rate), "DArray_resize failed.");
	
	// zero out new part of array, just in case
	memset(arr_input->contents + old_max, 0, arr_input->expand_rate * sizeof(void *));

	return true;
error:
	return false;
}

// when array is too large, be resize to a multiple of DArray->expand_rate
bool DArray_contract(DArray *arr_input) {
	size_t new_size = arr_input->end < (size_t)arr_input->expand_rate ? (size_t)arr_input->expand_rate : arr_input->end;
	
	SERROR_CHECK(DArray_resize(arr_input, new_size + 1), "DArray_resize failed.");
	
	return true;
error:
	return false;
}

void DArray_destroy(DArray *arr_input) {
	SDEBUG("DArray_destroy(%p)", arr_input);
	
	if (arr_input) {
		SFREE(arr_input->contents);
	}
	
	SFREE(arr_input);
}

void DArray_clear_destroy(DArray *arr_input) {
	SDEBUG("DArray_clear_destroy(%p)", arr_input);
	
	DArray_clear(arr_input);
	
	DArray_destroy(arr_input);
}

size_t DArray_push(DArray *arr_input, void *el) {
	arr_input->contents[arr_input->end] = el;
	
	arr_input->end++;
	
	if (DArray_end(arr_input) >= DArray_max(arr_input)) {
		DArray_expand(arr_input);
	}
	
	return arr_input->end;
}

void *DArray_pop(DArray *arr_input) {
	SERROR_CHECK((ssize_t)arr_input->end - 1 >= 0, "Attempt to pop from empty array.");
	
	void *el = DArray_remove(arr_input, arr_input->end - 1);
	arr_input->end--;
	
	if (DArray_end(arr_input) > (size_t)arr_input->expand_rate && DArray_end(arr_input) % arr_input->expand_rate) {
		SERROR_CHECK(DArray_contract(arr_input), "DArray_contract failed.");
	}
	
	return el;
error:
	return NULL;
}

// used for sorting, not for equating
// can be provided to the function below if your darray is a string array
int darray_strcmp(char **a, char **b) {
	return strncmp(*a, *b, strlen(*a));
}

// if you provide a function, you can sort the darray
void DArray_qsort(DArray *arr_input, DArray_compare func_cmp) {
	qsort(arr_input->contents, DArray_count(arr_input), sizeof(void *), func_cmp);
}

// You must Darray_clear_destroy what this returns (unless it fails)
DArray *split_cstr(char *str_input_to_split, const char *str_input_delimiter) {
	DArray *darr_ret = DArray_create(sizeof(char *), 1);
	
	char *str_to_split = NULL;
	char *ptr_start = NULL;
	char *ptr_end = NULL;
	char *ptr_delim_pos = NULL;
	char *str_temp = NULL;
	
	size_t int_len = 0;
	size_t int_temp_len = 0;
	
	// make a copy of str_input_to_split where we can add null bytes where we find the delimiter
	SERROR_SNCAT(
		str_to_split, &int_len,
		str_input_to_split, strlen(str_input_to_split)
	);
	ptr_start = str_to_split;
	
	size_t int_length = strlen(str_to_split);
	size_t int_delim_length = strlen(str_input_delimiter);
	ptr_end = str_to_split + int_length;
	
	while (str_to_split < ptr_end) {
		ptr_delim_pos = strstr(str_to_split, str_input_delimiter);
		if (ptr_delim_pos == NULL) {
			ptr_delim_pos = ptr_end;
		}
		*ptr_delim_pos = '\0';
		
		SERROR_SNCAT(str_temp, &int_temp_len,
			str_to_split, int_len);
		DArray_push(darr_ret, str_temp);
		str_temp = NULL;
		
		str_to_split = ptr_delim_pos + int_delim_length;
	}
	
	SFREE(ptr_start);
	
	return darr_ret;
error:
	SFREE(ptr_start);
	
	return NULL;
}

bool DArray_set(DArray *arr_input, size_t i, void *el) {
	SERROR_CHECK(i < arr_input->max, "darray attempt to set past max.");
	
	arr_input->contents[i] = el;
	
	return true;
error:
	return false;
}

void *DArray_get(DArray *arr_input, size_t i) {
	// we're having a "darray attempt to get past max" error occasionally.
	// all I know right now is it doesn't happen much under make test, but
	// seems to happen more frequently when run from an install location.
	// i was working on it and stopped to work on a http_file.c:266 "CERR 46" error
	// if I don't come back and delete this, just leave it here for when it happens again
	SERROR_CHECK(i < arr_input->max, "darray attempt to get past max.");
	
	return arr_input->contents[i];
error:
	printf("i: %zu, arr_input->max %zu\n", i, arr_input->max);
	
	return NULL;
}

void *DArray_remove(DArray *arr_input, size_t i) {
	void *el = arr_input->contents[i];
	
	arr_input->contents[i] = NULL;
	
	return el;
}

void *DArray_new(DArray *arr_input) {
	void *vod_ptr = NULL;
	
	SERROR_CHECK(arr_input->element_size > 0, "Can't use DArray_new on 0 size darrays.");
	
	SERROR_SALLOC(vod_ptr, arr_input->element_size);
	
	return vod_ptr;
error:
	SFREE(vod_ptr);
	return NULL;
}

DArray *_DArray_from_strings(size_t int_count, ...) {
	va_list ap;
	size_t int_i = 0;
	char *ptr_temp = NULL;
    char *str_temp = NULL;
    size_t int_temp_len = 0;
	
	// without the + 1, the array would get grown at the last push
    // an extra 8 bytes to store a pointer is less overhead than
    // re-allocating something that is likely not to be modified
    // (this function is intended for when you need to pass an array as an argument)
	
    DArray *darr_ret = DArray_create(sizeof(char *), int_count + 1);
    SERROR_CHECK(darr_ret != NULL, "DArray_create failed");
	
	// loop through variable argument list
	va_start(ap, int_count);
	for (int_i = 0; int_i < int_count; int_i += 1) {
		ptr_temp = va_arg(ap, char *);
		
        if (ptr_temp != NULL) {
		    SERROR_SNCAT(str_temp, &int_temp_len, ptr_temp, strlen(ptr_temp));
			
            DArray_push(darr_ret, str_temp);
			
            SDEBUG("push: %s", str_temp);
			
			// we don't want to free it once it's been added to the darray
            str_temp = NULL;
        }
	}
	va_end(ap);
	
	// xld, appears unnecessary -Joseph 2022-08-22
    // SFREE(str_temp);
	
    return darr_ret;
error:
    SFREE(str_temp);
	
    if (darr_ret != NULL) {
        DArray_clear_destroy(darr_ret);
        darr_ret = NULL;
    }
	
    return NULL;
}
