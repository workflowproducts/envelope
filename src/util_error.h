#pragma once

#include "util_salloc.h"
#include "util_string.h"
#include <stdbool.h>
#include <stdlib.h>
#include <sys/types.h>
#include <time.h>
#include <unistd.h>

extern bool bol_error_state;
extern char *str_global_log_level;
extern char *str_global_logfile;
extern char *str_global_error;

#ifdef _WIN32
#define strerror_r(errno, buf, len) strerror_s(buf, len, errno)
#endif

#ifdef UTIL_DEBUG
#ifdef _WIN32
#define __FILENAME__ (strrchr(__FILE__, '\\') ? strrchr(__FILE__, '\\') + 1 : __FILE__)
#else
#define __FILENAME__ (strrchr(__FILE__, '/') ? strrchr(__FILE__, '/') + 1 : __FILE__)
#endif
#else
#define __FILENAME__ __FILE__
#endif

// #define ev_idle_init_debug(a, b) { debug_root(__FILENAME__, __LINE__, (char *)__func__, "ev_idle_init: %s, %x, %s", #a, a, #b); ev_idle_init(a, b); }
// #define ev_idle_start_debug(a, b) { debug_root(__FILENAME__, __LINE__, (char *)__func__, "ev_idle_start: %s, %x", #b, b); ev_idle_start(a, b); }
// #define ev_idle_stop_debug(a, b)  { if ((b)->active) { debug_root(__FILENAME__, __LINE__, (char *)__func__, "ev_idle_stop: %s, %x", #b, b); } ev_idle_stop(a, b);  }

// These are for developers and must be compiled in by adding "-DUTIL_DEBUG" to
// the compile options
// or by adding #define UTIL_DEBUG before including this file
void debug_root(char *str_file, int int_line_no, char *str_function, char *str_error, ...);
#ifdef UTIL_DEBUG
#define SDEBUG(M, ...) debug_root(__FILENAME__, __LINE__, (char *)__func__, M, ##__VA_ARGS__)
#define SVAR(M, ...) var_root(__FILENAME__, __LINE__, (char *)__func__, M, ##__VA_ARGS__)
#else
#define SDEBUG(M, ...)
#define SVAR(M, ...)
#endif /* UTIL_DEBUG */

/*
Near end of a function there is typically an
error:
or a
finish:
goto label.
This is a erroring standard that we have implemented for C functions.
You can do error checks like this
SERROR_CHECK(SUCCESS_CONDITION, "Error occured: %s", ...);
If the `SUCCESS_CONDITION` evaluates to true, there is no error.
But if it is false then is will raise an error then it will `goto error`.
The `SFINISH_` functions are slightly different, not only will they raise
an error but it will also copy the error into `str_response` before the
goto statement. Also, the goto statement must be `finish:` instead of
`error:`. If a function returns a response, use `finish:`.
In the function after the goto, make sure everything allocated in the
function is `free`'d. Now if there is an error, you will get no memory
errors and you will have a sane log.

Global variables you can check:
extern bool bol_error_state;
extern char *str_global_error;

Checking macros:
Some have a SUCCESS_CONDITION, others don't.
If you want to write the conditional yourself then use the one without.


// error
// use for an error that fails the function
// set bol_error_state
// set str_global_error
// goto error
SERROR("%s %d %f etc", ...);
SERROR_CHECK(SUCCESS_CONDITION, "Error occured: %s", ...);

// error
// use for an error that DOES NOT fail the function
// set bol_error_state
// set str_global_error
// DOES NOT goto error
SERROR_NORESPONSE("%s %d %f etc", ...);
SERROR_NORESPONSE_CHECK(SUCCESS_CONDITION, "Error occured: %s", ...);

// warn
// use for a warning that is not technically an error but does need to goto
// DOES NOT set bol_error_state
// set str_global_error
// goto error
SWARN("%s %d %f etc", ...);
SWARN_CHECK(SUCCESS_CONDITION, "Error occured: %s", ...);

// finish
// use to return a response from a function
// DOES NOT set bol_error_state
// set str_global_error
// goto finish
SFINISH("%s %d %f etc", ...);
SFINISH_CHECK(SUCCESS_CONDITION, "Error occured: %s", ...);

// equivilent to above, but at "warn" logging level
// use to return a response from a function
// DOES NOT set bol_error_state
// set str_global_error
// goto finish
SFINISH_ERROR("%s %d %f etc", ...);
SFINISH_ERROR_CHECK(SUCCESS_CONDITION, "Error occured: %s", ...);

// debug
// Debugging a specific problem
// Normally this macro gets removed entirely, but can be enabled on compilation with UTIL_DEBUG
// no goto, no global variables set, just send to log
SDEBUG("%s %d %f etc", ...);

// Typical debugging levels
// no goto, no global variables set, just send to log
SINFO("%s %d %f etc", ...);
SNOTICE("%s %d %f etc", ...);
*/

