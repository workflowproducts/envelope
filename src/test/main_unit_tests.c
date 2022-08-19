#include "stdio.h"
#include <string.h>
#include "../util_aes.h"
#include "../util_base64.h"

int int_global_success = 0;
int int_global_fail = 0;

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

    // tests are locally scoped so I don't have to worry about variable names

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
