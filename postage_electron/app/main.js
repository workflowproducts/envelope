const os = require('os');
const path = require('path');
const electron = require('electron');
const fs = require('fs-extra');
const hidefile = require('hidefile');
const windowStateKeeper = require('electron-window-state');
const tcpPortUsed = require('tcp-port-used');
const ipcMain = electron.ipcMain;
const isDev = require('electron-is-dev');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

var shouldQuit = app.makeSingleInstance(function (commandLine, workingDirectory) {
	// Someone tried to run a second instance, we should create a new window
	fs.writeFileSync(os.homedir() + '/.postage/postage-SIGHUP', '\n', 'utf8');
});

if (shouldQuit) {
	app.quit();
	return;
}

var strResourcesPath = path.normalize(process.resourcesPath);
if (strResourcesPath.indexOf('postage/postage_electron/node_modules/electron/dist/resources') > -1) {
	strResourcesPath = strResourcesPath.replace('postage/postage_electron/node_modules/electron/dist/resources', 'postage/postage_electron');
} else if (strResourcesPath.indexOf('postage\\postage_electron\\node_modules\\electron\\dist\\resources') > -1) {
	strResourcesPath = strResourcesPath.replace('postage\\postage_electron\\node_modules\\electron\\dist\\resources', 'postage\\postage_electron');
}


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindows = [];
let configWindow = null;
let connectionWindow = null;
let pgpassWindow = null;
let mainWindowState = null;
let configWindowState = null;
let connectionWindowState = null;
let pgpassWindowState = null;
let bolPostageIsReady = false;

try {
	fs.statSync(os.homedir() + '/.postage/');
	fs.statSync(os.homedir() + '/.postage/postage.conf');
	fs.statSync(os.homedir() + '/.postage/postage-connections.conf');
} catch (e) {
	fs.mkdirsSync(os.homedir() + '/.postage/');
	hidefile.hideSync(os.homedir() + '/.postage/');

	fs.writeFileSync(os.homedir() + '/.postage/postage-SIGHUP', '\n', 'utf8');

	console.log('copying config');
	fs.writeFileSync(os.homedir() + '/.postage/postage.conf', fs.readFileSync(strResourcesPath + '/app/postage/config/postage.conf', 'utf8'), 'utf8');
	fs.writeFileSync(os.homedir() + '/.postage/postage-connections.conf', fs.readFileSync(strResourcesPath + '/app/postage/config/postage-connections.conf', 'utf8'), 'utf8');
}

fs.writeFileSync(os.homedir() + '/.postage/postage-SIGHUP', '\n', 'utf8');
var lastTime = new Date().getTime();
fs.watch(os.homedir() + '/.postage/postage-SIGHUP', function (eventType) {
	if (eventType === 'change') {
		var currTime = new Date().getTime();
		if ((currTime - lastTime) > 1000) {
			openWindow();
		}
		lastTime = currTime;
	}
});

if (process.platform == 'win32') {
	try {
		fs.statSync(process.env.APPDATA + '\\postgresql\\pgpass.conf');
	} catch (e) {
		fs.mkdirsSync(process.env.APPDATA + '\\postgresql');
		fs.writeFileSync(process.env.APPDATA + '\\postgresql\\pgpass.conf', '\n', 'utf8');
	}
} else {
	try {
		fs.statSync(os.homedir() + '/.pgpass');
	} catch (e) {
		fs.writeFileSync(os.homedir() + '/.pgpass', '\n', 'utf8');
		fs.chmodSync(os.homedir() + '/.pgpass', 0600);
	}
}

