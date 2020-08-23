import React, { useRef, useEffect, useState, useMemo, memo } from "react";
import G6 from "@antv/g6";
import { Form, Input, Select, InputNumber } from "bigbear-ui";
import uuidv4 from "uuid/v4";
const { remote, ipcRenderer } = window.require("electron");

G6.registerBehavior("click-add-child", {
	getEvents() {
		return {
			"node:click": "onClick",
		};
	},
	onClick(ev) {
		const self = this;
		const graph = self.graph;
		const item = ev.item;
		if (item) {
			const model = item.getModel();
			if (!model.children) {
				model.children = [];
			}
			// Add a new node
			const newItem = {
				label: "new item",
				id: `${uuidv4()}`, // Generate the unique id
			};
			graph.addChild(newItem, model.id);
		}
	},
});

G6.registerBehavior("del-node-and-edge", {
	getEvents() {
		return {
			"node:click": "onClick", // The event is canvas:click, the responsing function is onClick
			"edge:click": "onEdgeClick", // The event is edge:click, the responsing function is onEdgeClick
		};
	},
	onClick(ev) {
		const self = this;
		const node = ev.item;
		const graph = self.graph;
		graph.removeChild(node.getID());
	},
	onEdgeClick(ev) {
		const self = this;
		const currentEdge = ev.item;
		const graph = self.graph;
		graph.removeItem(currentEdge);
	},
});

let graph;

function switchMode(mode, setShow) {
	switch (mode) {
		case "0":
			graph.setMode("default");
			setShow(false);
			return;
		case "1":
			graph.setMode("addChild");
			setShow(false);
			return;
		case "2":
			graph.setMode("del");
			setShow(false);
			return;
		default:
			return;
	}
}

