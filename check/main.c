#include <stdio.h>
#include "util_string.h"

int main(int argc, char *const *argv) {
	char *str_return = NULL;
	size_t int_return = 0;
	SERROR_SNCAT(str_return, &int_return, "test1", (size_t)5);
	printf(">%zu|%s<\n", int_return, str_return);

	printf(">%zu<\n", *&int_return);
	SERROR_SNFCAT(str_return, &int_return, "test2", (size_t)5);
	printf(">%zu|%s<\n", int_return, str_return);

	SFREE(str_return);

	SERROR_SNCAT(str_return, &int_return, "te\0t1", (size_t)5, "te\0t2", (size_t)5, "te\0t3", (size_t)5, "te\0t4", (size_t)5);
	printf(">%zu|%s<\n", int_return, str_return);

	SERROR_SNFCAT(str_return, &int_return, "test5", (size_t)5);
	printf(">%zu|%s<\n", int_return, str_return);

	SFREE(str_return);

	SERROR_SNCAT(str_return, &int_return, "test1", (size_t)5);
	printf(">%zu|%s<\n", int_return, str_return);

	SERROR_SNFCAT(str_return, &int_return, "test2", (size_t)5, "test3", (size_t)5, "test4", (size_t)5);
	printf(">%zu|%s<\n", int_return, str_return);

	SFREE(str_return);

	return 0;
error:
	return 1;
}
