# Envelope - Publish web apps based on your PostgreSQL database fast!

## About
See the document "What_is_Envelope.pdf" for a quick overview.

Envelope is a product of Workflow Products, LLC. This is the free PostgreSQL version. 

If you'd like to try Postage please go to ["Releases"](https://github.com/workflowproducts/postage/releases) and download the appropriate package for your OS. The names of these packages start with "Postage", not "Source Code". The team has spent a ridiculous amount of time ensuring you have an easy, convenient installer for your OS. Please use it. Compiling Postage from source will only give you the server version and all first time users should try the desktop version first. 

Since Envelope websites run in a browser, we don't recommend you use envelope with a non-UTF8 PostgreSQL database.

Currently we release twice a month. To download Envelope for install purposes, please go to ["Releases"](https://github.com/workflowproducts/postage/releases)

## Dependencies

#### LIBPQ
In order for Envelope to talk to PostgreSQL you need to have the libpq library installed. If you don't have LibPQ or the Envelope compile process can't find it, please consult the file INSTALL_LIBPQ for some OS-specific advice on how to get libpq.

#### SSL
Envelope works with OpenSSL or LibreSSL, if you wish to use OpenSSL:
```
sudo apt install libssl-devel # Ubuntu
sudo dnf install openssl-devel # Fedora
```
Or if you choose LibreSSL, make sure its `openssl` is first in the $PATH (On OpenBSD you don't need to worry about this).

#### DOWNLOADING THE LATEST VERSION OF ENVELOPE

https://github.com/workflowproducts/envelope/releases

#### INSTALLING ENVELOPE

If you'd like to test Envelope before you install, see the section "Testing Envelope Before Installing" further down.

    cd envelope
    ./configure
    make
    sudo make install

If you are on OpenBSD or FreeBSD, use gmake instead.
Envelope will be installed in `/usr/local/sbin`. All other files such as the html, javascript and configuration files will be installed to `/usr/local/etc/envelope`.

#### RUNNING ENVELOPE

To run Envelope:

    /usr/local/sbin/envelope

Long version:

    /usr/local/sbin/envelope \
    -c /usr/local/etc/envelope/envelope.conf \
    -d /usr/local/etc/envelope/envelope-connections.conf

#### Configuring ENVELOPE

Before running Envelope for the first time you may want to configure some options. All the options are explained in the Envelope man file:

    man envelope

Current configuration options allow you to set various paths, various access restrictions, web port and log level. Note that in order to make Envelope publish to HTTPS, you need to add paths for a TLS cert and key.

You'll also need to set up a connection string to tell Envelope where your PostgreSQL database is published. The default connection string config file located in /usr/local/etc/envelope/. There are examples in the provided envelope-connections.conf file and further info is available in the man file.

#### Pooling

To use Envelope with a connection pool, you need a Super User in your database that specifically for Envelope.

The recommended script for creating this user is:
```
CREATE ROLE <username> LOGIN SUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD '<password>'
```

Of course, you should choose a name and password that doesn't have 'envelope' in it, otherwise people who try to break into your database can make that assumption.

Envelope will detect if you want to use this mode if you have a `user` key in your `envelope-connections.conf`.
It is recommended to use a `.pgpass` or some other means of storing the password so that it isn't in the `envelope-connections.conf`.

#### TESTING ENVELOPE BEFORE INSTALLING

    cd envelope
    ./configure
    make
    nano config/envelope-connections.conf
    make test

If you want to test Envelope before you install, edit the `config/envelope-connections.conf` file to add a connection string for your Postgres database. Instructions for adding a connection string are included in the Envelope man page. To look at the Envelope man page before installing Envelope:

    ./configure
    man -M man envelope

By default Envelope runs on port 8888, so if you need to change that you do it in the `envelope.conf` file. You can also set other options like whether to use TLS to connect.

Once you've added a connection string to the envelope-connections.conf file, start the Envelope server with:

    make test

Envelope will push a message like:

    Open http(s)://<this computer's ip>:8888/ in your web browser

Once you see that message that means Envelope is running, open your web browser to the link shown.

#### UNINSTALLING ENVELOPE

If you still have your original build directory then:

    cd envelope
    ./configure
    make uninstall

If you don't have your original build directory check the following locations:

#### Warning: The /usr/local/etc/envelope folder contains app/, role/, web_root/ and your config files. Make sure you have backups before you remove these folders. If you've made apps or altered your website then back up these folders before removing envelope manually. 

    rm -r /usr/local/etc/envelope
    rm /usr/local/sbin/envelope             # this removes the binary
    rm /usr/local/man/man1/envelope.1       # this removes the man page
    
#### FEEDBACK AND BUG REPORTS

Please contact us with your feedback! Github issues and pull requests are welcome. Please report any issues you have for FREE support. More information is available at the project home page: https://www.workflowproducts.com/envelope.html

#### Licensing

If you like some or all of Envelope's functionality and the current license won't suit your needs, commercial licensing is available starting at $99. Please call Justin at Workflow Products, 817-503-9545 for details.

## Why?

Workflow Products has been building custom ERP and MRP applications, mostly in PostgreSQL and Microsoft Access for about ten years now. At about the four year mark we developed the first in-house only version of Envelope and put up a simple timekeeping application. It allowed us to punch in and out of various customer projects all day. Suddenly, we were getting paid a lot more because the overhead of keeping track of small amounts of time was gone.

Prior to that we had turned down many web projects but no longer! We now have many projects in maintenance mode, some on very old versions of Envelope that were never open sourced. 

Envelope seeks to be the easiest way to build web apps for accounting, inventory and other business applications. Over time we notice when we're writing similar Javascript over and over and we'll build another Web Component to remove all that. 

Around 2014 we got a government contract than they said they preferred open source. We polished it up and released it. It was a disaster. It had integrated development source and SQL code control and users were unable to comprehend it. All the feedback was negative. We ripped all the extras out and re-released it. The simpler, cleaner version seems to be easier to understand, install and manage. 

## Roadmap

Frankly, we miss our integrated SQL and source code control. Our highest priority is to figure out a way to add that functionality back in while keeping it in a separate, optional project or something.

Then we'll move back into feature expansion. The features we want to bring to Envelope next, in no particular order:

* Increase Datasheet and Combo box element performance to thousands of records in real time.
* More Web Components for specific data types.
* Small improvements to Web Components to bring functionality up to desktop level.
* Paste into Datasheet to create new records.

Workflow Products itself is healthier than it's ever been. We're celebrating our tenth year in November 2016. We're now at five full time employees and we expect to be around in another ten years. If you have any further questions please contact us directly at 817-503-9545.

## Contributors
If you would like to contribute to Envelope, first submit an issue. Please include how you plan to solve the issue. Then work on the patch. This way we get a moment to give feedback before you invest your time. 

Anyone presenting a quality patch that asks for commit privileges will likely receive them! 

We're not against forking. We just want people communicating. Preferably before putting forth effort. If we all use the Github issue tracker then there will be a minimum of wasted effort. 

Copyright 2016 Workflow Products LLC



