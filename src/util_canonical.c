#include "util_canonical.h"

static bool path_valid_char(char *str_path);
static bool is_file(char *filepath);
static bool is_dir(char *str_filepath);

// windows polyfill
#ifdef _WIN32

// PATH_MAX is the unix name, so we polyfill it for the rest of the file
#define PATH_MAX MAX_PATH

char *realpath(char *N, char *R) {
	char *str_return = _fullpath((R), (N), PATH_MAX);
	if (str_return != NULL) {
		struct stat s;
		stat(str_return, &s); // to fill errno if applicable
	}

	return str_return;
}

#pragma comment(lib, "Shlwapi.lib")

// replicates mkdir -p
int mkpath(char *str_file_path) {
	char *p;
	// loop through folders
	for (p = strchr(str_file_path + (str_file_path[1] == ':' ? 3 : 1), '\\'); p; p = strchr(p + 1, '\\')) {
		SDEBUG("p: %s", p);
		*p = 0;
		SDEBUG("mkdir(%s)", str_file_path);
		errno = 0;
		// make folder
		if (mkdir(str_file_path) == -1) {
			//do not error if already exists, but do error on all other errors
			if (errno != EEXIST) {
				*p = '\\';
				return -1;
			}
		}
		errno = 0;
		*p = '\\';
	}
	return 0;
}

#endif

// ############ EXTERNAL FUNCTION DEFINITIONS ####################