/*
DO NOT USE VAR() THAT WILL BE DONE AUTOMATICALLY WITH SFREE_ALL()!
*/

// There are the user configurable debug options
void var_root(char *str_file, int int_line_no, char *str_function, char *str_error, ...);
void info_root(char *str_file, int int_line_no, char *str_function, char *str_error, ...);
#define SINFO(M, ...) info_root(__FILENAME__, __LINE__, (char *)__func__, M, ##__VA_ARGS__)
void notice_root(char *str_file, int int_line_no, char *str_function, char *str_error, ...);
#define SNOTICE(M, ...) notice_root(__FILENAME__, __LINE__, (char *)__func__, M, ##__VA_ARGS__)
void warn_root(char *str_file, int int_line_no, char *str_function, char *str_error, ...);
#define SWARN_NORESPONSE(M, ...) warn_root(__FILENAME__, __LINE__, (char *)__func__, M, ##__VA_ARGS__);
void always_log_root(char *str_file, int int_line_no, char *str_function, char *str_error, ...);
#define SALWAYS_LOG(M, ...) always_log_root(__FILENAME__, __LINE__, (char *)__func__, M, ##__VA_ARGS__);

void error_noresponse_root(char *str_file, int int_line_no, char *str_function, char *str_error, ...);
#define SERROR_NORESPONSE(M, ...) error_noresponse_root(__FILENAME__, __LINE__, (char *)__func__, M, ##__VA_ARGS__);
#define SERROR(M, ...)                                                                                                           \
	bol_error_state = true;                                                                                                      \
	SERROR_NORESPONSE(M, ##__VA_ARGS__);                                                                                         \
	goto error;

#define SWARN(M, ...)                                                                                                            \
	SWARN_NORESPONSE(M, ##__VA_ARGS__);                                                                                          \
	goto error;

char *error_response_root(char *str_file, int int_line_no, char *str_function, char *str_error, ...);
#define SERROR_RESPONSE(M, ...) error_response_root(__FILENAME__, __LINE__, (char *)__func__, M, ##__VA_ARGS__)
char *warn_response_root(char *str_file, int int_line_no, char *str_function, char *str_error, ...);
#define SWARN_RESPONSE(M, ...) warn_response_root(__FILENAME__, __LINE__, (char *)__func__, M, ##__VA_ARGS__)
//#define FINISH(M, ...)  bol_error_state = true; ERROR_RESPONSE(M,
//##__VA_ARGS__); goto finish;
#define SFINISH(M, ...)                                                                                                          \
	bol_error_state = true;                                                                                                      \
	SFREE(str_response);                                                                                                         \
	str_response = SWARN_RESPONSE(M, ##__VA_ARGS__);                                                                             \
	int_response_len = strlen(str_response);                                                                                     \
	goto finish;

#define SFINISH_ERROR(M, ...)                                                                                                    \
	bol_error_state = true;                                                                                                      \
	SFREE(str_response);                                                                                                         \
	str_response = SERROR_RESPONSE(M, ##__VA_ARGS__);                                                                            \
	int_response_len = strlen(str_response);                                                                                     \
	goto finish;

#define SERROR_NORESPONSE_CHECK(A, M, ...)                                                                                       \
	if (!(A)) {                                                                                                                  \
		SERROR_NORESPONSE(M, ##__VA_ARGS__);                                                                                     \
	}
#define SERROR_CHECK(A, M, ...)                                                                                                  \
	if (!(A)) {                                                                                                                  \
		SERROR(M, ##__VA_ARGS__);                                                                                                \
	}
#define SWARN_CHECK(A, M, ...)                                                                                                   \
	if (!(A)) {                                                                                                                  \
		SWARN(M, ##__VA_ARGS__);                                                                                                 \
	}
#define SFINISH_CHECK(A, M, ...)                                                                                                 \
	if (!(A)) {                                                                                                                  \
		SFINISH(M, ##__VA_ARGS__);                                                                                               \
	}
#define SFINISH_ERROR_CHECK(A, M, ...)                                                                                           \
	if (!(A)) {                                                                                                                  \
		SFINISH_ERROR(M, ##__VA_ARGS__);                                                                                         \
	}
