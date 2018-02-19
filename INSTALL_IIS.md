# Setting up a reverse proxy for Envelope in IIS

Install the [URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite) extension.
Install the [ARR](https://www.iis.net/downloads/microsoft/application-request-routing) extension.
Install websocket support:
- For a Server edition of windows: https://blogs.technet.microsoft.com/erezs_iis_blog/2013/09/16/new-features-in-arr-application-request-routing-3-0/
- For a Client edition of windows:
  - Control panel > Programs > Turn Windows features on or off
  - Internet Information Services > World Wide Web Services > Application Development Features > WebSocket Protocol

After the installation is complete:
- Open the IIS Administration Console
- Select the website you want to proxy
- Click "Bindings..." in the Actions pane of the right sidebar
- Remove http binding
- Add a binding for https at port 443
- Close the Bindings window
- Double-click the "URL Rewrite" icon
- Click "Add Rule(s)..." in the Actions pane of the right sidebar
- Click "Reverse Proxy" under "inboud and Outbound Rules"
- Specify the ip and port where envelope is located
- Enable SSL Offloading
- (Optional) Enable rewriting the domaing names of the links in HTTP responses and specify what to rewrite
