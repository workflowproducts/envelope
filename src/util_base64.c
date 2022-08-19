#include "util_base64.h"

#include "util_salloc.h"
#include <string.h>

#include <openssl/bio.h>
#include <openssl/buffer.h>
#include <openssl/evp.h>

// INTERFACE FUNCTIONS

char *b64encode(const char *str_input, size_t *ptr_int_input_len) {
	BIO *bio, *b64;
	BUF_MEM *bufferPtr = NULL;
	char *str_return = NULL;

	SERROR_CHECK(
		str_input != NULL
		, "provided input pointer must not be NULL"
	);
	
	SERROR_CHECK(
		ptr_int_input_len != NULL
		, "provided length pointer must not be NULL"
	);

	SERROR_CHECK(
		*ptr_int_input_len > 0
		, "provided length must be greater than zero: %d"
		, *ptr_int_input_len
	);

	b64 = BIO_new(BIO_f_base64());
	bio = BIO_new(BIO_s_mem());
	bio = BIO_push(b64, bio);

	BIO_set_flags(b64, BIO_FLAGS_BASE64_NO_NL);
	BIO_write(bio, str_input, (int)(*ptr_int_input_len));
	SERROR_CHECK(BIO_flush(bio) == 1, "BIO_flush() failed");
	BIO_get_mem_ptr(bio, &bufferPtr);

	SERROR_SALLOC(str_return, bufferPtr->length + 1);
	memcpy(str_return, bufferPtr->data, bufferPtr->length);
	str_return[bufferPtr->length] = 0;
	*ptr_int_input_len = bufferPtr->length;

	BIO_free_all(bio);

	return str_return;
error:
	SFREE(str_return);
	return NULL;
}

char *b64decode(const char *str_input, size_t *ptr_int_input_len) {
	BIO *bio, *b64;
	char *str_return = NULL;
	
	SERROR_CHECK(
		str_input != NULL
		, "provided input pointer must not be NULL"
	);
	
	SERROR_CHECK(
		ptr_int_input_len != NULL
		, "provided length pointer must not be NULL"
	);

	SERROR_CHECK(
		*ptr_int_input_len > 0
		, "provided length must be greater than zero: %d"
		, *ptr_int_input_len
	);

	SERROR_SALLOC(str_return, (*ptr_int_input_len) + 1);

	b64 = BIO_new(BIO_f_base64());
	bio = BIO_new_mem_buf((char *)str_input, (int)(*ptr_int_input_len));
	bio = BIO_push(b64, bio);

	BIO_set_flags(b64, BIO_FLAGS_BASE64_NO_NL);
	*ptr_int_input_len = (size_t)BIO_read(b64, str_return, (int)(*ptr_int_input_len));
	BIO_free_all(bio);

	return str_return;
error:
	SFREE(str_return);
	return NULL;
}
