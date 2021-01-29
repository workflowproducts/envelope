#pragma once

#include <stdbool.h>

#include <ev.h>

#include "common_client.h"
#include "common_client_struct.h"
#include "db_framework.h"
#include "http_auth.h"
#include "http_ev.h"
#include "http_file.h"
#include "util_error.h"
#include "util_request.h"
#include "util_string.h"
#include <stdlib.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <unistd.h>
#include "http_accept.h"
#include "http_action.h"
#include "http_cgi.h"
#include "http_delete.h"
#include "http_insert.h"
#include "http_select.h"
#include "http_update.h"
#include "http_upload.h"

/*
This function does three things:
1. parse request
2. authenticate if in /env
3. delegate work to http_auth/http_export/http_file/http_upload/etc
*/
void http_main(EV_P, struct sock_ev_client *client);
