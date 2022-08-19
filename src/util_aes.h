#pragma once
/*
plaintext encryption/decryption
*/

#ifndef _CRT_SECURE_NO_DEPRECATE
#define _CRT_SECURE_NO_DEPRECATE 1
#endif

#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#include "util_base64.h"
#include "util_string.h"

#include <openssl/aes.h>
#include <openssl/rand.h>

// iv means initialization vector, it also means the salt
// the iv needs to be the same for encryption and decryption

/*
Initializes the global variables AES key and iv by filling them with random bytes.
Only needs to be run once at start of program.

returns FALSE if failed
*/
bool init_aes_key_iv();
/*
//example

init_aes_key_iv();
*/

/*
encrypt function
arg1: input string
arg2: pointer to length of input string
returns pointer to output string, arg2 gets replaced with length

returns base64 value, cstring safe

returns NULL if error
*/
char *aes_encrypt(char *str_plaintext, size_t *ptr_int_plaintext_length);
/*
//example

char *str_plaintext = "test1";

//will be filled with length of output
//but send with with length of input
size_t int_ciphertext_len = strlen(str_plaintext); 

char *str_ciphertext = aes_encrypt(str_plaintext, &int_ciphertext_len);
*/

/*
decrypt function
arg1: input string
arg2: pointer to length of input string
returns pointer to output string, arg2 gets replaced with length

returns plaintext value, cstring safe

returns NULL if error
*/
char *aes_decrypt(char *str_ciphertext_base64, size_t *ptr_int_ciphertext_length);
/*
//example

//use encrypted text from encrypt example
char *str_ciphertext = "????";

//will be filled with length of input
//but send with with length of output
size_t int_plaintext_len = strlen(str_ciphertext);

char *str_plaintext= = aes_decrypt(str_ciphertext, &int_plaintext_len);
*/