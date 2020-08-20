import React, { useRef, useMemo } from "react";
import G6main from "./components/g6main/g6main";
import G6display from "./components/g6display";
import { Layout, Menu, List } from "bigbear-ui";
import "./app.css";
import { useGetBound, useGetBodyBound } from "./components/hooks";
const fs = require("fs");
console.log(fs);

export const leftData = [
	"Racing car sprays burning fuel into crowd.",
	"Japanese princess to wed commoner.",
	"Australian walks 100km after outback crash.",
	"Man charged over missing wedding girl.",
	"Los Angeles battles huge wildfsdaaaaaaaaaaairssssadddddddddssssssssssssssssses.",
	"Racing car sprays burning fuel into crowd.",
	"Japanese princess to wed commoner.",
	"Australian walks 100km after outback crash.",
	"Man charged over missing wedding girl.",
	"Racing car sprays burning fuel into crowd.",
	"Japanese princess to wed commoner.",
	"Australian walks 100km after outback crash.",
	"Man charged over missing wedding girl.",
	"Racing car sprays burning fuel into crowd.",
	"Japanese princess to wed commoner.",
	"Australian walks 100km after outback crash.",
	"Man charged over missing wedding girl.",
	"Racing car sprays burning fuel into crowd.",
	"Japanese princess to wed commoner.",
	"Australian walks 100km after outback crash.",
	"Man charged over missing wedding girl.",
	"Racing car sprays burning fuel into crowd.",
	"Japanese princess to wed commoner.",
	"Australian walks 100km after outback crash.",
	"Man charged over missing wedding girl.",
];

function App() {
	const bound = useGetBodyBound();
	const bodyWidth = useMemo(() => {
		return bound && bound.width ? bound.width : 800;
	}, [bound]);
	const bodyHeight = useMemo(() => {
		return bound && bound.height ? bound.height : 680;
	}, [bound]);
	const leftWidth = 240;
	return (
		<Layout style={{ height: "100%" }}>
			<Layout row>
				<Layout.Sider>
					<List
						withHoverActive={true}
						renderTemplate={(child) => (
							<div
								style={{
									fontSize: "12px",
									textAlign: "left",
									width: "100%",
									overflow: "hidden",
									textOverflow: "ellipsis",
									height: "20px",
									whiteSpace: "nowrap",
									cursor: "pointer",
								}}
								onClick={(e) => console.log(e.target)}
							>
								{child}
							</div>
						)}
						style={{
							padding: "5px",
							height: "100%",
							overflow: "auto",
							width: `${leftWidth}px`,
						}}
					>
						{leftData}
					</List>
				</Layout.Sider>
				<Layout.Content
					className="bigbear-layout-block-default"
					style={{
						width: `${bodyWidth - leftWidth}px`,
						height: `${bodyHeight}px`,
					}}
				>
					<G6display></G6display>
				</Layout.Content>
			</Layout>
		</Layout>
	);
}

export default App;
