#include "stdio.h"
#include <string.h>
#include "../util_aes.h"
#include "../util_base64.h"
#include "../util_canonical.h"
#include "../util_cookie.h"
#include "../util_darray.h"

#include "../util_string.h"
#include "../util_salloc.h"
#include "unit_test_error.h"

int int_global_success = 0;
int int_global_fail = 0;


void unit_test_boolean(bool bol_provided, char *str_unit_test_name);
void unit_test_length_exact(size_t int_provided, size_t int_expected, char *str_unit_test_name);
void unit_test_length_greater(size_t int_provided, size_t int_expected, char *str_unit_test_name);
void unit_test_string(char *str_result, char *str_expected, char *str_unit_test_name);
void unit_test_bstring(
    char *str_result
    , size_t int_result_len
    , char *str_expected
    , size_t int_expected_len
    , char *str_unit_test_name
);

int main(int argc, char *argv[]) {
    if (argc && argv) {} //get rid of unused variable warning
    
    // tests are locally scoped so I don't have to worry about duplicate variable names
    
    // get current working directory for canonical tests later
    char arr_char_cwd[1024];
    getcwd(arr_char_cwd, sizeof(arr_char_cwd));
    
    // BASE64 UNIT TESTS
    
    // BASE64 TEST 1
    // encode then decode and check that it's the same
    // ascii text
    {
        char *str_plaintext = "testing123";
        size_t int_ciphertext_len = strlen(str_plaintext);
        
        char *str_ciphertext = b64encode(str_plaintext, &int_ciphertext_len);
        
        size_t int_result_plaintext_len = strlen(str_ciphertext);
        char *str_result_plaintext = b64decode(str_ciphertext, &int_result_plaintext_len);
        
        unit_test_string(str_result_plaintext, str_plaintext, "BASE64 ENCODE AND DECODE ASCII");
        
        SFREE(str_ciphertext);
        SFREE(str_result_plaintext);
    }
    
    // BASE64 TEST 2
    // encrypt then decrypt and check that it's the same
    // null byte in string
    {
        char *str_plaintext = "TE\0ST";
        size_t int_ciphertext_len = 6;
        char *str_ciphertext = b64encode(str_plaintext, &int_ciphertext_len);
        
        size_t int_result_plaintext_len = strlen(str_ciphertext);
        char *str_result_plaintext = b64decode(str_ciphertext, &int_result_plaintext_len);
        
        //don't test this, resulting plaintext is longer than original 5 characters
        /*
        unit_test_bstring(
            str_result_plaintext
            , int_ciphertext_len
            , str_plaintext
            , int_result_plaintext_len
            , "BASE64 ENCRYPT AND DECRYPT NULL STRING"
        );
        */
        
        unit_test_bstring(
            str_result_plaintext
            , 6
            , str_plaintext
            , 6
            , "BASE64 ENCODE AND DECODE BINARY STRING"
        );
        
        SFREE(str_ciphertext);
        SFREE(str_result_plaintext);
    }
    
    // BASE64 TEST 3
    // encrypt then decrypt and check that it's the same
    // utf8 text
    {
        char *str_plaintext = "\xF0\x9F\xA6\x9E"; //unicode :lobster:
        size_t int_ciphertext_len = strlen(str_plaintext);
        char *str_ciphertext = b64encode(str_plaintext, &int_ciphertext_len);
        
        size_t int_result_plaintext_len = strlen(str_ciphertext);
        char *str_result_plaintext = b64decode(str_ciphertext, &int_result_plaintext_len);
        
        unit_test_string(str_result_plaintext, str_plaintext, "BASE64 ENCODE AND DECODE UNICODE LOBSTER");
        
        SFREE(str_ciphertext);
        SFREE(str_result_plaintext);
    }
    
    // BASE64 TEST 4
    // encrypt zero length string, return NULL
    {
        char *str_plaintext = "";
        size_t int_ciphertext_len = strlen(str_plaintext);
        char *str_ciphertext = b64encode(str_plaintext, &int_ciphertext_len);
        
        unit_test_string(str_ciphertext, NULL, "BASE64 ENCODE RETURN NULL ON EMPTY STRING INPUT");
        unit_test_string(
            str_global_error
            , "util_base64.c:b64encode: provided length must be greater than zero: 0\n"
            , "BASE64 ENCODE RETURN NULL ON EMPTY STRING INPUT ERROR MESSAGE"
        );
        
        SFREE(str_ciphertext);
    }
    
    // BASE64 TEST 5
    // decrypt zero length string, return NULL
    {
        char *str_ciphertext = "";
        size_t int_plaintext_len = strlen(str_ciphertext);
        char *str_plaintext = b64decode(str_ciphertext, &int_plaintext_len);
        
        unit_test_string(str_plaintext, NULL, "BASE64 DECODE RETURN NULL ON EMPTY STRING INPUT");
        unit_test_string(
            str_global_error
            , "util_base64.c:b64decode: provided length must be greater than zero: 0\n"
            , "BASE64 DECODE RETURN NULL ON EMPTY STRING INPUT ERROR MESSAGE"
        );
        
        SFREE(str_plaintext);
    }
    
    // BASE64 TEST 6
    // encrypt null pointer, return NULL
    {
        size_t int_plaintext_len = 5;
        char *str_plaintext = b64encode(NULL, &int_plaintext_len);
        
        unit_test_string(str_plaintext, NULL, "BASE64 ENCODE RETURN NULL ON NULL INPUT");
        unit_test_string(
            str_global_error
            , "util_base64.c:b64encode: provided input pointer must not be NULL\n"
            , "BASE64 ENCODE RETURN NULL ON NULL ERROR MESSAGE"
        );
        
        SFREE(str_plaintext);
    }
    
    // BASE64 TEST 7
    // encrypt null length pointer, return NULL
    {
        char *str_plaintext = "test";
        char *str_ciphertext = b64encode(str_plaintext, NULL);
        
        unit_test_string(str_ciphertext, NULL, "BASE64 ENCODE RETURN NULL ON NULL LENGTH INPUT");
        unit_test_string(
            str_global_error
            , "util_base64.c:b64encode: provided length pointer must not be NULL\n"
            , "BASE64 ENCODE RETURN NULL ON NULL LENGTH INPUT ERROR MESSAGE"
        );
        
        SFREE(str_ciphertext);
    }
    
    // BASE64 TEST 8
    // encrypt null pointer, return NULL
    {
        size_t int_plaintext_len = 5;
        char *str_plaintext = b64decode(NULL, &int_plaintext_len);
        
        unit_test_string(str_plaintext, NULL, "BASE64 DECODE RETURN NULL ON NULL INPUT");
        unit_test_string(
            str_global_error
            , "util_base64.c:b64decode: provided input pointer must not be NULL\n"
            , "BASE64 DECODE RETURN NULL ON NULL ERROR MESSAGE"
        );
        
        SFREE(str_plaintext);
    }
    
    // BASE64 TEST 9
    // encrypt null length pointer, return NULL
    {
        char *str_plaintext = "test";
        char *str_ciphertext = b64decode(str_plaintext, NULL);
        
        unit_test_string(str_ciphertext, NULL, "BASE64 DECODE RETURN NULL ON NULL LENGTH INPUT");
        unit_test_string(
            str_global_error
            , "util_base64.c:b64decode: provided length pointer must not be NULL\n"
            , "BASE64 DECODE RETURN NULL ON NULL LENGTH INPUT ERROR MESSAGE"
        );
        
        SFREE(str_ciphertext);
    }
    
    
    // AES UNIT TESTS
    
    // set key and iv
    init_aes_key_iv();
    
    // AES TEST 1
    // encrypt then decrypt and check that it's the same
    // ascii text
    {
        char *str_plaintext = "testing123";
        size_t int_ciphertext_len = strlen(str_plaintext);
        
        char *str_ciphertext = aes_encrypt(str_plaintext, &int_ciphertext_len);
        
        size_t int_result_plaintext_len = strlen(str_ciphertext);
        char *str_result_plaintext = aes_decrypt(str_ciphertext, &int_result_plaintext_len);
        
        unit_test_string(str_result_plaintext, str_plaintext, "AES ENCRYPT AND DECRYPT ASCII");
        
        SFREE(str_ciphertext);
        SFREE(str_result_plaintext);
    }
    
    // AES TEST 2
    // encrypt then decrypt and check that it's the same
    // null byte in string
    {
        char *str_plaintext = "TE\0ST";
        size_t int_ciphertext_len = 6;
        char *str_ciphertext = aes_encrypt(str_plaintext, &int_ciphertext_len);
        
        size_t int_result_plaintext_len = strlen(str_ciphertext);
        char *str_result_plaintext = aes_decrypt(str_ciphertext, &int_result_plaintext_len);
        
        //don't test this, resulting plaintext is longer than original 5 characters
        /*
        unit_test_bstring(
            str_result_plaintext
            , int_ciphertext_len
            , str_plaintext
            , int_result_plaintext_len
            , "AES ENCRYPT AND DECRYPT NULL STRING"
        );
        */
        
        unit_test_bstring(
            str_result_plaintext
            , 6
            , str_plaintext
            , 6
            , "AES ENCRYPT AND DECRYPT BINARY STRING"
        );
        
        SFREE(str_ciphertext);
        SFREE(str_result_plaintext);
    }
    
    // AES TEST 3
    // encrypt then decrypt and check that it's the same
    // utf8 text
    {
        char *str_plaintext = "\xF0\x9F\xA6\x9E"; //unicode :lobster:
        size_t int_ciphertext_len = strlen(str_plaintext);
        char *str_ciphertext = aes_encrypt(str_plaintext, &int_ciphertext_len);
        
        size_t int_result_plaintext_len = strlen(str_ciphertext);
        char *str_result_plaintext = aes_decrypt(str_ciphertext, &int_result_plaintext_len);
        
        unit_test_string(str_result_plaintext, str_plaintext, "AES ENCRYPT AND DECRYPT UNICODE LOBSTER");
        
        SFREE(str_ciphertext);
        SFREE(str_result_plaintext);
    }
    
    // AES TEST 4
    // encrypt zero length string, return NULL
    {
        char *str_plaintext = "";
        size_t int_ciphertext_len = strlen(str_plaintext);
        char *str_ciphertext = aes_encrypt(str_plaintext, &int_ciphertext_len);
        
        unit_test_string(str_ciphertext, NULL, "AES ENCRYPT RETURN NULL ON EMPTY STRING INPUT");
        unit_test_string(
            str_global_error
            , "util_aes.c:aes_encrypt: provided length must be greater than zero: 0\n"
            , "AES ENCRYPT RETURN NULL ON EMPTY STRING INPUT ERROR MESSAGE"
        );
        
        SFREE(str_ciphertext);
    }
    
    // AES TEST 5
    // decrypt zero length string, return NULL
    {
        char *str_ciphertext = "";
        size_t int_plaintext_len = strlen(str_ciphertext);
        char *str_plaintext = aes_decrypt(str_ciphertext, &int_plaintext_len);
        
        unit_test_string(str_plaintext, NULL, "AES DECRYPT RETURN NULL ON EMPTY STRING INPUT");
        unit_test_string(
            str_global_error
            , "util_aes.c:aes_decrypt: provided length must be greater than zero: 0\n"
            , "AES DECRYPT RETURN NULL ON EMPTY STRING INPUT ERROR MESSAGE"
        );
        
        SFREE(str_plaintext);
    }
    
    // AES TEST 6
    // encrypt null pointer, return NULL
    {
        size_t int_plaintext_len = 5;
        char *str_plaintext = aes_encrypt(NULL, &int_plaintext_len);
        
        unit_test_string(str_plaintext, NULL, "AES ENCRYPT RETURN NULL ON NULL INPUT");
        unit_test_string(
            str_global_error
            , "util_aes.c:aes_encrypt: provided input pointer must not be NULL\n"
            , "AES ENCRYPT RETURN NULL ON NULL ERROR MESSAGE"
        );
        
        SFREE(str_plaintext);
    }
    
    // AES TEST 7
    // encrypt null length pointer, return NULL
    {
        char *str_plaintext = "test";
        char *str_ciphertext = aes_encrypt(str_plaintext, NULL);
        
        unit_test_string(str_ciphertext, NULL, "AES ENCRYPT RETURN NULL ON NULL LENGTH INPUT");
        unit_test_string(
            str_global_error
            , "util_aes.c:aes_encrypt: provided length pointer must not be NULL\n"
            , "AES ENCRYPT RETURN NULL ON NULL LENGTH INPUT ERROR MESSAGE"
        );
        
        SFREE(str_ciphertext);
    }
    
    // AES TEST 8
    // encrypt null pointer, return NULL
    {
        size_t int_plaintext_len = 5;
        char *str_plaintext = aes_decrypt(NULL, &int_plaintext_len);
        
        unit_test_string(str_plaintext, NULL, "AES DECRYPT RETURN NULL ON NULL INPUT");
        unit_test_string(
            str_global_error
            , "util_aes.c:aes_decrypt: provided input pointer must not be NULL\n"
            , "AES DECRYPT RETURN NULL ON NULL ERROR MESSAGE"
        );
        
        SFREE(str_plaintext);
    }
    
    // AES TEST 9
    // encrypt null length pointer, return NULL
    {
        char *str_plaintext = "test";
        char *str_ciphertext = aes_decrypt(str_plaintext, NULL);
        
        unit_test_string(str_ciphertext, NULL, "AES DECRYPT RETURN NULL ON NULL LENGTH INPUT");
        unit_test_string(
            str_global_error
            , "util_aes.c:aes_decrypt: provided length pointer must not be NULL\n"
            , "AES DECRYPT RETURN NULL ON NULL LENGTH INPUT ERROR MESSAGE"
        );
        
        SFREE(str_ciphertext);
    }
    
    
    // JOSEPH TESTS ADDED BELOW
    
    // CANONICAL UNIT TESTS
    
    // CANONICAL TEST 1
    // write_file
    {
        char *str_full_path;
        size_t int_full_path_len;
        
        char *str_file_base = (char *)&arr_char_cwd;
        char *str_path = "test/test2/test.txt";
        
        // build str_full_path
        SNCAT(
            str_full_path, &int_full_path_len
            , str_file_base, strlen(str_file_base)
            , "/", (size_t)1
            , str_path, strlen(str_path)
        );
        
        char *str_valid_path = canonical(str_file_base, str_path, "write_file");
        
        unit_test_string(str_valid_path, str_full_path, "CANONICAL TEST write_file AND mkdir -p");
        
        SFREE(str_valid_path);
        SFREE(str_full_path);
    }
    
    // CANONICAL TEST 2
    // read_file
    {
        char *str_full_path;
        size_t int_full_path_len;
        
        char *str_file_base = (char *)&arr_char_cwd;
        char *str_path = "test/test.txt";
        
        // build str_full_path
        SNCAT(
            str_full_path, &int_full_path_len
            , str_file_base, strlen(str_file_base)
            , "/", (size_t)1
            , str_path, strlen(str_path)
        );
        
        char *str_valid_path = canonical(str_file_base, str_path, "read_file");
        
        unit_test_string(str_valid_path, str_full_path, "CANONICAL TEST read_file");
        
        SFREE(str_valid_path);
        SFREE(str_full_path);
    }
    
    // CANONICAL TEST 3
    // read_file ERROR
    {
        char *str_file_base = (char *)&arr_char_cwd;
        char *str_path = "test/test_doesnt_exist.txt";
        
        char *str_valid_path = canonical(str_file_base, str_path, "read_file");
        
        unit_test_string(str_valid_path, NULL, "CANONICAL TEST read_file ERROR");
        
        SFREE(str_valid_path);
    }
    
    // CANONICAL TEST 4
    // read_file ERROR
    {
        char *str_file_base = (char *)&arr_char_cwd;
        char *str_path = "test";
        
        char *str_valid_path = canonical(str_file_base, str_path, "read_file");
        
        unit_test_string(str_valid_path, NULL, "CANONICAL TEST read_file ERROR IS ACTUALLY DIRECTORY");
        
        SFREE(str_valid_path);
    }
    
    // CANONICAL TEST 5
    // read_dir
    {
        char *str_full_path;
        size_t int_full_path_len;
        
        char *str_file_base = (char *)&arr_char_cwd;
        char *str_path = "test";
        
        // build str_full_path
        SNCAT(
            str_full_path, &int_full_path_len
            , str_file_base, strlen(str_file_base)
            , "/", (size_t)1
            , str_path, strlen(str_path)
        );
        
        char *str_valid_path = canonical(str_file_base, str_path, "read_dir");
        
        unit_test_string(str_valid_path, str_full_path, "CANONICAL TEST read_dir");
        
        SFREE(str_valid_path);
        SFREE(str_full_path);
    }
    
    // CANONICAL TEST 6
    // read_dir ERROR
    {
        char *str_file_base = (char *)&arr_char_cwd;
        char *str_path = "test_doesnt_exist";
        
        char *str_valid_path = canonical(str_file_base, str_path, "read_dir");
        
        unit_test_string(str_valid_path, NULL, "CANONICAL TEST read_dir ERROR");
        
        SFREE(str_valid_path);
    }
    
    // CANONICAL TEST 7
    // read_dir ERROR
    {
        char *str_file_base = (char *)&arr_char_cwd;
        char *str_path = "test/test.txt";
        
        char *str_valid_path = canonical(str_file_base, str_path, "read_dir");
        
        unit_test_string(str_valid_path, NULL, "CANONICAL TEST read_dir ERROR IS ACTUALLY FILE");
        
        SFREE(str_valid_path);
    }
    
    // CANONICAL TEST 8
    // create_dir
    {
        char *str_full_path;
        size_t int_full_path_len;
        
        char *str_file_base = (char *)&arr_char_cwd;
        char *str_path = "test/test";
        
        // build str_full_path
        SNCAT(
            str_full_path, &int_full_path_len
            , str_file_base, strlen(str_file_base)
            , "/", (size_t)1
            , str_path, strlen(str_path)
        );
        
        char *str_valid_path = canonical(str_file_base, str_path, "create_dir");
        
        unit_test_string(str_valid_path, str_full_path, "CANONICAL TEST create_dir");
        
        SFREE(str_valid_path);
        SFREE(str_full_path);
    }
    
    // CANONICAL TEST 9
    // create_dir
    {
        char *str_file_base = (char *)&arr_char_cwd;
        char *str_path = "test*";
        
        char *str_valid_path = canonical(str_file_base, str_path, "create_dir");
        
        unit_test_string(str_valid_path, NULL, "CANONICAL TEST create_dir ERROR INVALID CHARS");
        
        SFREE(str_valid_path);
    }
    
    // CANONICAL TEST 10
    // read_dir_or_file
    {
        char *str_full_path;
        size_t int_full_path_len;
        
        char *str_file_base = (char *)&arr_char_cwd;
        char *str_path = "test/test.txt";
        
        // build str_full_path
        SNCAT(
            str_full_path, &int_full_path_len
            , str_file_base, strlen(str_file_base)
            , "/", (size_t)1
            , str_path, strlen(str_path)
        );
        
        char *str_valid_path = canonical(str_file_base, str_path, "read_dir_or_file");
        
        unit_test_string(str_valid_path, str_full_path, "CANONICAL TEST read_dir_or_file");
        
        SFREE(str_valid_path);
        SFREE(str_full_path);
    }
    
    // CANONICAL TEST 11
    // read_dir_or_file ERROR
    {
        char *str_file_base = (char *)&arr_char_cwd;
        char *str_path = ".git";
        
        char *str_valid_path = canonical(str_file_base, str_path, "read_dir_or_file");
        
        unit_test_string(str_valid_path, NULL, "CANONICAL TEST read_dir_or_file ERROR .git NOT ALLOWED");
        
        SFREE(str_valid_path);
    }
    
    // CANONICAL TEST 12
    // read_dir_or_file ERROR
    {
        char *str_file_base = (char *)&arr_char_cwd;
        char *str_path = "--/test.txt";
        
        char *str_valid_path = canonical(str_file_base, str_path, "read_dir_or_file");
        
        unit_test_string(str_valid_path, NULL, "CANONICAL TEST read_dir_or_file ERROR -- NOT ALLOWED");
        
        SFREE(str_valid_path);
    }
    
    // CANONICAL TEST 13
    // read_dir_or_file ERROR
    {
        char *str_file_base = (char *)&arr_char_cwd;
        char *str_path = "test//test.txt";
        
        char *str_valid_path = canonical(str_file_base, str_path, "read_dir_or_file");
        
        unit_test_string(str_valid_path, NULL, "CANONICAL TEST read_dir_or_file ERROR // NOT ALLOWED");
        
        SFREE(str_valid_path);
    }
    
    // CANONICAL TEST 14
    // read_dir_or_file ERROR
    {
        char *str_file_base = (char *)&arr_char_cwd;
        char *str_path = "test\\\\test.txt";
        
        char *str_valid_path = canonical(str_file_base, str_path, "read_dir_or_file");
        
        unit_test_string(str_valid_path, NULL, "CANONICAL TEST read_dir_or_file ERROR \\\\ NOT ALLOWED");
        
        SFREE(str_valid_path);
    }
    
    // CANONICAL TEST 15
    // valid_path
    {
        char *str_full_path;
        size_t int_full_path_len;
        
        char *str_file_base = (char *)&arr_char_cwd;
        char *str_path = "";
        
        // build str_full_path
        SNCAT(
            str_full_path, &int_full_path_len
            , str_file_base, strlen(str_file_base)
            , "/", (size_t)1
            , str_path, strlen(str_path)
        );
        
        char *str_valid_path = canonical(str_file_base, str_path, "valid_path");
        
        unit_test_string(str_valid_path, str_full_path, "CANONICAL TEST valid_path EMPTY STRING");
        
        SFREE(str_valid_path);
        SFREE(str_full_path);
    }
    
    // CANONICAL TEST 16
    // no base path
    {
        char *str_path = "";
        
        char *str_valid_path = canonical(NULL, str_path, "valid_path");
        
        unit_test_string(str_valid_path, NULL, "CANONICAL TEST valid_path NO BASE PATH");
        
        SFREE(str_valid_path);
    }
    
    // CANONICAL TEST 17
    // no path
    {
        char *str_file_base = (char *)&arr_char_cwd;
        
        char *str_valid_path = canonical(str_file_base, NULL, "valid_path");
        
        unit_test_string(str_valid_path, NULL, "CANONICAL TEST valid_path NO PATH");
        
        SFREE(str_valid_path);
    }
    
    // CANONICAL TEST 18
    // no type
    {
        char *str_file_base = (char *)&arr_char_cwd;
        char *str_path = "";
        
        char *str_valid_path = canonical(str_file_base, str_path, NULL);
        
        unit_test_string(str_valid_path, NULL, "CANONICAL TEST valid_path NO TYPE");
        
        SFREE(str_valid_path);
    }
    
    // CANONICAL TEST 19
    // invalid type
    {
        char *str_file_base = (char *)&arr_char_cwd;
        char *str_path = "";
        
        char *str_valid_path = canonical(str_file_base, str_path, "test");
        
        unit_test_string(str_valid_path, NULL, "CANONICAL TEST INVALID TYPE NO PATH");
        
        SFREE(str_valid_path);
    }
    
    // CANONICAL TEST 20
    // invalid type
    {
        char *str_file_base = (char *)&arr_char_cwd;
        char *str_path = "test/test.txt";
        
        char *str_valid_path = canonical(str_file_base, str_path, "test");
        
        unit_test_string(str_valid_path, NULL, "CANONICAL TEST INVALID TYPE");
        
        SFREE(str_valid_path);
    }
    
    // COOKIE UNIT TESTS
    
    // COOKIE TEST 1
    // one day cookie
    {
        char *str_result = str_expire_one_day();
        size_t int_result_length = strlen(str_result);
        
        unit_test_length_greater(int_result_length, 25, "COOKIE ONE DAY LENGTH");
        
        SFREE(str_result);
    }
    
    // COOKIE TEST 2
    // 100 year cookie
    {
        char *str_result = str_expire_100_year();
        size_t int_result_length = strlen(str_result);
        
        unit_test_length_greater(int_result_length, 25, "COOKIE 100 YEAR LENGTH");
        
        SFREE(str_result);
    }
    
    // DARRAY UNIT TESTS
    
    // DARRAY TEST 1
    // unallocated elements
    {
        char *str_test;
        DArray *darr_result = DArray_create(sizeof(char *), 1);
        unit_test_boolean(darr_result != NULL, "DARRAY CREATE");
        
        unit_test_boolean(DArray_push(darr_result, "test1"), "DARRAY PUSH 1");
        unit_test_string(DArray_get(darr_result, 0), "test1", "DARRAY GET");
        unit_test_length_exact(DArray_end(darr_result), 1, "DARRAY END");
        unit_test_length_exact(DArray_count(darr_result), 1, "DARRAY COUNT");
        unit_test_length_exact(DArray_max(darr_result), DARRAY_DEFAULT_EXPAND_RATE + 1, "DARRAY MAX");
        
        unit_test_boolean(DArray_push(darr_result, "test2"), "DARRAY PUSH 2");
        unit_test_string(DArray_get(darr_result, 1), "test2", "DARRAY GET");
        unit_test_string(DArray_first(darr_result), "test1", "DARRAY FIRST");
        unit_test_string(DArray_last(darr_result), "test2", "DARRAY LAST");
        
        unit_test_boolean(DArray_set(darr_result, 1, "test3"), "DARRAY SET");
        unit_test_string(DArray_get(darr_result, 1), "test3", "DARRAY GET");
        
        str_test = DArray_pop(darr_result);
        unit_test_string(str_test, "test3", "DARRAY POP");
        
        unit_test_string(DArray_remove(darr_result, 0), "test1", "DARRAY REMOVE");
        
        DArray_destroy(darr_result);
        unit_test_boolean(darr_result == NULL, "DARRAY DESTROY");
        
        darr_result = DArray_from_strings(
            "test1"
            , "test2"
            , "test3"
        );
        unit_test_boolean(darr_result != NULL, "DARRAY FROM STRINGS");
        
        unit_test_string(DArray_get(darr_result, 0), "test1", "DARRAY GET");
        unit_test_string(DArray_get(darr_result, 1), "test2", "DARRAY GET");
        unit_test_string(DArray_get(darr_result, 2), "test3", "DARRAY GET");
        
        DArray_clear_destroy(darr_result);
        unit_test_boolean(darr_result == NULL, "DARRAY CLEAR AND DESTROY");
    }
    
    // DARRAY TEST 2
    // allocated elements
    {
        char *str_test;
        size_t int_test_length;
        DArray *darr_result = DArray_create(sizeof(char *), 2);
        unit_test_boolean(darr_result != NULL, "DARRAY CREATE");
        
        SNCAT(
            str_test, &int_test_length
            , "test1", 6
        );
        
        unit_test_boolean(DArray_push(darr_result, str_test), "DARRAY PUSH 1");
        str_test = NULL;
        unit_test_string(DArray_get(darr_result, 0), "test1", "DARRAY GET");
        
        SNCAT(
            str_test, &int_test_length
            , "test2", 6
        );
        
        unit_test_boolean(DArray_push(darr_result, str_test), "DARRAY PUSH 2");
        str_test = NULL;
        unit_test_string(DArray_get(darr_result, 1), "test2", "DARRAY GET");
        
        str_test = DArray_pop(darr_result);
        unit_test_string(str_test, "test2", "DARRAY POP");
        SFREE(str_test);
        
        str_test = DArray_new(darr_result);
        unit_test_boolean(str_test != NULL, "DARRAY NEW");
        SFREE(str_test);
        
        int i = 0;
        while (i < 350) {
            str_test = salloc(8);
            sprintf(str_test, "test%d", i + 2);
            
            DArray_push(darr_result, str_test);
            
            i++;
        }
        
        unit_test_length_exact(darr_result->max, (DARRAY_DEFAULT_EXPAND_RATE * 2) + 2, "DARRAY LENGTH");
        
        while (i > 0) {
            str_test = DArray_pop(darr_result);
            SFREE(str_test);
            
            i--;
        }
        
        DArray_clear_destroy(darr_result);
        unit_test_boolean(darr_result == NULL, "DARRAY DESTROY");
    }
    
    // DARRAY TEST 3
    // invalid arguments and misc functions
    {
        DArray *darr_result;
        bool bol_result;
        
        darr_result = DArray_create(0, 2);
        unit_test_boolean(darr_result == NULL, "DARRAY CREATE FAIL");
        
        darr_result = DArray_create(sizeof(char *), 0);
        unit_test_boolean(darr_result == NULL, "DARRAY CREATE FAIL");
        
        darr_result = DArray_create(0, 0);
        unit_test_boolean(darr_result == NULL, "DARRAY CREATE FAIL");
        
        darr_result = DArray_create(sizeof(char *), 2);
        unit_test_boolean(darr_result != NULL, "DARRAY CREATE");
        unit_test_boolean(DArray_clear(darr_result), "DARRAY CLEAR");
        
        DArray_destroy(darr_result);
        unit_test_boolean(darr_result == NULL, "DARRAY DESTROY");
        
        unit_test_boolean(! DArray_clear(NULL), "DARRAY CLEAR FAIL");
        
        //no worky
        //bol_result = DArray_destroy(NULL);
        bol_result = DArray_destroy(darr_result);
        unit_test_boolean(! bol_result, "DARRAY DESTROY FAIL");
        
        //no worky
        //bol_result = DArray_clear_destroy(NULL);
        bol_result = DArray_clear_destroy(darr_result);
        unit_test_boolean(! bol_result, "DARRAY CLEAR AND DESTROY FAIL");
        
        unit_test_boolean(! DArray_push(NULL, NULL), "DARRAY PUSH FAIL 1");
        unit_test_boolean(! DArray_push(NULL, "test1"), "DARRAY PUSH FAIL 2");
        unit_test_boolean(! DArray_pop(NULL), "DARRAY POP FAIL 1");
        unit_test_boolean(! DArray_set(NULL, 0, NULL), "DARRAY SET FAIL 1");
        unit_test_boolean(! DArray_set(NULL, 0, "test1"), "DARRAY SET FAIL 2");
        unit_test_boolean(! DArray_get(NULL, 0), "DARRAY GET FAIL");
        unit_test_boolean(! DArray_remove(NULL, 0), "DARRAY REMOVE FAIL");
        unit_test_boolean(! DArray_new(NULL), "DARRAY NEW FAIL");
        
        darr_result = split_cstr("test2,test1", ",");
        unit_test_boolean(darr_result != NULL, "DARRAY SPLIT_CSTR");
        
        bol_result = DArray_qsort(darr_result, (DArray_compare)darray_strcmp);
        unit_test_boolean(bol_result, "DARRAY QSORT");
        
        unit_test_boolean(! DArray_qsort(darr_result, NULL), "DARRAY QSORT FAIL 1");
        unit_test_boolean(! DArray_qsort(NULL, (DArray_compare)darray_strcmp), "DARRAY QSORT FAIL 2");
        unit_test_boolean(! DArray_qsort(NULL, NULL), "DARRAY QSORT FAIL 3");
        
        bol_result = DArray_clear_destroy(darr_result);
        unit_test_boolean(bol_result, "DARRAY CLEAR AND DESTROY");
        
        unit_test_boolean(! split_cstr(NULL, "test1"), "DARRAY SPLIT_CSTR FAIL");
        unit_test_boolean(! split_cstr("test1", NULL), "DARRAY SPLIT_CSTR FAIL");
        unit_test_boolean(! split_cstr(NULL, NULL), "DARRAY SPLIT_CSTR FAIL");
    }
    
    // TODO: error checks
    
    // ERROR UNIT TESTS
    
    // result of functions
    bool bol_error;
    char *str_response;
    
    // global error state functions
    bol_error_state = false;
    SFREE(str_global_error);
    
    // ERROR TEST 1
    bol_error = unit_test_error_1();
    unit_test_boolean(! bol_error, "ERROR SERROR RETURN");
    unit_test_boolean(bol_error_state, "ERROR SERROR STATE");
    unit_test_string(str_global_error, "test/unit_test_error.c:unit_test_error_1: test1\n", "ERROR SERROR MESSAGE");
    
    bol_error_state = false;
    SFREE(str_global_error);
    
    // ERROR TEST 2
    bol_error = unit_test_error_2();
    unit_test_boolean(bol_error, "ERROR SERROR_CHECK TRUE CONDITION RETURN");
    unit_test_boolean(! bol_error_state, "ERROR SERROR_CHECK TRUE CONDITION STATE");
    unit_test_string(str_global_error, NULL, "ERROR SERROR_CHECK TRUE CONDITION MESSAGE");
    
    bol_error_state = false;
    SFREE(str_global_error);
    
    // ERROR TEST 3
    bol_error = unit_test_error_3();
    unit_test_boolean(! bol_error, "ERROR SERROR_CHECK FALSE CONDITION RETURN");
    unit_test_boolean(bol_error_state, "ERROR SERROR_CHECK FALSE CONDITION STATE");
    unit_test_string(str_global_error, "test/unit_test_error.c:unit_test_error_3: test3\n", "ERROR SERROR_CHECK FALSE CONDITION MESSAGE");
    
    bol_error_state = false;
    SFREE(str_global_error);
    
    // ERROR TEST 4
    bol_error = unit_test_error_4();
    unit_test_boolean(! bol_error, "ERROR SWARN RETURN");
    unit_test_boolean(! bol_error_state, "ERROR SWARN STATE");
    unit_test_string(str_global_error, "test/unit_test_error.c:unit_test_error_4: test4\n", "ERROR SWARN MESSAGE");
    
    bol_error_state = false;
    SFREE(str_global_error);
    
    // ERROR TEST 5
    bol_error = unit_test_error_5();
    unit_test_boolean(bol_error, "ERROR SWARN_CHECK TRUE CONDITION RETURN");
    unit_test_boolean(! bol_error_state, "ERROR SWARN_CHECK TRUE CONDITION STATE");
    unit_test_string(str_global_error, NULL, "ERROR SWARN_CHECK TRUE CONDITION MESSAGE");
    
    bol_error_state = false;
    SFREE(str_global_error);
    
    // ERROR TEST 6
    bol_error = unit_test_error_6();
    unit_test_boolean(! bol_error, "ERROR SWARN_CHECK FALSE CONDITION RETURN");
    unit_test_boolean(! bol_error_state, "ERROR SWARN_CHECK FALSE CONDITION STATE");
    unit_test_string(str_global_error, "test/unit_test_error.c:unit_test_error_6: test6\n", "ERROR SWARN_CHECK FALSE CONDITION MESSAGE");
    
    bol_error_state = false;
    SFREE(str_global_error);
    
    // ERROR TEST 7
    bol_error = unit_test_error_7();
    unit_test_boolean(bol_error, "ERROR SERROR_NORESPONSE RETURN");
    unit_test_boolean(! bol_error_state, "ERROR SERROR_NORESPONSE STATE");
    unit_test_string(str_global_error, "test/unit_test_error.c:unit_test_error_7: test7\n", "ERROR SERROR_NORESPONSE MESSAGE");
    
    bol_error_state = false;
    SFREE(str_global_error);
    
    // ERROR TEST 8
    bol_error = unit_test_error_8();
    unit_test_boolean(bol_error, "ERROR SERROR_NORESPONSE_CHECK TRUE CONDITION RETURN");
    unit_test_boolean(! bol_error_state, "ERROR SERROR_NORESPONSE_CHECK TRUE CONDITION STATE");
    unit_test_string(str_global_error, NULL, "ERROR SERROR_NORESPONSE TRUE CONDITION MESSAGE");
    
    bol_error_state = false;
    SFREE(str_global_error);
    
    // ERROR TEST 9
    bol_error = unit_test_error_9();
    unit_test_boolean(bol_error, "ERROR SERROR_NORESPONSE_CHECK FALSE CONDITION RETURN");
    unit_test_boolean(! bol_error_state, "ERROR SERROR_NORESPONSE_CHECK FALSE CONDITION STATE");
    unit_test_string(str_global_error, "test/unit_test_error.c:unit_test_error_9: test9\n", "ERROR SERROR_NORESPONSE FALSE CONDITION MESSAGE");
    
    bol_error_state = false;
    SFREE(str_global_error);
    
    // ERROR FINISH 1
    str_response = unit_test_finish_1();
    unit_test_string(str_response, "FATAL\ntest1", "ERROR SFINISH RETURN");
    unit_test_boolean(bol_error_state, "ERROR SFINISH STATE");
    unit_test_string(str_global_error, NULL, "ERROR SFINISH MESSAGE");
    
    bol_error_state = false;
    SFREE(str_global_error);
    SFREE(str_response);
    
    // ERROR FINISH 2
    str_response = unit_test_finish_2();
    unit_test_string(str_response, "test2_success", "ERROR SFINISH_CHECK TRUE CONDITION RETURN");
    unit_test_boolean(! bol_error_state, "ERROR SFINISH_CHECK TRUE CONDITION STATE");
    unit_test_string(str_global_error, NULL, "ERROR SFINISH_CHECK TRUE CONDITION MESSAGE");
    
    bol_error_state = false;
    SFREE(str_global_error);
    SFREE(str_response);
    
    // ERROR FINISH 3
    str_response = unit_test_finish_3();
    unit_test_string(str_response, "FATAL\ntest3", "ERROR SFINISH_CHECK FALSE CONDITION RETURN");
    unit_test_boolean(bol_error_state, "ERROR SFINISH_CHECK FALSE CONDITION STATE");
    unit_test_string(str_global_error, NULL, "ERROR SFINISH_CHECK FALSE CONDITION MESSAGE");
    
    bol_error_state = false;
    SFREE(str_global_error);
    SFREE(str_response);
    
    // ERROR FINISH 4
    str_response = unit_test_finish_4();
    unit_test_string(str_response, "FATAL\ntest4", "ERROR SFINISH_ERROR RETURN");
    unit_test_boolean(bol_error_state, "ERROR SFINISH_ERROR STATE");
    unit_test_string(str_global_error, NULL, "ERROR SFINISH_ERROR MESSAGE");
    
    bol_error_state = false;
    SFREE(str_global_error);
    SFREE(str_response);
    
    // ERROR FINISH 5
    str_response = unit_test_finish_5();
    unit_test_string(str_response, "test5_success", "ERROR SFINISH_ERROR_CHECK TRUE CONDITION RETURN");
    unit_test_boolean(! bol_error_state, "ERROR SFINISH_ERROR_CHECK TRUE CONDITION STATE");
    unit_test_string(str_global_error, NULL, "ERROR SFINISH_ERROR_CHECK TRUE CONDITION MESSAGE");
    
    bol_error_state = false;
    SFREE(str_global_error);
    SFREE(str_response);
    
    // ERROR FINISH 6
    str_response = unit_test_finish_6();
    unit_test_string(str_response, "FATAL\ntest6", "ERROR SFINISH_ERROR_CHECK FALSE CONDITION RETURN");
    unit_test_boolean(bol_error_state, "ERROR SFINISH_ERROR_CHECK FALSE CONDITION STATE");
    unit_test_string(str_global_error, NULL, "ERROR SFINISH_ERROR_CHECK FALSE CONDITION MESSAGE");
    
    bol_error_state = false;
    SFREE(str_global_error);
    SFREE(str_response);
    
    // ERROR DEBUG 1
    unit_test_debug_1();
    unit_test_boolean(! bol_error_state, "ERROR SNOTICE STATE");
    unit_test_string(str_global_error, NULL, "ERROR SNOTICE MESSAGE");
    
    bol_error_state = false;
    SFREE(str_global_error);
    
    // ERROR DEBUG 2
    unit_test_debug_2();
    unit_test_boolean(! bol_error_state, "ERROR SINFO STATE");
    unit_test_string(str_global_error, NULL, "ERROR SINFO MESSAGE");
    
    bol_error_state = false;
    SFREE(str_global_error);
    
    // ERROR DEBUG 3
    unit_test_debug_3();
    unit_test_boolean(! bol_error_state, "ERROR SDEBUG STATE");
    unit_test_string(str_global_error, NULL, "ERROR SDEBUG MESSAGE");
    
    bol_error_state = false;
    SFREE(str_global_error);
    
    // JOSEPH TESTS ADDED ABOVE
    
    // JUSTIN TESTS ADDED BELOW
    
    // JUSTIN TESTS ADDED ABOVE
    
    
    
    // Every time error is set, it gets free'd first. So we only need this once at the end
    SFREE(str_global_error);
    
    // end of all tests
    printf(
        "\nSUCCEEDED: %d\nFAILED: %d\nTOTAL: %d\n"
        , int_global_success
        , int_global_fail
        , int_global_success + int_global_fail
    );
    
    if (int_global_fail > 0) {
        return(1);
    }
    
    return(0);
}

