#pragma once

#include <string.h>
#include <time.h>

#include "util_salloc.h"

/*
return date formatted for cookie
date is midnight for tomorrow
*/
char *str_expire_one_day();
/*
return date formatted for cookie
date is midnight for two days from now
*/
char *str_expire_two_day();
/*
return date formatted for cookie
date is midnight for 100 years from now
*/
char *str_expire_100_year();
