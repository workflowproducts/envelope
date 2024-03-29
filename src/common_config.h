#pragma once

#include <stdbool.h>
#include <stdio.h>
#include "db_framework.h"
#ifdef _WIN32
#include "util_getopt.h"
#include <windows.h>
//#include <WinBase.h>
#else
#include <getopt.h>
#include <pwd.h>
#include <grp.h>
#endif
#ifdef __linux__
#include <sys/capability.h>
#include <sys/prctl.h>
#endif
#include "util_canonical.h"
#include "util_darray.h"
#include "util_error.h"
#include "util_ini.h"

#define SUN_PROGRAM_LOWER_NAME "envelope"
#define SUN_PROGRAM_WORD_NAME "Envelope"
#define SUN_PROGRAM_UPPER_NAME "ENVELOPE"

extern char *str_global_config_file;
extern char *str_global_connection_file;
extern char *str_global_login_group;
extern char *str_global_web_root;
extern char *str_global_port;
extern bool bol_global_local_only;
extern bool bol_global_super_only;
extern bool bol_global_allow_public_login;
extern char *str_global_set_uname;
extern char *str_global_set_gname;

extern DArray *darr_global_connection;
extern size_t int_global_login_timeout;
extern uint64_t int_global_session_id;

extern char *str_global_public_username;
extern char *str_global_public_password;
extern bool bol_global_set_user;

extern char *str_global_app_path;
extern char *str_global_role_path;

extern char *str_global_api_referer_list;
extern char *str_global_public_api_referer_list;
extern char *str_global_2fa_function;
extern size_t int_global_2fa_timeout;

extern char cwd[1024];
#ifdef _WIN32
extern const char *VERSION;
extern char *ENVELOPE_PREFIX;

#ifndef ENVELOPE_INTERFACE_LIBPQ
extern char *str_global_nt_domain;
#endif
#endif

struct struct_connection {
	char *str_connection_name;
	char *str_connection_info;
	char *str_connection_database;
};
/*
This function free()s a struct_connection and it's members
*/
void connection_free(struct struct_connection *connection);

char *get_connection_info();

/*
This function parses the connection file the user supplied
*/
bool parse_connection_file();

/*
This function reads the options from the command line and the config file
*/
bool parse_options(int argc, char *const *argv);

/*
This function prints the usage and exits
*/
void usage();