void unit_test_boolean(bool bol_provided, char *str_unit_test_name) {
    if (bol_provided) {
        // then success
        printf("SUCCEEDED: %s\n", str_unit_test_name);
        
        int_global_success++;
    } else {
        // else fail
        printf("FAILED: %s\n", str_unit_test_name);
        printf("    Boolean Test Failed\n\n");
        
        int_global_fail++;
    }
}

void unit_test_length_exact(size_t int_provided, size_t int_expected, char *str_unit_test_name) {
    if (
        (
            int_provided == int_expected
            && int_expected > 0
        )
    ) {
        // then success
        printf("SUCCEEDED: %s\n", str_unit_test_name);
        
        int_global_success++;
    } else {
        // else fail
        printf("FAILED: %s\n", str_unit_test_name);
        
        if (int_expected <= 0) {
            printf("    Expected must be greater than 0\n\n");
        } else if (int_provided <= 0) {
            printf("    Provided must be greater than 0\n\n");
        } else {
            printf("    Result: %d\n    Expected: %d\n\n", (int)int_provided, (int)int_expected);
        }
        
        int_global_fail++;
    }
}

void unit_test_length_greater(size_t int_provided, size_t int_expected, char *str_unit_test_name) {
    if (
        (
            int_provided > int_expected
            && int_expected > 0
        )
    ) {
        // then success
        printf("SUCCEEDED: %s\n", str_unit_test_name);
        
        int_global_success++;
    } else {
        // else fail
        printf("FAILED: %s\n", str_unit_test_name);
        
        if (int_expected <= 0) {
            printf("    Expected must be greater than 0\n\n");
        } else if (int_provided <= 0) {
            printf("    Provided must be greater than 0\n\n");
        } else {
            printf("    Result: %d\n    Expected: %d\n\n", (int)int_provided, (int)int_expected);
        }
        
        int_global_fail++;
    }
}

