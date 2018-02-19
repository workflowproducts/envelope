# Installing envelope behind a relayd reverse proxy on OpenBSD

*Note: Assumes running envelope at `127.0.0.1:8888`, adjust your values accordingly.*

`/etc/relayd.conf`:
```
table <envelope> { 127.0.0.1 }

http protocol "protoenvelope" {
        match request quick header "Host" value "192.168.44.111" \
                forward to <envelope>

        tls { ciphers "MEDIUM:HIGH" }
}

relay "envelope" {
        listen on 0.0.0.0 port 443 tls
        protocol "protoenvelope"

        forward to <envelope> port 8888
}

```

### SSL Certificates

Relayd assumes that the ssl files are:
- `/etc/ssl/<address>.crt` or `/etc/ssl/<address>:<port>.crt`
- `/etc/ssl/private/<address>.key` or `/etc/ssl/private/<address>:<port>.key`

With `<address>` being `0.0.0.0` and `<port>` being `443` from the `listen` directive.

Relayd also requires RSA certificates ([ssl(8)](https://man.openbsd.org/ssl.8)).

To self sign a certificate, execute these commands:
```
# openssl genrsa -out /etc/ssl/private/0.0.0.0.key 2048
# openssl genrsa -aes256 -out /etc/ssl/private/0.0.0.0.key 2048
# openssl req -new -key /etc/ssl/private/0.0.0.0.key \ 
  -out /etc/ssl/private/0.0.0.0.csr
# openssl x509 -sha256 -req -days 365 \ 
  -in /etc/ssl/private/0.0.0.0.csr \ 
  -signkey /etc/ssl/private/0.0.0.0.key \ 
  -out /etc/ssl/0.0.0.0.crt
```
