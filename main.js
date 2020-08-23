const { app, BrowserWindow, globalShortcut } = require("electron");
const isDev = require("electron-is-dev");
const { Menu, ipcMain } = require("electron");
const { shell } = require("electron");
const path = require("path");
let mainWindow;
let settingwindow;
app.on("ready", () => {
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
					shell.openExternal("https://github.com/yehuozhili");
				},
			},
		],
	},
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
