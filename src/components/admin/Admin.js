import React from "react";
import "./Admin.css";
import firebase from "../../firebase";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import * as firebaseui from "firebaseui";
import { Helmet } from "react-helmet";
import config from "../../config";
import { Layout, Menu, Spin, notification } from "antd";
import Icon, {
	FormOutlined,
	SettingOutlined,
	GithubOutlined,
	LogoutOutlined,
} from "@ant-design/icons";
import AdminForms from "./AdminForms";
import AdminSettings from "./AdminSettings";

const { Header, Content, Footer, Sider } = Layout;

class Admin extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			collapsed: false,
			page: "forms",
			loading: true,
			loggedIn: false,
			admin: false,
		};

		this.signout = this.signout.bind(this);
	}

	componentDidMount() {
		this.authListener = firebase.auth().onAuthStateChanged(
			function (user) {
				if (user) {
					this.adminListener = firebase
						.database()
						.ref("admins")
						.on(
							"value",
							function (snapshot) {
								if (
									typeof snapshot !== "undefined" &&
									snapshot.val() !== null
								) {
									if (
										typeof snapshot.val()[user.uid] !== "undefined" &&
										snapshot.val()[user.uid] === true
									) {
										this.setState({
											loggedIn: true,
											admin: true,
											loading: false,
										});
									} else {
										this.setState({
											loggedIn: true,
											admin: false,
											loading: false,
										});
									}
								}
							}.bind(this)
						);
				} else {
					this.setState({ loggedIn: false, loading: false });
				}
			}.bind(this)
		);
	}

	componentWillUnmount() {
		this.authListener && this.authListener();
		this.authListener = undefined;

		this.adminListener && this.adminListener();
		this.adminListener = undefined;
	}

	signout() {
		var name = firebase.auth().currentUser.displayName;
		firebase
			.auth()
			.signOut()
			.then(() => {
				notification.open({
					icon: (
						<Icon
							component={() => (
								<img src="/icon512.png" width="30px" alt="Form Burrito Logo" />
							)}
						/>
					),
					message: "Goodbye, " + name,
					description: this.authMessages.logout[
						Math.floor(Math.random() * this.authMessages.logout.length + 1) - 1
					],
				});
			});
	}

	// Configure FirebaseUI.
	firebaseUiConfig = {
		signInFlow: "popup",
		signInSuccessUrl: "/admin",
		signInOptions: [
			firebase.auth.EmailAuthProvider.PROVIDER_ID,
			firebase.auth.GoogleAuthProvider.PROVIDER_ID,
		],
		credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
		callbacks: {
			signInSuccessWithAuthResult(authResult, redirectUrl) {
				var photoURL = authResult.user.photoURL;
				if (photoURL === null || photoURL === "") {
					photoURL = "https://www.gravatar.com/avatar/?d=mp";
				}

				firebase
					.database()
					.ref("users/" + authResult.user.uid)
					.set({
						email: authResult.user.email,
						name: authResult.user.displayName,
						photoURL: photoURL,
					});

				firebase
					.database()
					.ref("admins/")
					.once("value", function (snapshot) {
						if (!snapshot.exists()) {
							console.log("FIRST USER! WELCOME!");
							firebase
								.database()
								.ref("admins/" + authResult.user.uid)
								.set(true)
								.then(() => {
									notification.open({
										type: "info",
										message: "Welcome to Form Burrito!",
										description: (
											<p>
												If you have any questions, please refer to the{" "}
												<a href="https://github.com/garytou2/Form-Burrito">
													Read Me
												</a>{" "}
												on GitHub <GithubOutlined />
											</p>
										),
									});
								});
							firebase.database().ref("settings/manyToOne").set(false);
						} else {
							console.log("Not first user");
						}
					});

				return false;
			},
			signInFailure(error) {
				notification.open({
					type: "error",
					message: error.toString(),
				});
			},
		},
	};

	authMessages = {
		logout: [
			"Cya later!",
			"Wait hold on! You forgot your burrito",
			"Are you leaving me for pizza?!",
			"Bowls > Burritos... whoops",
		],
	};

	onCollapse = (collapsed) => {
		console.log(collapsed);
		this.setState({ collapsed });
	};

	render() {
		return (
			<>
				{this.state.loading ? (
					<Layout style={{ minHeight: "100vh" }}>
						<Content
							style={{
								padding: "50px",
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<Spin size="large" />
						</Content>
					</Layout>
				) : (
					<>
						{this.state.loggedIn ? (
							<>
								{this.state.admin ? (
									<>
										<Helmet>
											<title>{config.entityName} Forms - Admin</title>
										</Helmet>
										<Layout style={{ minHeight: "100vh" }}>
											<Sider
												collapsible
												collapsed={this.state.collapsed}
												onCollapse={this.onCollapse}
											>
												{!this.state.collapsed ? (
													<div className="entityName">
														<a href={config.homeRedirect}>
															<h1
																id={
																	config.entityName === "Form Burrito"
																		? "entityNameFormBurrito"
																		: ""
																}
															>
																{config.entityName}
															</h1>
														</a>
													</div>
												) : (
													<br />
												)}
												<Menu
													theme="dark"
													defaultSelectedKeys={["1"]}
													mode="inline"
												>
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
														key="settings"
														icon={<SettingOutlined />}
														onClick={() => {
															this.setState({ page: "settings" });
														}}
													>
														Settings
													</Menu.Item>
													<Menu.Item
														key="logout"
														icon={<LogoutOutlined />}
														onClick={this.signout}
													>
														Logout
													</Menu.Item>
												</Menu>
											</Sider>
											<Layout>
												<Content style={{ margin: "0 16px" }}>
													<div style={{ padding: 24, minHeight: 360 }}>
														{this.state.page === "settings" ? (
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
													Developed by{" "}
													<a href="https://garytou.com">Gary Tou</a>
												</Footer>
											</Layout>
										</Layout>
									</>
								) : (
									<>
										<Helmet>
											<title>{config.entityName} Forms - Admin</title>
										</Helmet>
										<Layout style={{ minHeight: "100vh" }}>
											<Header>
												<div className="entityName">
													<a href={config.homeRedirect}>
														<h1>{config.entityName}</h1>
													</a>
												</div>
											</Header>
											<Content
												style={{
													padding: "50px",
													display: "flex",
													justifyContent: "center",
													alignItems: "center",
												}}
											>
												<div className="admin-login-container">
													<a href="https://github.com/garytou2/Form-Burrito">
														<img
															src="/logo.png"
															className="admin-login-logo"
															draggable={false}
															alt="Form Burrito Logo"
														/>
													</a>
													<h1 style={{ marginTop: "30px" }}>
														Welcome, {firebase.auth().currentUser.displayName}
													</h1>
													<p>
														You aren't an Admin yet.{" "}
														<a onClick={this.signout} href="#">
															Sign out
														</a>
													</p>
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
								)}
							</>
						) : (
							<>
								<Helmet>
									<title>{config.entityName} Forms - Login</title>
								</Helmet>
								<Layout style={{ minHeight: "100vh" }}>
									<Header>
										<div className="entityName">
											<a href={config.homeRedirect}>
												<h1>{config.entityName}</h1>
											</a>
										</div>
									</Header>
									<Content
										style={{
											padding: "50px",
											display: "flex",
											justifyContent: "center",
											alignItems: "center",
										}}
									>
										<div className="admin-login-container">
											<a href="https://github.com/garytou2/Form-Burrito">
												<img
													src="/logo.png"
													className="admin-login-logo"
													draggable={false}
													alt="Form Burrito Logo"
												/>
											</a>
											<h1 style={{ marginTop: "30px" }}>Login</h1>
											<StyledFirebaseAuth
												uiConfig={this.firebaseUiConfig}
												firebaseAuth={firebase.auth()}
											/>
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
						)}
					</>
				)}
			</>
		);
	}
}

export default Admin;
