const { app, BrowserWindow } = require("electron");
const isDev = require("electron-is-dev");
let mainWindow;
app.on("ready", () => {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 680,
		webPreferences: {
			nodeIntegration: true,
		},
	});
	const urlLocation = isDev ? "http://localhost:3000" : "xxxxx"; //cra默认开的3000端口
	mainWindow.loadURL(urlLocation);
});
//当所有窗口都被关闭后退出
app.on("window-all-closed", () => {
	// 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
	// 否则绝大部分应用及其菜单栏会保持激活。
	if (process.platform !== "darwin") {
		app.quit();
	}
});
