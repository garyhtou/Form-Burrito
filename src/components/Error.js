import React from "react";
import "./Error.css";
import { Helmet } from "react-helmet";
import { Layout } from "antd";
import { GithubOutlined } from "@ant-design/icons";

const { Header, Content, Footer } = Layout;

function Error() {
	return (
		<>
			<Helmet>
				<title>Forms Burriot - 404</title>
			</Helmet>
			<Layout style={{ minHeight: "100vh" }}>
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
							transform: "translateY(-50%)",
							textAlign: "center",
						}}
					>
						<img src="/logo.png" className="error-logo" draggable={false} />

						<h1>Uh oh...</h1>
						<h2>This form has gone missing!</h2>
					</div>
				</Content>

				<Footer style={{ textAlign: "center" }}>
					Form Burrito{" "}
					<a
						className="gh-link"
						href="https://github.com/garytou2/Forms-Custom-Domain"
					>
						<GithubOutlined />
					</a>
					<span className="credit-sep">|</span>
					Developed by <a href="https://garytou.com">Gary Tou</a>
				</Footer>
			</Layout>
		</>
	);
}

export default Error;
