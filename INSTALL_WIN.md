# Installing Envelope on Windows

## Dependencies

There are a couple of dependencies but we're currently including the Windows libraries in the repo. You shouldn't have to install anything to run Envelope on your system.

#### Downloading Envelope

https://github.com/workflowproducts/envelope/releases


#### NOTICE: Installing Envelope on Unix-like machines is different, see [INSTALL.md](https://github.com/workflowproducts/envelope/blob/master/INSTALL.md) for details.

#### Building Envelope

Download the source code from here: https://github.com/workflowproducts/envelope/releases

After you unzip it, go into the `visualstudio` folder and open `envelope.sln`
Compile it and copy the release binary to `C:\Program Files (x86)\Workflow Products\Envelope\bin\`
Copy all library files from `visualstudio\lib\x86\` to `C:\Program Files (x86)\Workflow Products\Envelope\bin\`
Copy `src\config\` to `C:\Program Files (x86)\Workflow Products\Envelope\config\`
Copy `src\web_root\` to `C:\Program Files (x86)\Workflow Products\Envelope\web_root\`
Copy `src\app\` to `C:\Program Files (x86)\Workflow Products\Envelope\app\`
Copy `src\role\` to `C:\Program Files (x86)\Workflow Products\Envelope\role\`

#### Running Envelope

To run Envelope:
```
"C:\Program Files (x86)\Workflow Products\Envelope\bin\envelope.exe"
```
Long Version:
```
"C:\Program Files (x86)\Workflow Products\Envelope\bin\envelope.exe" -c "C:\Program Files (x86)\Workflow Products\Envelope\config\envelope.conf" -d "C:\Program Files (x86)\Workflow Products\Envelope\envelope-connections.conf"
```

#### Configuring Envelope

Before running Envelope for the first time you may want to configure some options. All the options are explained in the Postage man file:

https://github.com/workflowproducts/envelope/blob/master/src/man/man1/envelope.1.md

Current configuration options allow you to set various paths, various access restrictions, web port and log level.

You'll also need to set up a connection string to tell Postage where your PostgreSQL databases are published. The default connection string config file located at
```
C:\Program Files (x86)\Workflow Products\Envelope\envelope-connections.conf
```
    
There are examples in the provided envelope-connections.conf file and further info is available in the man file.

#### Reverse proxy for SSL
For nginx, see [INSTALL_NGINX.md](https://github.com/workflowproducts/envelope/blob/master/INSTALL_NGINX.md)
For IIS, see [INSTALL_IIS.md](https://github.com/workflowproducts/envelope/blob/master/INSTALL_IIS.md)

#### Uninstalling Envelope

Uninstall Envelope by deleting the folder:
```
C:\Program Files (x86)\Workflow Products\Envelope
```
