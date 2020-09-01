import React from "react";
import { Spin, Layout } from "antd";

const { Content } = Layout;

function Loading() {
	return (
		<>
			{/* IT IS PROBABLY BEST TO SHOW NOTHING AS THE LOADING TIME IS SHORT */}

			{/* <Layout style={{ minHeight: "100vh" }}>
				<Content
					style={{
						padding: "50px",
						textAlign: "center",
						verticalAlign: "middle",
						position: "relative",
					}}
				>
					<div
						style={{
							position: "absolute",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
							textAlign: "center",
						}}
					>
						<Spin size="large" />
					</div>
				</Content>
			</Layout> */}
		</>
	);
}

export default Loading;