function spawnPostage() {
	console.log(strResourcesPath, '/postage/postage');
	proc = child_process.spawn(
		path.normalize(strResourcesPath + '/app/postage/postage' + (process.platform == 'win32' ? '.exe' : '')),
		[
			'-c', path.normalize(os.homedir() + '/.postage/postage.conf'),
			'-d', path.normalize(os.homedir() + '/.postage/postage-connections.conf'),
			'-r', strResourcesPath + path.normalize('/app/postage/web_root'),
			'-x', 't',
			'-p', int_postage_port
		].concat((process.platform == 'win32' ? ['-o', 'stderr'] : [])), {
			detached: true
		}
	);

	proc.stdout.on('data', function (data) {
		console.log('got data:\n' + data);
		if (data.toString().indexOf('in your web browser') > -1) {
			fs.writeFileSync(path.normalize(os.homedir() + '/.postage/postage_port'), int_postage_port.toString());
			if (mainWindows.length === 0) {
				openWindow();
			}
			bolPostageIsReady = true;
		}
	});
	proc.stderr.on('data', function (data) {
		console.log('got data:\n' + data);
	});
	proc.on('close', function (code) {
		console.log(proc.pid + ' closed with code ' + code);
	});
}

function handleRedirect(e, url) {
	if (url.indexOf('http://127.0.0.1:' + int_postage_port) === -1) {
		e.preventDefault()
		electron.shell.openExternal(url);
	}
}

var int_postage_port = null;

function pickNewPort() {
	int_postage_port = parseInt(Math.random().toString().substring(2), 10) % (65535 - 1024) + 1024;
	tcpPortUsed.check(int_postage_port, '127.0.0.1').then(function this_callback(taken) {
		if (!taken) {
			spawnPostage();

			var localStoragePath = path.normalize(app.getPath('userData') + '/Local Storage');
			if (fs.existsSync(localStoragePath)) {
				fs.readdir(localStoragePath, function(err, items) {
					var i, len;
					if (err) {
						electron.dialog.showErrorBox('Error', err.message);
						app.quit();
					}

					for (i = 0, len = items.length; i < len; i++) {
						if (/^http_127\.0\.0\.1_([0-9]+)\.localstorage/gi.test(items[i])) {
							console.log(items[i]);
							var oldPath = path.normalize(localStoragePath + '/' + items[i]);
							var newPath = path.normalize(localStoragePath + '/' + items[i].replace(/([0-9]+)\.localstorage/gi, function (match) {
								return int_postage_port.toString() + match.substring(match.indexOf('.'));
							}));
							fs.renameSync(oldPath, newPath);
							console.log(newPath);
						}
					}
				});
			}
		} else {
			int_postage_port = parseInt(Math.random().toString().substring(2), 10) % (65535 - 1024) + 1024;
			tcpPortUsed.check(int_postage_port, '127.0.0.1').then(this_callback, function (err) {
				electron.dialog.showErrorBox('Error', err.message);
				app.quit();
			});
		}
	}, function (err) {
	    throw err;
	});
}

try {
	int_postage_port = parseInt(fs.readFileSync(path.normalize(os.homedir() + '/.postage/postage_port')), 10);
	tcpPortUsed.check(int_postage_port, '127.0.0.1').then(function (taken) {
		if (!taken) {
			spawnPostage();
		} else {
			pickNewPort();
		}
	}, function (err) {
	    throw err;
	});
} catch (e) {
	pickNewPort();
}

const child_process = require('child_process');
var proc = null;

ipcMain.on('postage', function (event, arg) {
	if (arg === 'restart') {
		proc.kill();
		spawnPostage();
		mainWindows.forEach(function (curWindow) {
			curWindow.webContents.executeJavaScript('window.location.reload();');
		});
	} else if (arg === 'edit connections') {
		connectionWindow = new BrowserWindow({
			'x': connectionWindowState.x,
			'y': connectionWindowState.y,
			'width': connectionWindowState.width,
			'height': connectionWindowState.height
		});
		connectionWindowState.manage(connectionWindow);
		connectionWindow.loadURL('http://127.0.0.1:' + int_postage_port + '/postage/config.html?file=postage-connections.conf',  { 'extraHeaders': 'pragma: no-cache\n' });
	} else if (arg === 'edit PGPASS') {
		pgpassWindow = new BrowserWindow({
			'x': pgpassWindowState.x,
			'y': pgpassWindowState.y,
			'width': pgpassWindowState.width,
			'height': pgpassWindowState.height
		});
		pgpassWindowState.manage(pgpassWindow);
		pgpassWindow.loadURL('http://127.0.0.1:' + int_postage_port + '/postage/config.html?file=PGPASS',  { 'extraHeaders': 'pragma: no-cache\n' });
		pgpassWindow.webContents.on('will-navigate', handleRedirect);
		pgpassWindow.webContents.on('new-window', handleRedirect);
	}
})