char *canonical(const char *str_input_base_path, char *str_input_path, char *str_input_check_type) {
	// str_base_path: copy of input file base
	// str_path: copy of input file path
	// str_full_path: combined path
	// str_canonical_filename: for variable returned from realpath
	// str_temp: used in win32 for appending to an existing variable
#ifdef _WIN32
	SDEFINE_VAR_ALL(str_base_path, str_path, str_full_path, str_canonical_filename, str_temp);
#else
	SDEFINE_VAR_ALL(str_base_path, str_path, str_full_path, str_canonical_filename);
#endif

	char *str_return = NULL;
	
	//used to check result of realpath
	char *str_realpath_result;
	
	//used to move past unnecessary leading characters before duplicating into str_path
	char *ptr_input_path = str_input_path;

	bool bol_path_exists = false;

	size_t int_file_base_len = 0;
	size_t int_path_len = 0;
	size_t int_len = 0;
	size_t int_return_len = 0;
	size_t int_canonical_filename_len = 0;

	struct stat statdata;
	
	SWARN_CHECK(
		str_input_base_path != NULL
		, "Input str_base_path is required.\012"
	);
	
	SWARN_CHECK(
		str_input_path != NULL
		, "Input str_path is required.\012"
	);
	
	SWARN_CHECK(
		str_input_check_type != NULL
		, "Input str_check_type is required.\012"
	);
	
	SERROR_CHECK(
		   strncmp(str_input_check_type, "write_file", 11) == 0
		|| strncmp(str_input_check_type, "read_file", 10) == 0
		|| strncmp(str_input_check_type, "read_dir", 9) == 0
		|| strncmp(str_input_check_type, "create_dir", 11) == 0
		|| strncmp(str_input_check_type, "read_dir_or_file", 17) == 0
		|| strncmp(str_input_check_type, "valid_path", 11) == 0
		, "%s is not a valid str_check_type.\012"
		, str_input_check_type
	);
	
	// copy str_input_base_path to str_base_path
	SERROR_SNCAT(
		str_base_path, &int_file_base_len
		, str_input_base_path, strlen(str_input_base_path)
	);

#ifdef _WIN32
	// append / to end of str_base_path if necessary
	if ((int_file_base_len == 0 || str_base_path[int_file_base_len - 1] != '\\') &&
		(int_file_base_len == 0 || str_base_path[int_file_base_len - 1] != '/')) {
		SERROR_SNFCAT(
			str_base_path, &int_file_base_len
			, "\\", (size_t)1
		);
	}
	
	// advance past system drive if applicable
	if (ptr_input_path[1] == ':') {
		ptr_input_path += 2;
	}
	
	// advance past leading slashes
	while (ptr_input_path[0] == '\\' || ptr_input_path[0] == '/') {
		ptr_input_path += 1;
	}
	
	// copy input path to str_path
	SERROR_SNCAT(
		str_path, &int_path_len,
		ptr_input_path, strlen(ptr_input_path)
	);
	
	//replace replace forward slashes with back slashes for windows
	ptr_input_path = str_path;
	while (*ptr_input_path != 0) {
		if (*ptr_input_path == '/') {
			*ptr_input_path = '\\';
		}
		ptr_input_path += 1;
	}

	//if we do not have a system drive on the file base, then add a system drive
	if (str_base_path[1] != ':') {
		char *str_system_drive = getenv("SystemDrive"); //result not safe to modify
		SERROR_CHECK(str_system_drive != NULL, "getenv for SystemDrive failed!");

		SERROR_SNCAT(
			str_temp, &int_file_base_len
			, str_system_drive, strlen(str_system_drive)
			, str_base_path, int_file_base_len
		);

		SFREE(str_base_path);
		str_base_path = str_temp;
		str_temp = NULL;
	}
#else
	// append / to end of str_base_path if necessary
	if (int_file_base_len == 0 || str_base_path[int_file_base_len - 1] != '/') {
		SERROR_SNFCAT(
			str_base_path, &int_file_base_len,
			"/", (size_t)1
		);
	}
	
	// because we have a trailing slash on the str_base_path
	// we don't want a leading slash on the path
	while (ptr_input_path[0] == '/') {
		ptr_input_path += 1;
	}
	
	// copy input path to str_path
	SERROR_SNCAT(
		str_path, &int_path_len,
		ptr_input_path, strlen(ptr_input_path)
	);
#endif
	
	// if no str_path to canonicalize was provided then just return str_base_path
	if (
		str_path[0] == 0
	) {
		SERROR_SNCAT(
			str_return, &int_return_len,
			str_base_path, int_file_base_len
		);
		SFREE_ALL();
		return str_return;
	}
	
	// build str_full_path
	SERROR_SNCAT(
		str_full_path, &int_len,
		str_base_path, int_file_base_len,
		str_path, int_path_len
	);
	
	/*
	SINFO("str_input_base_path: \"%s\"", str_input_base_path);
	SINFO("str_input_path: \"%s\"", str_input_path);
	SINFO("str_base_path: \"%s\"", str_base_path);
	SINFO("str_path: \"%s\"", str_path);
	SINFO("str_full_path: \"%s\"", str_full_path);
	*/
	
	//clear errno
	errno = 0;
	
	// check for invalid str_path chars
	SWARN_CHECK(path_valid_char(str_full_path), "%s is a bad path. Path contains invalid characters.\012", str_path);
	
	// check str_path length
	SWARN_CHECK(!(strlen(str_full_path) > PATH_MAX - 1), "%s is a bad path. Path exceeds maximum length.\012", str_path);
	
	// realpath expands symbolic links and resolves references to /./ /../
	errno = 0;
	SERROR_SALLOC(str_canonical_filename, PATH_MAX);
	str_realpath_result = realpath(str_full_path, str_canonical_filename);
	// 2 is ENOENT, 22 is EINVAL
#ifdef __OpenBSD__
	SWARN_CHECK((errno == 0 && str_realpath_result != NULL) || errno == 2 || errno == 22, "realpath failed: %d (%s)", errno, strerror(errno));
#else
	SWARN_CHECK((errno == 0 && str_realpath_result != NULL) || errno == 2, "realpath failed: %d (%s)", errno, strerror(errno));
#endif
	
	errno = 0;
	memset(&statdata, 0, sizeof(struct stat));
	stat(str_canonical_filename, &statdata);
	
	// save whether or not we found a file/folder at the str_path (errno = 2 means file does not exist)
	if (errno == 2) {
		bol_path_exists = false;
	} else if (errno == 0) {
		bol_path_exists = true;
	} else {
		SWARN("stat failed: %d (%s)", errno, strerror(errno));
	}
	int_canonical_filename_len = strlen(str_canonical_filename);

	// DO NOT COMMENT, THIS IS SO THAT THE ERROR DOES NOT PROPOGATE
	errno = 0;

	// check base of the resolved str_path with str_base_path if they do not match
	//      the str_path is out of the allowed directory therefore we must error
	// SDEBUG("str_canonical_filename: %s", str_canonical_filename);
	SWARN_CHECK(
		str_canonical_filename[0] != 0 && strncmp(str_canonical_filename, str_base_path, strlen(str_base_path)) == 0
		, "%s|%s is a bad path. Path is not in a valid base directory (resolves to >%s<).\012"
		, str_base_path
		, str_path
		, str_canonical_filename
	);

	// check str_input_check_type for which additional checks are necessary
	if (strncmp(str_input_check_type, "write_file", 11) == 0) {
		// check to make sure it is a file (or does not exist)
		if (bol_path_exists) {
			SWARN_CHECK(
				is_file((char *)str_canonical_filename)
				, "%s|%s is a bad path. Path is not a file.\012"
				, str_input_base_path
				, str_path
			);

		// if no such file exists create any directories that are needed
		} else {
#ifdef _WIN32
			// mkpath modifies input variable, so use str_temp
			SERROR_SNCAT(
				str_temp, &int_canonical_filename_len,
				str_canonical_filename, int_canonical_filename_len
			);
			
			char *ptr_last_slash = strrchr(str_temp, '\\');
			
			SDEBUG("str_temp>%s<", str_temp);
			SDEBUG("ptr_last_slash: %s", str_temp);
			
			SERROR_CHECK(ptr_last_slash != NULL, "strrchr failed");
			
			*(ptr_last_slash + 1) = 0;
			
			SDEBUG("mkpath>%s<", str_temp);
			
			mkpath(str_temp);
#else
 			int limit_mkdir = 20;
			
 			// while fullpath is short, create directory
 			while (strncmp(str_canonical_filename, str_full_path, strlen(str_full_path)) != 0 && limit_mkdir > 0) {
 				SDEBUG("mkdir>%s|%s<", str_canonical_filename, str_full_path);
 				SERROR_CHECK(
 					mkdir(str_canonical_filename, S_IRWXU | S_IRWXG) == 0
					, "%s is a bad path. Directory creation error.\012"
					, str_path
				);
				
 				realpath(str_full_path, str_canonical_filename);
				
 				limit_mkdir -= 1;
 			}
#endif

			errno = 0;
			SERROR_SNCAT(str_return, &int_return_len,
				str_full_path, int_len);
			SFREE_ALL();
			return str_return;
		}

	} else if (strncmp(str_input_check_type, "read_file", 10) == 0) {
		// check to make sure str_path exists if it does not: error
		SWARN_CHECK(
			bol_path_exists
			, "%s: %s|%s is a bad path. Path does not exist.\012"
			, str_input_check_type
			, str_base_path
			, str_path
		);

		// check to make sure str_path is a file if it is not: error
		SWARN_CHECK(
			is_file((char *)str_canonical_filename)
			, "%s: %s|%s is a bad path. Path is not a file.\012"
			, str_input_check_type
			, str_base_path
			, str_path
		);

	} else if (strncmp(str_input_check_type, "read_dir", 9) == 0) {
		// check to make sure str_path exists if it does not: error
		SWARN_CHECK(
			bol_path_exists
			, "%s: %s|%s is a bad path. Path does not exist.\012"
			, str_input_check_type
			, str_base_path
			, str_path
		);

		SWARN_CHECK(
			is_dir((char *)str_canonical_filename)
			, "%s: %s|%s is a bad path. Path is not a folder.\012"
			, str_input_check_type
			, str_base_path
			, str_path
		);

	} else if (strncmp(str_input_check_type, "create_dir", 11) == 0) {
		// check to make sure str_path does not exist if it does: error
		SWARN_CHECK(
			!bol_path_exists
			, "%s: %s|%s is a bad path. Path already exists.\012"
			, str_input_check_type
			, str_base_path
			, str_path
		);

// if no such directory exists: create it
#ifdef _WIN32
		SERROR_CHECK(
			0 == mkpath(str_canonical_filename)
			, "%s: %s|%s is a bad path. Directory creation error.\012"
			, str_input_check_type
			, str_base_path
			, str_path
		);
		
		errno = 0;
		
		SERROR_CHECK(
			0 == _mkdir(str_canonical_filename) || errno == EEXIST
			, "%s: %s|%s is a bad path. Directory creation error.\012"
			, str_input_check_type
			, str_base_path
			, str_path
		);
#else
		SERROR_CHECK(
			0 == mkdir(str_canonical_filename, S_IRWXU | S_IRWXG)
			, "%s: %s|%s is a bad path. Directory creation error.\012"
			, str_input_check_type
			, str_base_path
			, str_path
		);
#endif

	} else if (strncmp(str_input_check_type, "read_dir_or_file", 17) == 0) {
		// check to make sure str_path exists if it does not: error
		SWARN_CHECK(
			bol_path_exists
			, "%s: %s|%s is a bad path. Path does not exist.\012"
			, str_input_check_type
			, str_base_path
			, str_path
		);

	// unnecessary because we moved the error condition to the beginning of the function
	//} else if (strncmp(str_input_check_type, "valid_path", 11) == 0) {
	}
	
	SERROR_SNCAT(
		str_return, &int_return_len
		, str_canonical_filename, int_canonical_filename_len
	);
	
	SFREE_ALL();
	return str_return;
error:
	SFREE_ALL();
	SFREE(str_return);
	return NULL;
}

