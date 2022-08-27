#pragma once
/*
base64 encoding/decoding
*/

#include <stdlib.h>
#include "util_salloc.h"
#include <string.h>

#include <openssl/bio.h>
#include <openssl/buffer.h>
#include <openssl/evp.h>

/*
encode function
arg1: input string
arg2: pointer to length of input string
returns pointer to output string, arg2 gets replaced with length

returns base64 value, cstring safe

returns NULL if error
*/
char *b64encode(const char *str_input, size_t *int_input_len);
/*
//example

char *str_plaintext = "test1";

//will be filled with length of encoded text
//but send with with length of input
size_t int_base64text_len = strlen(str_plaintext); 

char *str_base64text = aes_encrypt(str_plaintext, &int_base64text_len);
*/

/*
decode function
arg1: input string
arg2: pointer to length of input string
returns pointer to output string, arg2 gets replaced with length

returns base64 value, cstring safe

returns NULL if error
*/
char *b64decode(const char *str_input, size_t *int_input_len);
/*
//example

//use encoded text from encoded example
char *str_base64text = "????";

//will be filled with length of input
//but send with with length of output
size_t int_plaintext_len = strlen(str_base64text);

char *str_plaintext= = aes_decrypt(str_base64text, &int_plaintext_len);
*/