app.on('quit', function () {
	proc.kill();
});

function closeTabFunc() {
	BrowserWindow.getFocusedWindow().webContents.executeJavaScript('closeCurrentTab()');
}

function setMenu() {
	const Menu = electron.Menu;
	const template = [
		{
			label: 'File',
			submenu: [
				{
					label: 'New Window',
					accelerator: 'CmdOrCtrl+N',
					click: openWindow
				},
				{
					label: 'Edit postage.conf',
					click: function () {
						configWindow = new BrowserWindow({
							'x': configWindowState.x,
							'y': configWindowState.y,
							'width': configWindowState.width,
							'height': configWindowState.height
						});
						configWindowState.manage(configWindow);
						configWindow.loadURL('http://127.0.0.1:' + int_postage_port + '/postage/config.html?file=postage.conf',  { 'extraHeaders': 'pragma: no-cache\n' });
					}
				},
				{
					label: 'Edit postage-connections.conf',
					click: function () {
						connectionWindow = new BrowserWindow({
							'x': connectionWindowState.x,
							'y': connectionWindowState.y,
							'width': connectionWindowState.width,
							'height': connectionWindowState.height
						});
						connectionWindowState.manage(connectionWindow);
						connectionWindow.loadURL('http://127.0.0.1:' + int_postage_port + '/postage/config.html?file=postage-connections.conf',  { 'extraHeaders': 'pragma: no-cache\n' });
					}
				},
				{
					label: 'Edit PGPASS',
					click: function () {
						pgpassWindow = new BrowserWindow({
							'x': pgpassWindowState.x,
							'y': pgpassWindowState.y,
							'width': pgpassWindowState.width,
							'height': pgpassWindowState.height
						});
						pgpassWindowState.manage(pgpassWindow);
						pgpassWindow.loadURL('http://127.0.0.1:' + int_postage_port + '/postage/config.html?file=PGPASS',  { 'extraHeaders': 'pragma: no-cache\n' });
						pgpassWindow.webContents.on('will-navigate', handleRedirect);
						pgpassWindow.webContents.on('new-window', handleRedirect);
					}
				},
				{
					role: 'quit'
				}
			]
		}, {
			label: 'Edit',
			submenu: [
				{
					role: 'undo'
				}, {
					role: 'redo'
				}, {
					type: 'separator'
				}, {
					role: 'cut'
				}, {
					role: 'copy'
				}, {
					role: 'paste'
				}, {
					role: 'delete'
				}, {
					role: 'selectall'
				}
			]
		}, {
			label: 'View',
			submenu: [
				{
					label: 'Reload',
					accelerator: 'CmdOrCtrl+R',
					role: 'forcereload'
				}, {
					label: 'Toggle Developer Tools',
					accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
					click: function (item, focusedWindow) {
						if (focusedWindow) {
							focusedWindow.webContents.toggleDevTools();
						}
					}
				}, {
					type: 'separator'
				}, {
					role: 'resetzoom'
				}, {
					role: 'zoomin'
				}, {
					role: 'zoomout'
				}, {
					type: 'separator'
				}, {
					role: 'togglefullscreen'
				}
			]
		}, {
			role: 'window',
			submenu: [
				{
					role: 'minimize'
				}, {
					label: 'Close Tab',
					accelerator: 'CmdOrCtrl+W',
					click: closeTabFunc
				}
			]
		}
	];

	if (process.platform === 'darwin') {
		const name = app.getName();
		template.unshift({
			label: name,
			submenu: [
				{
					role: 'about'
				}, {
					type: 'separator'
				}, {
					role: 'services',
					submenu: []
				}, {
					type: 'separator'
				}, {
					role: 'hide'
				}, {
					role: 'hideothers'
				}, {
					role: 'unhide'
				}, {
					type: 'separator'
				}, {
					role: 'quit'
				}
			]
		});
		// Edit menu.
		template[2].submenu.push(
			{
				type: 'separator'
			}, {
				label: 'Speech',
				submenu: [
					{
						role: 'startspeaking'
					}, {
						role: 'stopspeaking'
					}
				]
			}
		);
		// Window menu.
		template[4].submenu = [
			{
				label: 'Close Tab',
				accelerator: 'CmdOrCtrl+W',
				click: closeTabFunc
			}, {
				label: 'Minimize',
				accelerator: 'CmdOrCtrl+M',
				role: 'minimize'
			}, {
				label: 'Zoom',
				role: 'zoom'
			}, {
				type: 'separator'
			}, {
				label: 'Bring All to Front',
				role: 'front'
			}
		];
	}

	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
}