// ###############################################################################################################
// ###############################################################################################################
// ######################################## INTERNAL FUNCTION DEFINITIONS
// ########################################
// ###############################################################################################################
// ###############################################################################################################

// check to see if str_path is a file
static bool is_file(char *str_filepath) {
#ifdef _WIN32
	return PathIsDirectoryA(str_filepath) != FILE_ATTRIBUTE_DIRECTORY;
#else
	struct stat st;
	errno = 0;
	int fd = open(str_filepath, O_NOFOLLOW | O_RDONLY);
	SWARN_CHECK(fd != -1, "open failed: %d (%s)", errno, strerror(errno));

	// ######### CHECK LINKS #########
	SWARN_CHECK(fstat(fd, &st) == 0, "fstat failed: %d (%s)", errno, strerror(errno));

	// ######### EXCLUDE MULTIPLE HARD LINKS #########
	SWARN_CHECK(st.st_nlink <= 1, "Multiple Hard Links");

	// ######### EXCLUDE SYMBOLIC LINKS #########
	SWARN_CHECK(S_ISREG(st.st_mode), "Symbolic Links");

	return close(fd) == 0;

error:
	if (fd) {
		close(fd);
	}
	errno = 0;
	return false;
#endif
}

// check to see if str_path is a directory
static bool is_dir(char *str_filepath) {
#ifdef _WIN32
	return PathIsDirectoryA(str_filepath) == FILE_ATTRIBUTE_DIRECTORY;
#else
	struct stat st;
	errno = 0;

	// ######### CHECK LINKS #########
	SWARN_CHECK(stat(str_filepath, &st) == 0, "fstat failed: %d (%s)", errno, strerror(errno));

	// ######### EXCLUDE SYMBOLIC LINKS #########
	SWARN_CHECK(S_ISDIR(st.st_mode), "Symbolic Links");

	return true;

error:
	errno = 0;
	return false;
#endif
}

