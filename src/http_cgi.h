#pragma once

#include "http_main.h"

void http_cgi_step1(EV_P, struct sock_ev_client *client);
bool http_cgi_step2(EV_P, void *cb_data, DB_result *res);
void http_cgi_step3(EV_P, ev_io *w, int revents);
