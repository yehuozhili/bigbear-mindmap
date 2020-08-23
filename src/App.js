import React, { useMemo, useState, useEffect } from "react";
import G6display from "./components/g6display";
import { Layout, Button, Input, message } from "bigbear-ui";
import "./app.css";
import { useGetBodyBound } from "./components/hooks";
import "./icon.js";
import { Icon } from "bigbear-ui";
import uuidv4 from "uuid/v4";

const { join, dirname, basename } = window.require("path");
const { remote, ipcRenderer } = window.require("electron");
const fs = window.require("fs");
const Store = window.require("electron-store");
const settingsStore = new Store({ name: "Settings" });
const savelocation =
	settingsStore.get("savedlovation") || remote.app.getPath("documents");

const fileStore = new Store({ name: "Files Data" });

const saveFilesToStore = (files) => {
	fileStore.set("files", files);
};

const newBody = {
	label: "新的根节点",
	id: "root",
	children: [],
};
const createNewFile = (setList, list) => {
	const newID = uuidv4();
	let p = join(savelocation, newID);
	try {
		fs.statSync(p);
		remote.dialog.showErrorBox(`文件已存在`, `已有${newID}，请删除后添加`);
	} catch {
		fs.writeFileSync(p, JSON.stringify(newBody));

		const newFile = {
			id: newID,
			title: newID,
			path: p,
			createdAt: new Date().getTime(),
			isNew: true,
		};
		let newli = [...list, newFile];
		setList(newli);
		saveFilesToStore(newli);
	}
};

const importNewFile = (li) => {
	return li.map((v) => {
		return {
			path: v,
			id: uuidv4(),
			title: basename(v),
			createdAt: new Date().getTime(),
			isNew: false,
		};
	});
};

const renameFile = (list, index, setList, v) => {
	let origin = list[index];
	let p = origin.path;
	const newPath = origin.isNew ? join(savelocation, v) : join(dirname(p, v));
	try {
		fs.statSync(p);
		fs.renameSync(p, newPath);
		let newlist = list;
		newlist[index].title = v;
		newlist[index].path = newPath;

		setList([...newlist]);
		saveFilesToStore([...newlist]);
	} catch {
		remote.dialog.showErrorBox(`文件不存在`, `${p}`);
	}
};

const delFile = (list, index, setList) => {
	let origin = list[index];
	let p = origin.path;
	try {
		fs.unlinkSync(p);
	} catch {
		remote.dialog.showErrorBox(`文件已不存在`, `${p}`);
	}
	list.splice(index, 1);
	setList([...list]);
	saveFilesToStore([...list]);
};

