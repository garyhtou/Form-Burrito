import React from "react";
import "./Admin.css";
import { Helmet } from "react-helmet";
import config from "../../config";
import { Layout, Menu } from "antd";
import {
	FormOutlined,
	UserOutlined,
	SettingOutlined,
	GithubOutlined,
} from "@ant-design/icons";
import AdminUsers from "./AdminUsers";
import AdminSettings from "./AdminSettings";
import AdminForms from "./AdminForms";

const { Content, Footer, Sider } = Layout;

class Admin extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			collapsed: false,
			page: "forms",
		};
	}

	componentDidMount() {
		//
	}

	onCollapse = (collapsed) => {
		console.log(collapsed);
		this.setState({ collapsed });
	};

	render() {
		return (
			<>
				<Helmet>
					{/* if not authed for admin, show error in title */}
					<title>{config.entityName} Forms - Admin</title>
				</Helmet>
				<Layout style={{ minHeight: "100vh" }}>
					<Sider
						collapsible
						collapsed={this.state.collapsed}
						onCollapse={this.onCollapse}
					>
						{!this.state.collapsed ? (
							<div className="logo">
								<a href={config.homeRedirect}>
									<h1>{config.entityName}</h1>
								</a>
							</div>
						) : (
							<br />
						)}
						<Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
							<Menu.Item
								key="forms"
								icon={<FormOutlined />}
								onClick={() => {
									this.setState({ page: "forms" });
								}}
							>
								Forms
							</Menu.Item>
							<Menu.Item
								key="users"
								icon={<UserOutlined />}
								onClick={() => {
									this.setState({ page: "users" });
								}}
							>
								Users
							</Menu.Item>
							<Menu.Item
								key="settings"
								icon={<SettingOutlined />}
								onClick={() => {
									this.setState({ page: "settings" });
								}}
							>
								Settings
							</Menu.Item>
						</Menu>
					</Sider>
					<Layout className="site-layout">
						<Content style={{ margin: "0 16px" }}>
							<div
								className="site-layout-background"
								style={{ padding: 24, minHeight: 360 }}
							>
								{this.state.page === "users" ? (
									// ============= USERS =============
									<>
										<h1 className="admin-pageTitle">Users</h1>
										<AdminUsers />
									</>
								) : this.state.page === "settings" ? (
									// ============= SETTINGS =============
									<>
										<h1 className="admin-pageTitle">Settings</h1>
										<AdminSettings />
									</>
								) : (
									// ============= DEFAULT PAGE (FORMS) =============
									<>
										<h1 className="admin-pageTitle">Forms</h1>
										<AdminForms />
									</>
								)}
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
				</Layout>
			</>
		);
	}
}

export default Admin;
