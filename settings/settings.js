const { remote } = require("electron");
const Store = require("electron-store");
const settingsStore = new Store({ name: "Settings" });
const $ = (selector) => {
	const result = document.querySelectorAll(selector);
	return result.length > 1 ? result : result[0];
};

document.addEventListener("DOMContentLoaded", () => {
	console.log("d");
	let savelocation = settingsStore.get("savedlovation");
	$("#input").value = savelocation || remote.app.getPath("documents");
	$("#choose").addEventListener("click", () => {
		remote.dialog
			.showOpenDialog({
				properties: ["openDirectory"],
				message: "选择文件存储路径",
			})
			.then((res) => {
				console.log(res);
				let p = res.filePaths;
				if (p.length > 0) {
					$("#input").value = p[0];
					savelocation = p[0];
				}
			});
	});
	$("#submit").addEventListener("click", () => {
		settingsStore.set("savedlovation", savelocation);
		remote.getCurrentWindow().close();
	});
});