function App() {
	const bound = useGetBodyBound();
	const bodyWidth = useMemo(() => {
		return bound && bound.width ? bound.width : 1200;
	}, [bound]);
	const bodyHeight = useMemo(() => {
		return bound && bound.height ? bound.height : 680;
	}, [bound]);
	const leftWidth = 240;
	const [list, setList] = useState(fileStore.get("files") || []);
	const [activeFile, setActiveFile] = useState();
	const [data, setData] = useState({
		id: "root",
		label: "无关联文件",
	});
	const [edit, setEdit] = useState(false);
	const [nowedit, setNowEdit] = useState(0);
	// 内部210 40+170
	const changeNew = (sa) => {
		if (activeFile) {
			const p = activeFile.path;
			fs.writeFileSync(p, sa);
			let origin = list;
			origin.forEach((it) => {
				if (it.id === activeFile.id) {
					it.isNew = false;
				}
			});
			setTimeout(() => {
				setList([...origin]);
				message.success("保存成功", { directions: "rb" });
			});
		} else {
			remote.dialog.showErrorBox(
				`该图未与文件链接`,
				`请导出数据或者新建文件`
			);
		}
	};

	const exportFile = (path, data) => {
		fs.writeFileSync(path, data);
		const title = basename(path);
		const newFile = {
			id: uuidv4(),
			title: title,
			path: path,
			createdAt: new Date().getTime(),
			isNew: true,
		};
		setTimeout(() => {
			let newli = [...list, newFile];
			setList(newli);
			saveFilesToStore(newli);
		});
	};

	const importFiles = useMemo(() => {
		return () => {
			remote.dialog
				.showOpenDialog({
					title: "选择要导入的文件",
					propertoes: ["openFile", "multiSelection"],
				})
				.then((result) => {
					let li = result.filePaths;
					let mapli = importNewFile(li);
					setList([...list, ...mapli]);
					saveFilesToStore([...list, ...mapli]);
				})
				.catch((err) => {
					remote.dialog.showErrorBox(`导入失败`, err);
				});
		};
	}, [list]);

	useEffect(() => {
		const callback = () => {
			importFiles();
		};
		ipcRenderer.on("import-file", callback);
		return () => {
			ipcRenderer.removeListener("import-file", callback);
		};
	}, [importFiles]);

	useEffect(() => {
		const callback = () => {
			createNewFile(setList, list);
		};
		ipcRenderer.on("create-new-file", callback);
		return () => {
			ipcRenderer.removeListener("create-new-file", callback);
		};
	}, [list]);

	return (
		<Layout style={{ height: "100%" }}>
			<Layout row>
				<Layout.Sider>
					<div
						style={{
							padding: "5px",
							height: `${bodyHeight - 32}px`,
							overflow: "auto",
							width: `${leftWidth}px`,
						}}
						className="bigbear-list list-vertical"
					>
						{list.length > 0 &&
							list.map((it, index) => {
								let child = it.title;
								return (
									<div
										key={it.id}
										className="bigbear-list-item"
									>
										<div
											style={{
												fontSize: "12px",
												textAlign: "left",
												width: "100%",
												display: "flex",
												overflow: "hidden",
												textOverflow: "ellipsis",
												height: "20px",
												whiteSpace: "nowrap",
												cursor: "pointer",
											}}
											onClick={() => {
												//读取文件

												const item = list[index];
												if (item) {
													const p = item.path || "";
													try {
														const content = fs.readFileSync(
															p,
															"utf8"
														);
														let f = JSON.parse(
															content
														);
														setData(f);
														setActiveFile(item);
													} catch {
														remote.dialog.showErrorBox(
															`文件读取有误`,
															`${p}`
														);
													}
												}
											}}
										>
											{(!edit || index !== nowedit) && (
												<>
													<div
														style={{
															width: "170px",
															overflow: "hidden",
															textOverflow:
																"ellipsis",
															height: "20px",
															whiteSpace:
																"nowrap",
															cursor: "pointer",
														}}
														className="list-withoveractive"
													>
														{child}
													</div>
													<Button
														style={{
															fontSize: "10px",
														}}
														btnType="primary"
														lineargradient
														size="sm"
														onClick={() => {
															//切换编辑
															setEdit(true);
															setNowEdit(index);
														}}
													>
														<Icon icon="edit"></Icon>
													</Button>
													<Button
														style={{
															fontSize: "10px",
														}}
														btnType="danger"
														lineargradient
														size="sm"
														onClick={() => {
															//删除操作
															delFile(
																list,
																index,
																setList
															);
														}}
													>
														<Icon icon="trash-alt"></Icon>
													</Button>
												</>
											)}
											{edit && index === nowedit && (
												<>
													<Input
														style={{
															width: "210px",
															overflow: "hidden",
															textOverflow:
																"ellipsis",
															height: "20px",
															whiteSpace:
																"nowrap",
															cursor: "pointer",
														}}
														value={
															list[index].title
														}
														setValueCallback={(
															v
														) => {
															//修改文件名
															renameFile(
																list,
																index,
																setList,
																v
															);
														}}
														append={
															<Button
																size="sm"
																btnType="success"
																lineargradient
																onClick={() => {
																	//切换模式
																	setEdit(
																		false
																	);
																}}
															>
																<Icon icon="check"></Icon>
															</Button>
														}
													></Input>
												</>
											)}
										</div>
									</div>
								);
							})}
					</div>
					<div style={{ height: "32px" }}>
						<Button
							style={{ width: "50%" }}
							lineargradient
							btnType="primary"
							onClick={() => {
								//新增文件
								createNewFile(setList, list);
							}}
						>
							新建
						</Button>
						<Button
							style={{ width: "50%" }}
							lineargradient
							btnType="info"
							onClick={importFiles}
						>
							导入
						</Button>
					</div>
				</Layout.Sider>
				<Layout.Content
					className="bigbear-layout-block-default"
					style={{
						width: `${bodyWidth - leftWidth}px`,
						height: `${bodyHeight}px`,
					}}
				>
					<G6display
						exportFile={exportFile}
						changeNew={changeNew}
						data={data}
					></G6display>
				</Layout.Content>
			</Layout>
		</Layout>
	);
}

export default App;
