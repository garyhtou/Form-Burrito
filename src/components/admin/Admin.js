import React from "react";
import "./Admin.css";
import firebase from "../../firebase";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import * as firebaseui from "firebaseui";
import { Helmet } from "react-helmet";
import config from "../../config";
import { Layout, Menu, Spin, notification, Modal, Button } from "antd";
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
			welcomeMessage: this.randomMessage(true),
			newAdminModal: false,
		};

		this.signout = this.signout.bind(this);
		this.closeNewAdminModal = this.closeNewAdminModal.bind(this);
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

					this.userListener = firebase
						.database()
						.ref("users/" + user.uid)
						.on(
							"value",
							function (snapshot) {
								if (snapshot.exists()) {
									this.setState({ newAdminModal: snapshot.val().newAdmin });
								}
							}.bind(this)
						);
				} else {
					this.setState({
						loggedIn: false,
						loading: false,
						admin: false,
						newAdmin: false,
					});
				}
			}.bind(this)
		);
	}

	closeNewAdminModal() {
		this.setState({ newAdminModal: false });
		firebase
			.database()
			.ref("users/" + firebase.auth().currentUser.uid + "/newAdmin")
			.set(false);
	}

	componentWillUnmount() {
		this.authListener && this.authListener();
		this.authListener = undefined;

		this.adminListener && this.adminListener();
		this.adminListener = undefined;
		this.authListener = undefined;

		this.userListener && this.userListener();
		this.userListener = undefined;
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
					description: this.randomMessage(false),
				});
				this.setState({
					collapsed: false,
					page: "forms",
					loggedIn: false,
					admin: false,
					newAdminModal: false,
				});
			});
	}

	authMessages = {
		login: [
			"Nice to see you again",
			"Oh hey there!",
			"Hope you brought some guac!",
			"Another form?! How many you got?!",
		],
		logout: [
			"Cya later!",
			"Wait hold on! You forgot your burrito",
			"Are you leaving me for pizza?!",
		],
		both: [
			"Did you want avocado?",
			"Bowls > Burritos... whoops",
			"White or brown rice?",
			"Black or pinto beans?",
			"Wait! Did someone say tacos? 🌮😤",
			"I really like burritos... I can taco about them all day",
			<p>
				Need some guac?{" "}
				<a
					href="https://twitter.com/chipotletweets/status/1253385212236455936"
					target="_blank"
					rel="noopener noreferrer"
				>
					Here you go!
				</a>
			</p>,
			<p>
				Did you know there are{" "}
				<a
					href="https://www.businessinsider.com/how-many-combinations-can-you-order-at-chipotle-2013-7"
					target="_blank"
					rel="noopener noreferrer"
				>
					655,360 combinations
				</a>{" "}
				at Chipotle?
			</p>,
		],
	};

	randomMessage(login, currentMessage) {
		const gen = function (login) {
			if (typeof login === "undefined") {
				return this.authMessages.both[
					Math.floor(Math.random() * this.authMessages.both.length + 1) - 1
				];
			} else if (login) {
				var messages = this.authMessages.both.concat(this.authMessages.login);
				return messages[Math.floor(Math.random() * messages.length + 1) - 1];
			} else {
				var messages = this.authMessages.both.concat(this.authMessages.logout);
				return messages[Math.floor(Math.random() * messages.length + 1) - 1];
			}
		}.bind(this);

		var one;
		if (typeof login === "undefined") {
			one = this.authMessages.both.length === 1;
		} else if (login) {
			one = this.authMessages.both.concat(this.authMessages.login).length === 1;
		} else {
			one =
				this.authMessages.both.concat(this.authMessages.logout).length === 1;
		}

		if (one) {
			return gen(login);
		} else {
			var newMessage = currentMessage;
			while (newMessage === currentMessage) {
				newMessage = gen(login);
			}
			return newMessage;
		}
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

				console.log("signed in");

				firebase
					.database()
					.ref("admins/")
					.once("value", function (snapshot) {
						var newAdmin = false;
						if (!snapshot.exists()) {
							console.log("FIRST USER! WELCOME!");

							newAdmin = true;

							firebase
								.database()
								.ref("admins/" + authResult.user.uid)
								.set(true);
							firebase.database().ref("settings/manyToOne").set(false);
						} else {
							console.log("Not first user");
						}

						firebase
							.database()
							.ref("users/" + authResult.user.uid)
							.once("value", function (snapshot) {
								if (snapshot.exists()) {
									firebase
										.database()
										.ref("users/" + authResult.user.uid)
										.set({
											email: authResult.user.email,
											name: authResult.user.displayName,
											photoURL: photoURL,
											newAdmin: newAdmin ? newAdmin : snapshot.val().newAdmin,
										});
								} else {
									firebase
										.database()
										.ref("users/" + authResult.user.uid)
										.set({
											email: authResult.user.email,
											name: authResult.user.displayName,
											photoURL: photoURL,
											newAdmin: true,
										});
								}
							});
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
													defaultSelectedKeys={["forms"]}
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
													<a
														className="gh-link"
														href="https://github.com/garytou2/Forms-Custom-Domain"
													>
														Form Burrito <GithubOutlined />
													</a>
													<span className="credit-sep">|</span>
													Developed by{" "}
													<a href="https://garytou.com">Gary Tou</a>
												</Footer>
											</Layout>
										</Layout>
										<Modal
											visible={this.state.newAdminModal}
											onCancel={this.closeNewAdminModal}
											footer={null}
										>
											<div>
												<img
													src="/logo.png"
													style={{ width: "90%", marginBottom: "30px" }}
												/>
												<h2>
													Welcome, {firebase.auth().currentUser.displayName}
												</h2>
												<p>
													Form Burrito hides the ugly URLs created by Google
													Forms, Typeform, and other form providers by
													✨wrapping✨ it in your own beautiful, custom
													burrito🌯 (ahem... i meant domain). Need a more
													technical explination? It seamlessly iframes your
													forms on your domain and gives you can easy way for
													you (and your team) to manage them!
												</p>
												<p>
													If you have any questions, please refer to the Read Me{" "}
													on{" "}
													<a href="https://github.com/garytou2/Form-Burrito">
														GitHub <GithubOutlined />
													</a>
												</p>

												<div
													style={{
														width: "100%",
														textAlign: "right",
														marginTop: "30px",
													}}
												>
													<Button
														type="primary"
														onClick={this.closeNewAdminModal}
													>
														Sounds cool!
													</Button>
												</div>
											</div>
										</Modal>
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
												<a
													className="gh-link"
													href="https://github.com/garytou2/Forms-Custom-Domain"
												>
													Form Burrito <GithubOutlined />
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
										<div className="floatBurritoWrapper">
											<img
												src="./icon512.png"
												alt="Form Burrito Icon"
												draggable={false}
												onClick={() => {
													this.setState({
														welcomeMessage: this.randomMessage(
															true,
															this.state.welcomeMessage
														),
													});
												}}
											/>
											<div className="speech-bubble">
												{this.state.welcomeMessage}
											</div>
										</div>
									</Content>

									<Footer style={{ textAlign: "center" }}>
										<a
											className="gh-link"
											href="https://github.com/garytou2/Forms-Custom-Domain"
										>
											Form Burrito <GithubOutlined />
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
