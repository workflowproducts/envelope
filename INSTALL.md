# Installing Envelope

## Dependencies

### LIBPQ
In order for Envelope to talk to PostgreSQL you need to have the libpq library installed. If you don't have LibPQ or the Envelope compile process can't find it, please consult the file INSTALL_LIBPQ for some OS-specific advice on how to get libpq.

### SSL
Envelope does not listen on https, but it does need SSL libraries to encrypt the cookie.

Envelope works with OpenSSL or LibreSSL, if you wish to use OpenSSL:
```
sudo apt install libssl-devel # Ubuntu
sudo dnf install openssl-devel # Fedora
sudo yum install openssl-devel # CentOS/RHEL
brew install openssl # macOS *
```
Or if you choose LibreSSL, make sure its `openssl` is first in the $PATH (On OpenBSD you don't need to worry about this).

*\* Apple does not include a good enough version of OpenSSL. We officially support the `brew` versions of OpenSSL. If installing OpenSSL from source (untested) make sure to install static libraries.*

### Linux Capabilities
In order to setuid/setgid on linux, we require that you have libcap headers installed.

```
sudo apt install libcap-dev # Ubuntu
sudo dnf install libcap-devel # Fedora
sudo yum install libcap-devel # CentOS/RHEL
```

#### Downloading Envelope

https://github.com/workflowproducts/envelope/releases


#### NOTICE: Installing Envelope on windows is different, see [INSTALL_WIN.md](https://github.com/workflowproducts/envelope/blob/master/INSTALL_WIN.md) for details.

#### Installing Envelope

If you'd like to test Envelope before you install, see the section "Testing Envelope Before Installing" further down.
```
cd envelope
./configure
make
sudo make install
```
If you are on OpenBSD or FreeBSD, use gmake instead.
Envelope will be installed in `/usr/local/sbin`. All other files such as the html, javascript and configuration files will be installed to `/usr/local/etc/envelope`.

#### Running Envelope

To run Envelope:
```
/usr/local/sbin/envelope
```
Long Version:
```
/usr/local/sbin/envelope \
-c /usr/local/etc/envelope/envelope.conf \
-d /usr/local/etc/envelope/envelope-connections.conf
```
#### Configuring Envelope

Before running Envelope for the first time you may want to configure some options. All the options are explained in the Envelope man file:
```
man envelope
```
Current configuration options allow you to set various paths, various access restrictions, web port and log level. Note that in order to make Envelope publish to HTTPS, you need to add paths for a TLS cert and key.

You'll also need to set up a connection string to tell Envelope where your PostgreSQL databases are published. The default connection string config file located in /usr/local/etc/envelope/. There are examples in the provided ennvelope-connections.conf file and further info is available in the man file.

#### Reverse proxy for SSL
For nginx, see [INSTALL_NGINX.md](https://github.com/workflowproducts/envelope/blob/master/INSTALL_NGINX.md)<br />
For OpenBSD's relayd, see [INSTALL_RELAYD.md](https://github.com/workflowproducts/envelope/blob/master/INSTALL_RELAYD.md)

#### Testing Envelope Before Installing
```
cd envelope
./configure
make
nano src/config/envelope-connections.conf
make test
```
If you want to test Envelope before you install, edit the `config/envelope-connections.conf` file to add a connection string for your Postgres database. Instructions for adding a connection string are included in the Envelope man page. To look at the Envelope man page before installing Envelope:
```
./configure
man -M man envelope
```
By default Envelope runs on port 8888, so if you need to change that you do it in the `envelope.conf` file.

Once you've added a connection string to the envelope-connections.conf file, start the Envelope server with:
```
make test
```
Envelope will push a message like:
```
Open http://<this computer's ip>:8888/ in your web browser
```
Once you see that message that means Envelope is running, open your web browser to the link shown.

#### Uninstalling Envelope

If you still have your original build directory then:
```
cd envelope
./configure
make uninstall
```

Or, if you don't have your original build directory check the following locations:
```
rm -r /usr/local/etc/envelope        # you may wish to save your config/app files first
rm /usr/local/sbin/envelope          # this removes the binary
rm /usr/local/man/man1/envelope.1    # this removes the man page
```
