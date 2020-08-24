const { app, BrowserWindow, globalShortcut, dialog } = require("electron");
const isDev = require("electron-is-dev");
const { Menu, ipcMain } = require("electron");
const { shell } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");
let mainWindow;
let settingwindow;
app.on("ready", () => {
	autoUpdater.autoDownload = false;
	autoUpdater.checkForUpdatesAndNotify();
	autoUpdater.on("error", (error) => {
		dialog.showErrorBox(
			"Error: ",
			error == null ? "unknown" : (error.stack || error).toString()
		);
	});
	autoUpdater.on("checking-for-update", () => {
		console.log("Checking for update...");
	});
	autoUpdater.on("update-available", () => {
		dialog.showMessageBox(
			{
				type: "info",
				title: "应用有新的版本",
				message: "发现新版本，是否现在更新?",
				buttons: ["是", "否"],
			},
			(buttonIndex) => {
				if (buttonIndex === 0) {
					autoUpdater.downloadUpdate();
				}
			}
		);
	});
	autoUpdater.on("update-not-available", () => {
		console.log("当前已经是最新版本");
	});

	autoUpdater.on("download-progress", (progressObj) => {
		let log_message = "Download speed: " + progressObj.bytesPerSecond;
		log_message =
			log_message + " - Downloaded " + progressObj.percent + "%";
		log_message =
			log_message +
			" (" +
			progressObj.transferred +
			"/" +
			progressObj.total +
			")";
		console.log(log_message);
	});

	autoUpdater.on("update-downloaded", () => {
		dialog.showMessageBox(
			{
				title: "安装更新",
				message: "更新下载完毕，应用将重启并进行安装",
			},
			() => {
				setImmediate(() => autoUpdater.quitAndInstall());
			}
		);
	});
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 680,
		webPreferences: {
			nodeIntegration: true,
		},
	});
	globalShortcut.register("CommandOrControl+S", () => {
		mainWindow.webContents.send("save-edit-file");
	});
	globalShortcut.register("CommandOrControl+N", () => {
		mainWindow.webContents.send("create-new-file");
	});
	globalShortcut.register("CommandOrControl+I", () => {
		mainWindow.webContents.send("import-file");
	});
	const urlLocation = isDev
		? "http://localhost:3000"
		: `file://${path.join(__dirname, "./build/index.html")}`;
	mainWindow.loadURL(urlLocation);
	ipcMain.on("open-settings", () => {
		settingwindow = new BrowserWindow({
			width: 500,
			height: 400,
			webPreferences: {
				nodeIntegration: true,
			},
			show: false,
			backgroundColor: "#efefef",
		});
		settingwindow.once("ready-to-show", () => {
			settingwindow.show();
		});
		const settingsFileLocation = `file://${path.join(
			__dirname,
			"./settings/settings.html"
		)}`;
		settingwindow.loadURL(settingsFileLocation);
		settingwindow.removeMenu();
		settingwindow.on("closed", () => {
			settingwindow = null;
		});
	});
});
//当所有窗口都被关闭后退出
app.on("window-all-closed", () => {
	// 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
	// 否则绝大部分应用及其菜单栏会保持激活。
	if (process.platform !== "darwin") {
		app.quit();
	}
});

const isMac = process.platform === "darwin";

const template = [
	// { role: 'appMenu' }
	...(isMac
		? [
				{
					label: app.name,
					submenu: [
						{ role: "about" },
						{ type: "separator" }, //
						{ role: "services" },
						{ type: "separator" },
						{ role: "hide" },
						{ role: "hideothers" },
						{ role: "unhide" },
						{ type: "separator" },
						{ role: "quit" },
					],
				},
		  ]
		: []),
	// { role: 'fileMenu' }
	{
		label: "文件",
		submenu: [
			{
				label: "新建",
				accelerator: "CommandOrControl+N",
				click: (menuItem, browserWindow, event) => {
					browserWindow.webContents.send("create-new-file");
				},
			},
			{
				label: "保存",
				accelerator: "CommandOrControl+S",
				click: (menuItem, browserWindow, event) => {
					browserWindow.webContents.send("save-edit-file");
				},
			},
			{
				label: "导入",
				accelerator: "CommandOrControl+I",
				click: (menuItem, browserWindow, event) => {
					browserWindow.webContents.send("import-file");
				},
			},
			{
				label: "设置",
				click: (menuItem, browserWindow, event) => {
					ipcMain.emit("open-settings");
				},
			},

			isMac ? { role: "close" } : { role: "quit" },
		],
	},
	// { role: 'editMenu' }
	{
		label: "编辑",
		submenu: [
			{ role: "undo" },
			{ role: "redo" },
			{ type: "separator" },
			{ role: "cut" },
			{ role: "copy" },
			{ role: "paste" },
			...(isMac
				? [
						{ role: "pasteAndMatchStyle" },
						{ role: "delete" },
						{ role: "selectAll" },
						{ type: "separator" },
						{
							label: "Speech",
							submenu: [
								{ role: "startspeaking" },
								{ role: "stopspeaking" },
							],
						},
				  ]
				: [
						{ role: "delete" },
						{ type: "separator" },
						{ role: "selectAll" },
				  ]),
		],
	},
	// { role: 'viewMenu' }
	{
		label: "菜单",
		submenu: [
			{
				label: "刷新页面",
				role: "reload",
			},
			{
				label: "强制刷新页面",
				role: "forcereload",
			},
			{
				label: "开发者工具",
				role: "toggledevtools",
			},
			{ type: "separator" },
			{ role: "resetzoom" },
			{ role: "zoomin" },
			{ role: "zoomout" },
			{ type: "separator" },
			{ label: "切换全屏", role: "togglefullscreen" },
		],
	},
	// { role: 'windowMenu' }
	{
		label: "窗口",
		submenu: [
			{ role: "minimize" },
			...(isMac
				? [
						{ type: "separator" },
						{ role: "front" },
						{ type: "separator" },
						{ role: "window" },
				  ]
				: [{ role: "close" }]),
		],
	},
	{
		label: "帮助",
		submenu: [
			{
				label: "关于我",
				click: async () => {
					const { dialog } = require("electron");
					dialog.showMessageBox({
						title: "作者yehuozhili",
						message: "使用过程中若有问题，联系微信号h1637830449",
					});
				},
			},
			{
				label: "github",
				click: () => {
					shell.openExternal(
						"https://github.com/yehuozhili/bigbear-mindmap"
					);
				},
			},
		],
	},
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
