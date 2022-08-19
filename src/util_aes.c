#include "util_aes.h"

// global variables for the aes key and iv

// global semi-permament variables that don't change during encryption/decryption
char str_global_aes_key_init[32];
char str_global_aes_iv_init[16];

// global temporary variables that do change during encryption/decryption
char str_global_aes_key[32];
char str_global_aes_iv[16];

// reset temporary key/iv using semi-permament key/iv
void set_aes_key_iv();

char *aes_encrypt(char *str_plaintext_input, size_t *ptr_int_plaintext_length) {
	// str_output: to store the output of the encryption function
	// str_plaintext: to store the padded copy of the input
	SDEFINE_VAR_ALL(str_output, str_plaintext);
	char *str_return = NULL;

	SERROR_CHECK(
		str_plaintext_input != NULL
		, "provided input pointer must not be NULL"
	);
	
	SERROR_CHECK(
		ptr_int_plaintext_length != NULL
		, "provided length pointer must not be NULL"
	);

	SERROR_CHECK(
		*ptr_int_plaintext_length > 0
		, "provided length must be greater than zero: %d"
		, *ptr_int_plaintext_length
	);

	// openssl struct we use for the encryption key
	AES_KEY AESkey;

	// so we can copy the plaintext into the str_plaintext variable
	size_t int_old_plaintext_length = *ptr_int_plaintext_length;

	// so we can allocate the str_output length
	size_t int_aes_length;

	// get padded length so that during encryption we don't run past end of allocation
	*ptr_int_plaintext_length = (
			(*ptr_int_plaintext_length + AES_BLOCK_SIZE)
			/ AES_BLOCK_SIZE
		)
		* AES_BLOCK_SIZE;
	int_aes_length = *ptr_int_plaintext_length;

	// we want to operate on a padded copy of the input
	SERROR_SALLOC(str_plaintext, int_aes_length);
	memcpy(str_plaintext, str_plaintext_input, int_old_plaintext_length);


	SERROR_SALLOC(str_output, int_aes_length + 1);

	// prepare temporary key and iv for this encryption
	set_aes_key_iv();

	// set AESkey struct using our encryption key because thats what the encryption function uses
	AES_set_encrypt_key(
		(const unsigned char *)str_global_aes_key
		, 256
		, &AESkey
	);

	// encrypt str_plaintext into str_output
	AES_cbc_encrypt(
		(const unsigned char *)str_plaintext //input variable
		, (unsigned char *)str_output //output variable
		, int_aes_length
		, &AESkey,
		(unsigned char *)str_global_aes_iv
		, AES_ENCRYPT //same function used for encrypt and decrypt mode
	);

	// to make the return cstring safe we base64 the ciphertext
	str_return = b64encode(str_output, ptr_int_plaintext_length);

	bol_error_state = false;
	SFREE_ALL();

	return str_return;
error:
	SFREE_ALL();

	SFREE_PWORD(str_return);
	return NULL;
}

char *aes_decrypt(char *str_ciphertext_base64, size_t *ptr_int_ciphertext_length) {
	// str_ciphertext: to store the ciphertext after it's been base64 decoded
	SDEFINE_VAR_ALL(str_ciphertext);
	char *str_return = NULL;

	SERROR_CHECK(
		str_ciphertext_base64 != NULL
		, "provided input pointer must not be NULL"
	);
	
	SERROR_CHECK(
		ptr_int_ciphertext_length != NULL
		, "provided length pointer must not be NULL"
	);

	SERROR_CHECK(
		*ptr_int_ciphertext_length > 0
		, "provided length must be greater than zero: %d"
		, *ptr_int_ciphertext_length
	);

	// openssl struct we use for the decryption key
	AES_KEY AESkey;

	// decode cstring safe base64 input into non cstring safe str_ciphertext
	str_ciphertext = b64decode(str_ciphertext_base64, ptr_int_ciphertext_length);


	SERROR_SALLOC(str_return, *ptr_int_ciphertext_length + 1);
	
	// prepare temporary key and iv for this decryption
	set_aes_key_iv();

	// set AESkey struct using our decryption key because thats what the decryption function uses
	AES_set_decrypt_key(
		(const unsigned char *)str_global_aes_key
		, 256
		, &AESkey
	);

	// decrypt str_ciphertext into str_return
	AES_cbc_encrypt(
		(const unsigned char *)str_ciphertext //input variable
		, (unsigned char *)str_return //output variable
		, *ptr_int_ciphertext_length
		, &AESkey
		, (unsigned char *)str_global_aes_iv
		, AES_DECRYPT //same function used for encrypt and decrypt mode
	);

	SFREE_ALL();

	return str_return;
error:
	SFREE_ALL();
	
	SFREE_PWORD(str_return);
	return NULL;
}

// Initializes the global variables AES key and iv by filling them with random bytes.
bool init_aes_key_iv() {
	// RAND_bytes is provided by openssl library
	SERROR_CHECK(RAND_bytes((unsigned char *)str_global_aes_key_init, 32), "RAND_bytes failed");
	SERROR_CHECK(RAND_bytes((unsigned char *)str_global_aes_iv_init, 16), "RAND_bytes failed");

	return true;
error:
	return false;
}

/*
When the encryption or decryption functions are run, they run smaller internal
functions that change the key and iv for each block that is encrypted/decrypted.
So when we want to encrypt or decrypt we have to reset the key/iv so that we
can start the same way every time.

We do this by having two sets of global variables, one to keep the same,
the other to provide the encrypt/decrypt functions.
Then this function is run to reset back to start.
*/
void set_aes_key_iv() {
	memcpy(str_global_aes_key, str_global_aes_key_init, 32);
	memcpy(str_global_aes_iv, str_global_aes_iv_init, 16);
}
