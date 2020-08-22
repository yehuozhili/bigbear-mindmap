import React, { useMemo, useState } from "react";
import G6display from "./components/g6display";
import { Layout, List, Button, Input, message } from "bigbear-ui";
import "./app.css";
import { useGetBodyBound } from "./components/hooks";
import "./icon.js";
import { Icon } from "bigbear-ui";
import uuidv4 from "uuid/v4";

const { join } = window.require("path");
const { remote } = window.require("electron");
const fs = window.require("fs");
const savelocation = remote.app.getPath("documents");
const Store = window.require("electron-store");
const settingsStore = new Store({ name: "Settings" });
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
	let p = join(savelocation, "新增条目");
	try {
		fs.statSync(p);
		message.danger(`已有${p}，请删除后添加`);
	} catch {
		fs.writeFileSync(p, JSON.stringify(newBody));
		const newID = uuidv4();
		const newFile = {
			id: newID,
			title: "新增条目",
			path: p,
			createdAt: new Date().getTime(),
			isNew: true,
		};
		let newli = [...list, newFile];
		setList(newli);
		saveFilesToStore(newli);
	}
};

const renameFile = (list, index, setList, v) => {
	let origin = list[index];
	let p = join(savelocation, origin.title);
	let newpath = join(savelocation, v);
	try {
		fs.statSync(p);
		fs.renameSync(p, newpath);
		let newlist = list;
		newlist[index].title = v;
		newlist[index].path = newpath;

		setList([...newlist]);
		saveFilesToStore([...newlist]);
	} catch {
		message.danger("不存在的文件");
	}
};

const delFile = (list, index, setList) => {
	let origin = list[index];
	let p = join(savelocation, origin);
	try {
		fs.unlinkSync(p);
	} catch {
		message.danger("找不到此文件");
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
	const [list, setList] = useState([
		"Racing car sprays burning fuel into crowd.",
		"Japanese princess to wed commoner.",
		"Australian walks 100km after outback crash.",
		"Man charged over missing wedding girl.",
	]);

	const [activePath, setActivePath] = useState("");
	const [data, setData] = useState({
		id: "root",
	});
	const [edit, setEdit] = useState(false);
	const [nowedit, setNowEdit] = useState(0);
	// 内部210 40+170
	return (
		<Layout style={{ height: "100%" }}>
			<Layout row>
				<Layout.Sider>
					<List
						renderTemplate={(child, index) => (
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
									const name = list[index];
									const p = join(savelocation, name);
									try {
										const content = fs.readFileSync(
											p,
											"utf8"
										);
										let f = JSON.parse(content);
										setData(f);
										setActivePath(p);
									} catch {
										message.danger(`${p}文件读取有误`);
									}
								}}
							>
								{(!edit || index !== nowedit) && (
									<>
										<div
											style={{
												width: "170px",
												overflow: "hidden",
												textOverflow: "ellipsis",
												height: "20px",
												whiteSpace: "nowrap",
												cursor: "pointer",
											}}
											className="list-withoveractive"
										>
											{child}
										</div>
										<Button
											style={{ fontSize: "10px" }}
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
											style={{ fontSize: "10px" }}
											btnType="danger"
											lineargradient
											size="sm"
											onClick={() => {
												//删除操作
												let origin = list[index];
												let p = join(
													savelocation,
													origin
												);
												try {
													fs.unlinkSync(p);
												} catch {
													message.danger(
														"找不到此文件"
													);
												}
												list.splice(index, 1);
												setList([...list]);
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
												textOverflow: "ellipsis",
												height: "20px",
												whiteSpace: "nowrap",
												cursor: "pointer",
											}}
											value={list[index]}
											setValueCallback={(v) => {
												//修改文件名
												let origin = list[index];
												let p = join(
													savelocation,
													origin
												);
												let newpath = join(
													savelocation,
													v
												);
												try {
													fs.statSync(p);
													fs.renameSync(p, newpath);
													let newlist = list;
													newlist[index] = v;
													setList([...newlist]);
												} catch {
													message.danger(
														"不存在的文件"
													);
												}
											}}
											append={
												<Button
													size="sm"
													btnType="success"
													lineargradient
													onClick={() => {
														//切换模式
														setEdit(false);
													}}
												>
													<Icon icon="check"></Icon>
												</Button>
											}
										></Input>
									</>
								)}
							</div>
						)}
						style={{
							padding: "5px",
							height: `${bodyHeight - 32}px`,
							overflow: "auto",
							width: `${leftWidth}px`,
						}}
					>
						{list}
					</List>
					<div style={{ height: "32px" }}>
						<Button
							style={{ width: "50%" }}
							lineargradient
							btnType="primary"
							onClick={() => {
								//新增文件
								let p = join(savelocation, "新增条目");
								try {
									fs.statSync(p);
									message.danger(`已有${p}，请删除后添加`);
								} catch {
									fs.writeFileSync(
										p,
										JSON.stringify(newBody)
									);
									setList([...list, "新增条目"]);
								}
							}}
						>
							新建
						</Button>
						<Button
							style={{ width: "50%" }}
							lineargradient
							btnType="info"
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
					<G6display data={data} activePath={activePath}></G6display>
				</Layout.Content>
			</Layout>
		</Layout>
	);
}

export default App;
