#include "unit_test_error.h"

// ERROR TEST 1
bool unit_test_error_1() {
    char *str_result = str_expire_one_day();
    
    SERROR("test%d", 1);
    
    SFREE(str_result);
    
    return true;
error:
    SFREE(str_result);
    
    return false;
}

// ERROR TEST 2
bool unit_test_error_2() {
    SERROR_CHECK(true, "test%d", 2);
    
    return true;
error:
    return false;
}

// ERROR TEST 3
bool unit_test_error_3() {
    SERROR_CHECK(false, "test%d", 3);
    
    return true;
error:
    return false;
}

// ERROR TEST 4
bool unit_test_error_4() {
    SWARN("test%d", 4);
    
    return true;
error:
    return false;
}

// ERROR TEST 5
bool unit_test_error_5() {
    SWARN_CHECK(true, "test%d", 5);
    
    return true;
error:
    return false;
}

// ERROR TEST 6
bool unit_test_error_6() {
    SWARN_CHECK(false, "test%d", 6);
    
    return true;
error:
    return false;
}

// ERROR TEST 7
bool unit_test_error_7() {
    SERROR_NORESPONSE("test%d", 7);
    
    return true;
}

// ERROR TEST 8
bool unit_test_error_8() {
    SERROR_NORESPONSE_CHECK(true, "test%d", 8);
    
    return true;
}

// ERROR TEST 9
bool unit_test_error_9() {
    SERROR_NORESPONSE_CHECK(false, "test%d", 9);
    
    return true;
}

// FINISH TEST 1
char *unit_test_finish_1() {
    char *str_response = NULL;
    unsigned long int_response_len;
    SFINISH("test%d", 1);
    
    return str_response;
finish:
    if (int_response_len) {}
    return str_response;
}

// FINISH TEST 2
char *unit_test_finish_2() {
    char *str_response = NULL;
    unsigned long int_response_len;
    SFINISH_CHECK(true, "test%d", 2);
    
    SNCAT(
        str_response, &int_response_len
        , "test2_success", strlen("test2_success")
    );
    
    return str_response;
finish:
    if (int_response_len) {}
    return str_response;
}

// FINISH TEST 3
char *unit_test_finish_3() {
    char *str_response = NULL;
    unsigned long int_response_len;
    SFINISH_CHECK(false, "test%d", 3);
    
    return str_response;
finish:
    if (int_response_len) {}
    return str_response;
}

// FINISH TEST 4
char *unit_test_finish_4() {
    char *str_response = NULL;
    unsigned long int_response_len;
    SFINISH_ERROR("test%d", 4);
    
    return str_response;
finish:
    if (int_response_len) {}
    return str_response;
}

// FINISH TEST 5
char *unit_test_finish_5() {
    char *str_response = NULL;
    unsigned long int_response_len;
    SFINISH_ERROR_CHECK(true, "test%d", 5);
    
    SNCAT(
        str_response, &int_response_len
        , "test5_success", strlen("test2_success")
    );
    
    return str_response;
finish:
    if (int_response_len) {}
    return str_response;
}

// FINISH TEST 6
char *unit_test_finish_6() {
    char *str_response = NULL;
    unsigned long int_response_len;
    SFINISH_ERROR_CHECK(false, "test%d", 6);
    
    return str_response;
finish:
    if (int_response_len) {}
    return str_response;
}

// DEBUG TEST 1
void unit_test_debug_1() {
    SNOTICE("test%d", 1);
}

// DEBUG TEST 2
void unit_test_debug_2() {
    SINFO("test%d", 2);
}

// DEBUG TEST 3
void unit_test_debug_3() {
    SDEBUG("test%d", 3);
}
