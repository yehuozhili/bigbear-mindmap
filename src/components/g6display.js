import React, { useRef, useState, useMemo } from "react";
import { Menu, SubMenu, MenuItem, Button } from "bigbear-ui";
import { useGetBound } from "./hooks";
import G6main from "./g6main/g6main";

function G6display(props) {
	const { data, activePath } = props;
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
				activePath={activePath}
			></G6main>
		);
	}, [activePath, bound, data, layout, mode, out]);

	return (
		<div style={{ height: "100%", overflow: "hidden" }}>
			<div
				style={{
					display: "flex",
					height: "45px",
					flexWrap: "nowrap",
				}}
			>
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

				<Button
					lineargradient
					btnType="primary"
					onClick={() => handleUpload()}
				>
					导出数据
				</Button>
				<Button
					lineargradient
					btnType="info"
					onClick={() => handleUpload()}
				>
					导出图片
				</Button>
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