// check for invalid characters in str_path
// non-ascii characters not allowed
static bool path_valid_char(char *str_path) {
	// ######### EXCLUDE NON-ASCII ######
	char *ptr_input_path = str_path;
	char *ptr_path_end = str_path + strlen(str_path);
	char chr_path;

	while (ptr_input_path < ptr_path_end) {
		chr_path = *ptr_input_path;
		if (!((chr_path >= 'a' && chr_path <= 'z') || (chr_path >= 'A' && chr_path <= 'Z') ||
				(chr_path >= '0' && chr_path <= '9') || chr_path == '%' || chr_path == '&' || chr_path == '+' ||
				chr_path == ',' || chr_path == '.' || chr_path == ':' || chr_path == '=' || chr_path == '_' || chr_path == '/' ||
				chr_path == ' ' || chr_path == '-' || chr_path == '\\'
#ifdef _WIN32
				|| chr_path == '(' || chr_path == ')'
#endif
				)) {
			SWARN("%s is a bad str_path. Only standard ascii characters are allowed. (%c)", str_path, *ptr_input_path);
		}
		ptr_input_path++;
	}

	// SWARN_CHECK(sunny_regex("^([A-Za-z0-9\%&+,.:=_/ -])*$", str_path),
	//	"%s is a bad str_path. Only standard ascii characters are allowed.",
	// str_path);

	// ######### EXCLUDE ".GIT" #########
	SWARN_CHECK(strstr(str_path, ".git") == NULL, "%s is a bad str_path. '.git' not allowed.", str_path);
	// SWARN_CHECK(!sunny_regex("\\.git", str_path), "%s is a bad str_path. '.git' not
	// allowed.",
	// str_path);

	// ######### EXCLUDE "--"   #########
	SWARN_CHECK(strstr(str_path, "--") == NULL, "%s is a bad str_path. '--' not allowed.", str_path);
	// SWARN_CHECK(!sunny_regex("--", str_path), "%s is a bad str_path. '--' not
	// allowed.",
	// str_path);

	// ######### EXCLUDE "//"   #########
	SWARN_CHECK(strstr(str_path, "\\\\") == NULL, "%s is a bad str_path. '\\\\' not allowed.", str_path);
	SWARN_CHECK(strstr(str_path, "//") == NULL, "%s is a bad str_path. '//' not allowed.", str_path);
	// SWARN_CHECK(!sunny_regex("//", str_path), "%s is a bad str_path. '//' not
	// allowed.",
	// str_path);

	return true;
error:
	return false;
}