function openWindow() {
	electron.session.defaultSession.clearCache(function () {
		var curWindow = new BrowserWindow({
			'x': mainWindowState.x,
			'y': mainWindowState.y,
			'width': mainWindowState.width,
			'height': mainWindowState.height
		});
		mainWindows.push(curWindow);
		mainWindowState.manage(curWindow);

		curWindow.loadURL('http://127.0.0.1:' + int_postage_port + '/postage/' +
			(process.argv.indexOf('--postage-test') > -1 ? 'test/' : '') + 'index.html' +
			(process.argv.indexOf('--postage-test') > -1 ? '?seq_numbers=true&_http_auth=true&http_file=true&http_upload=true&http_export=true&ws_raw=true&ws_tab=true&ws_select=true&ws_insert=true&ws_update=true&ws_delete=true' : ''),
			{ 'extraHeaders': 'pragma: no-cache\n' });

		// Emitted when the window is closed.
		curWindow.on('closed', function () {
			mainWindows.splice(mainWindows.indexOf(curWindow), 1);
		});

		curWindow.webContents.on('will-navigate', handleRedirect);
		curWindow.webContents.on('new-window', handleRedirect);
		curWindow.webContents.on('context-menu', function (event, props) {
			const template = [
				{
					role: 'undo'
				}, {
					role: 'redo'
				}, {
					type: 'separator'
				}, {
					role: 'cut',
					enabled: props.canCut
				}, {
					role: 'copy',
					enabled: props.canCopy
				}, {
					role: 'paste',
					enabled: props.canPaste
				}, {
					role: 'delete',
					enabled: props.canDelete
				}, {
					role: 'selectall',
					enabled: props.canSellectAll
				}
			];

			if (isDev) {
				template.push({
					type: 'separator'
				}, {
					label: 'Inspect Element',
					click: function (item, win) {
						win.webContents.inspectElement(props.x, props.y);
						if (win.webContents.isDevToolsOpened()) {
							win.webContents.devToolsWebContents.focus();
						}
					}
				});
			}

			const contextMenu = electron.Menu.buildFromTemplate(template);

			contextMenu.popup(curWindow);
		});

		setMenu();
	});
}

function appStart() {
	electron.session.defaultSession = electron.session.fromPartition('persist:postage-session123', { cache: false });
	mainWindowState = windowStateKeeper({
		defaultWidth: 1024,
		defaultHeight: 768,
		path: os.homedir() + '/.postage/',
		file: 'main-window-state.json'
	});

	configWindowState = windowStateKeeper({
		defaultWidth: 1024,
		defaultHeight: 768,
		path: os.homedir() + '/.postage/',
		file: 'config-window-state.json'
	});

	connectionWindowState = windowStateKeeper({
		defaultWidth: 1024,
		defaultHeight: 768,
		path: os.homedir() + '/.postage/',
		file: 'connection-window-state.json'
	});

	pgpassWindowState = windowStateKeeper({
		defaultWidth: 1024,
		defaultHeight: 768,
		path: os.homedir() + '/.postage/',
		file: 'pgpass-window-state.json'
	});
	if (bolPostageIsReady) {
		openWindow();
	}
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', appStart);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', function () {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindows.length === 0) {
		openWindow();
	}
});
