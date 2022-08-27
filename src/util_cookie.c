#include "util_cookie.h"

// return date formatted for cookie, midnight
// result must be free'd
char *str_expire_one_day() {
	time_t time_next_day;
	struct tm tm_next_day_result;
	struct tm *tm_next_day;
	time_t return_time_t;
	struct tm tm_return_time_result;
	struct tm *tm_return_time;
	
	char *str_return;
	SERROR_SALLOC(str_return, 50);
	
	// advance 24 hours
	time(&time_next_day);
	time_next_day = time_next_day + (24 * 60 * 60);
	
	// convert to localtime before setting to midnight, then back to gmt time
	tm_next_day = &tm_next_day_result;
	
#ifdef _WIN32
	localtime_s(tm_next_day, &time_next_day);
#else
	localtime_r(&time_next_day, tm_next_day);
#endif
	
	tm_next_day->tm_sec = 0;
	tm_next_day->tm_min = 0;
	tm_next_day->tm_hour = 0;
	
	return_time_t = mktime(tm_next_day);
	
	tm_return_time = &tm_return_time_result;
#ifdef _WIN32
	gmtime_s(tm_return_time, &return_time_t);
#else
	gmtime_r(&return_time_t, tm_return_time);
#endif
	
	// convert to string for return
	strftime(str_return, 50, "%a, %d %b %Y %H:%M:%S %Z", tm_return_time);
	
	// HARK YE ONLOOKER: GOOGLE CHROME DOES NOT UNDERSTAND ANYTHING BUT GMT TIME
	// ZONES! DO NOT USE OTHER TIME ZONES!
	return str_return;
error:
	SFREE(str_return);
	return NULL;
}

// return date formatted for cookie, 100 years in the future
// 100 years should be good enough to not expire
// if it does end up expiring let me know
// result must be free'd
char *str_expire_100_year() {
	time_t time_next_day;
	struct tm tm_next_day_result;
	struct tm *tm_next_day;
	time_t return_time_t;
	struct tm tm_return_time_result;
	struct tm *tm_return_time;
	
	char *str_return = NULL;
	SERROR_SALLOC(str_return, 50);
	
	// advance 100 years
	time(&time_next_day);
	time_next_day = time_next_day + ((time_t)24 * 60 * 60 * 365 * 100);
	
	tm_next_day = &tm_next_day_result;
#ifdef _WIN32
	localtime_s(tm_next_day, &time_next_day);
#else
	localtime_r(&time_next_day, tm_next_day);
#endif
	
	return_time_t = mktime(tm_next_day);
	
	tm_return_time = &tm_return_time_result;
#ifdef _WIN32
	gmtime_s(tm_return_time, &return_time_t);
#else
	gmtime_r(&return_time_t, tm_return_time);
#endif
	
	// convert to string for return
	strftime(str_return, 50, "%a, %d %b %Y %H:%M:%S %Z", tm_return_time);
	
	// HARK YE ONLOOKER: GOOGLE CHROME DOES NOT UNDERSTAND ANYTHING BUT GMT TIME
	// ZONES! DO NOT USE OTHER TIME ZONES!
	return str_return;
error:
	SFREE(str_return);
	return NULL;
}