function G6main(props) {
	const {
		data,
		save,
		imgs,
		changeNew,
		bound,
		mode,
		layout,
		exportFile,
		setMode,
		out,
	} = props;
	const ref = useRef(null);
	const [show, setShow] = useState(false);
	const [changeItem, setChangeItem] = useState();
	const [label, setLabel] = useState("");
	const [fill, setfill] = useState("");
	const [fontSize, setFontSize] = useState(0);
	const [sel, setsel] = useState();
	const [offset, setOffset] = useState("0");
	const [fontFill, setFontfill] = useState("");
	useMemo(() => {
		if (graph) {
			switchMode(mode, setShow);
		}
	}, [mode]);

	useMemo(() => {
		//保存数据
		if (graph) {
			const sa = JSON.stringify(graph.save());
			try {
				changeNew(sa);
			} catch {
				remote.dialog.showErrorBox(`保存失败`);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [out]);

	useMemo(() => {
		//导出图片
		if (graph) {
			graph.downloadImage();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [imgs]);

	useMemo(() => {
		//导出数据
		if (graph) {
			const data = JSON.stringify(graph.save());
			remote.dialog
				.showSaveDialog({
					title: "导出位置",
					buttonLabel: "保存",
				})
				.then((res) => {
					let p = res.filePath;
					if (p) {
						exportFile(p, data);
					}
				});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [save]);

	useEffect(() => {
		const callback = () => {
			if (graph) {
				const sa = JSON.stringify(graph.save());
				try {
					changeNew(sa);
				} catch {
					remote.dialog.showErrorBox(`保存失败`);
				}
			}
		};
		ipcRenderer.on("save-edit-file", callback);
		return () => {
			ipcRenderer.removeListener("save-edit-file", callback);
		};
	}, [changeNew]);

	const flayout = useMemo(() => {
		// H / V / LR / RL / TB / BT
		if (graph) {
			setChangeItem(null);
			setShow(false);
			switch (layout) {
				case "0-0":
					return "H";
				case "0-1":
					return "V";
				case "0-2":
					return "LR";
				case "0-3":
					return "RL";
				case "0-4":
					return "TB";
				case "0-5":
					return "BT";
				default:
					return "H";
			}
		}
		return "H";
	}, [layout]);
	useMemo(() => {
		G6.registerBehavior("click-change-style", {
			// Set the events and the corresponding responsing function for this behavior
			getEvents() {
				return {
					"node:click": "onClick", // The event is canvas:click, the responsing function is onClick
				};
			},
			onClick(ev) {
				const item = ev.item;
				const model = item.getModel();
				const value = model.label;
				const f = model.style?.fill;
				const labelcfg = model.labelCfg;
				if (typeof value === "string") {
					//将节点的值赋给input并绑上onchange给它
					setLabel(value);
					if (f) {
						setfill(f);
					} else {
						setfill("");
					}
					if (labelcfg && labelcfg.style && labelcfg.style.fontSize) {
						setFontSize(labelcfg.style.fontSize);
					} else {
						const nlabelcfg = {
							style: {
								fontSize: 14,
							},
						};
						model.labelCfg = nlabelcfg;
						setFontSize(14);
					}
					if (labelcfg && labelcfg.offset) {
						setOffset(labelcfg.offset + "");
					} else {
						const nlabelcfg = {
							offset: 0,
						};
						model.labelCfg = nlabelcfg;
						setOffset("0");
					}
					setChangeItem(item); //要调用更新，最小是item item才有update
				}
			},
		});
	}, []);

	useEffect(() => {
		let width = bound && bound.width ? bound.width : 800;
		let height = bound && bound.height ? bound.height : 680;
		const fetchdata = async () => {
			graph = new G6.TreeGraph({
				container: ref.current,
				width,
				height,
				modes: {
					// Defualt mode
					default: [
						"drag-node",
						"drag-canvas",
						"zoom-canvas",
						"collapse-expand",
						"click-change-style",
					],
					del: ["del-node-and-edge", "drag-canvas", "zoom-canvas"],
					addChild: ["click-add-child", "drag-canvas", "zoom-canvas"],
				},
				nodeStateStyles: {
					selected: {
						stroke: "#666",
						lineWidth: 2,
						fill: "steelblue",
					},
				},
				layout: {
					type: "mindmap",
					direction: flayout,
					getHeight: () => {
						return 16;
					},
					getWidth: () => {
						return 16;
					},
					getVGap: () => {
						return 10;
					},
					getHGap: () => {
						return 50;
					},
				},
				defaultEdge: {
					type: "cubic-horizontal",
					style: {
						stroke: "#A3B1BF",
					},
				},
				fitView: true,
			});

			graph.data(data);

			graph.render();
			graph.fitView();
		};
		fetchdata();
		setMode("0");
		return () => {
			if (graph) {
				graph.destroy();
			}
		};
	}, [data, bound, flayout, setMode]);

	useMemo(() => {
		const fn = (e) => {
			const nowmode = graph.getCurrentMode();
			if (nowmode === "default") {
				setShow(true);
			}
			if (sel && sel.sel) {
				sel.sel("标签位置");
			}
		};
		if (graph) {
			graph.on("node:click", fn);
		}
		return () => {
			graph.off("node:click", fn);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sel, graph]);

	const handleChange = (e) => {
		setLabel(e);
		//修改state后改变节点Label
		if (changeItem) {
			//其他样式控制同理这么操作
			const model = changeItem.getModel();
			model.label = e;
			changeItem.update(model);
		}
	};
	const handleColor = (e) => {
		setfill(e);
		//修改state后改变节点Label
		if (changeItem) {
			//其他样式控制同理这么操作
			const model = changeItem.getModel();
			if (model.style) {
				model.style.fill = e;
				changeItem.update(model);
			}
		}
	};
	const handleFontColor = (e) => {
		setFontfill(e);
		if (changeItem) {
			const model = changeItem.getModel();
			if (
				model.labelCfg &&
				model.labelCfg.style &&
				model.labelCfg.style.fill
			) {
				model.labelCfg.style.fill = e;
			} else {
				model.labelCfg.style = {
					fill: e,
				};
			}

			changeItem.update(model);
		}
	};

	const handleFontSize = (e) => {
		const origin = fontSize;
		const num = parseFloat(e);
		const newstate = isNaN(num) ? origin : num;
		setFontSize(newstate);
		if (changeItem) {
			const model = changeItem.getModel();
			if (model.labelCfg) {
				if (model.labelCfg.style) {
					model.labelCfg.style.fontSize = newstate;
				} else {
					model.labelCfg.style = {
						fontSize: newstate,
					};
				}

				changeItem.update(model);
			}
		}
	};

	return (
		<div style={{ position: "relative" }}>
			<Form
				style={{
					display: show ? "block" : "none",
					position: "absolute",
					padding: "10px",
					right: 0,
				}}
				className="edit-form"
			>
				<div style={{ paddingBottom: "10px" }}>编辑窗口</div>
				<Input
					prepend="修改标签"
					value={label}
					setValueCallback={handleChange}
				></Input>
				<Input
					prepend="节点颜色"
					value={fill}
					setValueCallback={handleColor}
				></Input>
				<Input
					prepend="字体颜色"
					value={fontFill}
					setValueCallback={handleFontColor}
				></Input>
				<Input
					prepend="修改字号"
					value={fontSize}
					setValueCallback={handleFontSize}
				></Input>
				<div
					className="bigbear-input-wrapper"
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<div className="bigbear-input-group-prepend">标签偏移</div>
					<InputNumber
						width="120"
						parentValue={offset}
						parentSetState={setOffset}
						inputNumberCallback={(e) => {
							if (changeItem) {
								const model = changeItem.getModel();
								if (model.labelCfg) {
									const newe = parseInt(e);
									model.labelCfg.offset = newe;
									changeItem.update(model);
								}
							}
						}}
						extraWidth={5}
						btnProps={{
							btnType: "primary",
							size: "sm",
						}}
						minNumber={"0"}
					></InputNumber>
				</div>

				<Select
					data={["center", "top", "left", "right", "bottom"]}
					icon={null}
					defaultValue="标签位置"
					renderTemplate={(item, index, selectSetState, setOpen) => (
						<div
							onClick={() => {
								selectSetState(`${item}`);
								setOpen(false);
								setsel({ sel: selectSetState });
								if (changeItem) {
									const model = changeItem.getModel();
									if (model.labelCfg) {
										model.labelCfg.position = item;
										changeItem.update(model);
									}
								}
							}}
							key={index}
						>
							{item}
						</div>
					)}
				></Select>
			</Form>

			<div ref={ref}></div>
		</div>
	);
}
export default memo(G6main);
