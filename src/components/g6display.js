import React, { useRef, useState, useMemo } from "react";
import { Menu, Select, SubMenu, MenuItem, Button } from "bigbear-ui";
import { useGetBound } from "./hooks";
import G6main from "./g6main/g6main";

let data = {
	label: "Modeling Methods",
	id: "Modeling Methods",
	children: [
		{
			label: "Classification",
			id: "Classification",
			children: [
				{ label: "Logistic regression", id: "Logistic regression" },
				{
					label: "Linear discriminant analysis",
					id: "Linear discriminant analysis",
				},
				{ label: "Rules", id: "Rules" },
				{ label: "Decision trees", id: "Decision trees" },
				{ label: "Naive Bayes", id: "Naive Bayes" },
				{ label: "K nearest neighbor", id: "K nearest neighbor" },
				{
					label: "Probabilistic neural network",
					id: "Probabilistic neural network",
				},
				{
					label: "Support vector machine",
					id: "Support vector machine",
				},
			],
		},
		{
			label: "Regression",
			id: "Regression",
			children: [
				{
					label: "Multiple linear regression",
					id: "Multiple linear regression",
				},
				{ label: "Partial least squares", id: "Partial least squares" },
				{
					label: "Multi-layer feedforward neural network",
					id: "Multi-layer feedforward neural network",
				},
				{
					label: "General regression neural network",
					id: "General regression neural network",
				},
				{
					label: "Support vector regression",
					id: "Support vector regression",
				},
			],
		},
	],
};

function G6display() {
	const ref = useRef(null);
	const bound = useGetBound(ref);
	const [layout, setLayout] = useState("0-0");
	const [mode, setMode] = useState("0");
	const [out, setOut] = useState(0);
	const handleUpload = () => {
		setOut((p) => p + 1);
	};
	const main = useMemo(() => {
		return (
			<G6main
				data={data}
				bound={bound}
				mode={mode}
				setMode={setMode}
				layout={layout}
				out={out}
			></G6main>
		);
	}, [bound, layout, mode, out]);

	return (
		<div style={{ height: "100%", overflow: "hidden" }}>
			<div style={{ display: "flex" }}>
				<Menu
					onSelect={(index) => {
						setLayout(index);
					}}
					defaultIndex="0-0"
				>
					<SubMenu title="布局模式">
						<MenuItem>H</MenuItem>
						<MenuItem>V</MenuItem>
						<MenuItem>LR</MenuItem>
						<MenuItem>RL</MenuItem>
						<MenuItem>TB</MenuItem>
						<MenuItem>BT</MenuItem>
					</SubMenu>
				</Menu>

				<Button onClick={() => handleUpload()}> 导出数据</Button>
				<Menu
					style={{
						justifyContent: "flex-end",
						flex: 1,
					}}
					defaultIndex="0"
					onSelect={(index) => {
						setMode(index);
					}}
				>
					<Menu.MenuItem>默认模式</Menu.MenuItem>
					<Menu.MenuItem>添加模式</Menu.MenuItem>
					<Menu.MenuItem>删除模式</Menu.MenuItem>
				</Menu>
			</div>

			<div
				className="bigbear-layout-wrapper-default"
				style={{ height: "100%" }}
				ref={ref}
			>
				{main}
			</div>
		</div>
	);
}

export default G6display;