void unit_test_string(char *str_result, char *str_expected, char *str_unit_test_name) {
    if (
        // if both expect and return are NULL pointers
        (
            str_expected == NULL
            && str_result == NULL
        // or if strings match
        ) || (
            str_expected != NULL
            && str_result != NULL
            && strcmp(str_result, str_expected) == 0
        )
    ) {
        // then success
        printf("SUCCEEDED: %s\n", str_unit_test_name);
        
        int_global_success++;
    } else {
        // else fail
        printf("FAILED: %s\n", str_unit_test_name);
        
        if (str_expected == NULL) {
            printf("    Result: %s, Expected NULL pointer\n\n", str_result);
        } else if (str_result == NULL) {
            printf("    Result NULL pointer, Expected %s\n\n", str_expected);
        } else {
            printf("    Result: %s\n    Expected: %s\n\n", str_result, str_expected);
        }
        
        int_global_fail++;
    }
}

void unit_test_bstring(
    char *str_result
    , size_t int_result_len
    , char *str_expected
    , size_t int_expected_len
    , char *str_unit_test_name
) {
    if (
        // if both expect and return are NULL pointers
        (
            str_expected == NULL
            && str_result == NULL
        // or if strings match
        ) || (
            str_expected != NULL
            && str_result != NULL
            && int_result_len == int_expected_len
            && memcmp(str_result, str_expected, int_result_len) == 0
        )
    ) {
        // then success
        printf("SUCCEEDED: %s\n", str_unit_test_name);
        
        int_global_success++;
    } else {
        // else fail
        printf("FAILED: %s\n", str_unit_test_name);
        
        if (str_expected == NULL) {
            printf("    Result: %s, Expected NULL pointer\n\n", str_result);
        } else if (str_result == NULL) {
            printf("    Result NULL pointer, Expected %s\n\n", str_expected);
        } else if (int_result_len != int_expected_len) {
            printf(
                "    Result not the same length as Expected, Result %d, Expected %d\n\n"
                , (int)int_result_len
                , (int)int_expected_len
            );
        } else {
            printf("    Result: %s\n    Expected: %s\n\n", str_result, str_expected);
        }
        
        int_global_fail++;
    }
}
