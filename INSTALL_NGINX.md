# Installing NGINX as a Reverse Proxy for Envelope

Add to your `nginx.conf` under the `http` section:
```
server {
        listen                          443;
        server_name                     domain-name.com;

        ssl                             on;
        ssl_certificate                 /path/to/domain-name.com.crt;
        ssl_certificate_key             /path/to/domain-name.com.key;
        ssl_session_cache               shared:SSL:20m;
        ssl_session_timeout             5m;
        ssl_protocols                   TLSv1.2 TLSv1.1 TLSv1;
        ssl_ciphers                     ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!3DES:!MD5:!PSK;
        ssl_prefer_server_ciphers       on;

        gzip                            on;
        gzip_types                      *;

        location / {
                proxy_pass              http://127.0.0.1:8888;
                proxy_http_version      1.1;
                proxy_set_header        Upgrade $http_upgrade;
                proxy_set_header        Connection "upgrade";
                proxy_connect_timeout   300s;
                proxy_send_timeout      300s;
                proxy_read_timeout      1d;
                send_timeout            300s;
        }
}
````

