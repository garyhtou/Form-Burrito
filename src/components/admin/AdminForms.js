import React from "react";
import "./AdminForms.css";
import firebase from "../../firebase";
import config from "./../../config";
import {
	Table,
	Space,
	Tooltip,
	Form,
	Input,
	Select,
	Button,
	notification,
} from "antd";
import { EditOutlined, DeleteOutlined, DownOutlined } from "@ant-design/icons";

class AdminForms extends React.Component {
	constructor(props) {
		super(props);

		const formColumns = [
			{
				title: "Custom URL",
				dataIndex: "short",
				key: "short",
				render: (url, row) => {
					if (row.edit) {
						var editElements = (
							<div className="editRow">
								<Form
									hideRequiredMark
									onFinish={(values) => {
										var updates = {};
										updates.full = values.full.trim();
										updates.short = values.short.trim();
										updates.type = values.type.trim();

										firebase
											.database()
											.ref("urls/" + row.pushKey)
											.update(updates)
											.then(() => {
												notification.open({
													type: "success",
													message: "Success",
													description: "Updates have been saved.",
												});
											})
											.catch((err) => {
												notification.open({
													type: "error",
													message: err.toString(),
												});
											});

										this.close(row.pushKey);
									}}
								>
									<Form.Item
										label="Original URL"
										className="admin-forms-editRowItem"
										rules={[
											{
												required: true,
												message: "Please enter the form's original URL!",
											},
										]}
										name="full"
										initialValue={row.full}
									>
										<Input />
									</Form.Item>
									<Form.Item
										label="Custom URL"
										className="admin-forms-editRowItem admin-forms-editRowItem-customURL"
										rules={[
											{
												required: true,
												message: "Please enter the form's custom URL!",
											},
										]}
										name="short"
										initialValue={row.short}
									>
										<Input style={{ flexGrow: 1 }} />
									</Form.Item>
									<div
										style={{
											display: "flex",
											flexDirection: "row",
											alignItems: "flex-start",
										}}
									>
										<Form.Item
											label="Type"
											className="admin-forms-editRowItem admin-forms-editRowItem-type"
											rules={[
												{
													required: true,
													message: "Please select a form type!",
												},
											]}
											name="type"
											initialValue={row.type}
											style={{ flexGrow: 1, marginRight: "20px" }}
										>
											<Select>
												<Select.Option value="typeform">Typeform</Select.Option>
												<Select.Option value="googleforms">
													Google Forms
												</Select.Option>
												<Select.Option value="other">Other</Select.Option>
											</Select>
										</Form.Item>
										<Space>
											<Button type="primary" htmlType="submit">
												Save
											</Button>
											<Button
												danger
												onClick={() => {
													this.delete(row.pushKey);
													this.close(row.pushKey);
												}}
											>
												Delete
											</Button>
											<Button
												type="default"
												onClick={() => {
													this.close(row.pushKey);
												}}
											>
												Cancel
											</Button>
										</Space>
									</div>
								</Form>
							</div>
						);
						return { children: editElements, props: { colSpan: 4 } };
					}
					return (
						<a target="_blank" href={"/" + url}>
							{url}
						</a>
					);
				},
			},
			{
				title: "Original URL",
				dataIndex: "full",
				key: "full",
				render: (url, row) => {
					if (row.edit) {
						return {
							props: { colSpan: 0 },
						};
					}
					return (
						<>
							<a target="_blank" href={url}>
								{url}
							</a>
						</>
					);
				},
			},
			{
				title: "Created",
				dataIndex: "time",
				key: "created",
				render: (epoch, row) => {
					if (row.edit) {
						return {
							props: { colSpan: 0 },
						};
					}
					if (typeof epoch === "undefined") {
						return "N/A";
					}
					var date = new Date(0);
					date.setUTCMilliseconds(epoch);
					return (
						<Tooltip title={date.toTimeString()}>{date.toDateString()}</Tooltip>
					);
				},
			},
			{
				title: "Actions",
				dataIndex: "actions",
				key: "actions",
				render: (actions, row) => {
					if (row.edit) {
						return {
							props: { colSpan: 0 },
						};
					}
					if (row.editParent) {
						return <DownOutlined className="admin-forms-actionIcons" />;
					}
					return (
						<Space size="middle">
							<a
								onClick={() => {
									this.edit(row.pushKey);
								}}
								style={{ color: "inherit" }}
							>
								<EditOutlined className="admin-forms-actionIcons" />
							</a>
							<a
								onClick={() => {
									this.delete(row.pushKey);
								}}
								style={{ color: "inherit" }}
							>
								<DeleteOutlined className="admin-forms-actionIcons" />
							</a>
						</Space>
					);
				},
			},
		];

		this.state = {
			formColumns: formColumns,
			formData: [],
			loading: true,
			settings: {
				manyToOne: true,
			},
		};
	}

	componentDidMount() {
		this.formDataListener = firebase
			.database()
			.ref("urls")
			.on(
				"value",
				function (snapshot) {
					if (typeof snapshot !== "undefined" && snapshot.val() !== null) {
						var data = snapshot.val();
						var formData = [];

						for (var pushKey in data) {
							var entry = data[pushKey];

							formData.push({
								short: entry.short,
								full: entry.full,
								time: entry.time,
								type: entry.type,
								pushKey: pushKey,
								edit: false,
								editParent: false,
							});
						}

						formData.reverse();

						this.setState({ formData, loading: false });
					}
				}.bind(this)
			);

		this.settingsListener = firebase
			.database()
			.ref("settings")
			.on(
				"value",
				function (snapshot) {
					if (typeof snapshot !== "undefined" && snapshot.val() !== null) {
						this.setState({ settings: snapshot.val() });
					}
				}.bind(this)
			);
	}

	componentWillUnmount() {
		this.formDataListener && this.formDataListener();
		this.formDataListener = undefined;

		this.settingsListener && this.settingsListener();
		this.settingsListener = undefined;
	}

	edit(pushKey) {
		var formData = JSON.parse(JSON.stringify(this.state.formData));

		var entryIndex;
		for (let i = 0; i < formData.length; i++) {
			let entry = formData[i];
			if (entry.pushKey === pushKey && entry.edit === false) {
				entryIndex = i;
				break;
			}
		}
		var editEntry = formData[entryIndex];

		formData.splice(entryIndex + 1, 0, {
			short: editEntry.short,
			full: editEntry.full,
			time: editEntry.time,
			type: editEntry.type,
			pushKey: editEntry.pushKey,
			edit: true,
			editParent: false,
		});

		formData[entryIndex].editParent = true;

		this.setState({ formData: formData });
	}

	close(pushKey) {
		var formData = JSON.parse(JSON.stringify(this.state.formData));

		var entryIndex;
		var editIndex;
		for (let i = 0; i < formData.length; i++) {
			let entry = formData[i];
			if (entry.pushKey === pushKey) {
				if (entry.edit) {
					editIndex = i;
				} else if (entry.editParent) {
					entryIndex = i;
				}
			}
		}

		formData.splice(editIndex, 1);
		formData[entryIndex].editParent = false;

		this.setState({ formData: formData });
	}

	delete(pushKey) {
		firebase
			.database()
			.ref("urls/" + pushKey)
			.remove()
			.then(() => {
				notification.open({
					type: "success",
					message: "Success",
					description: "Form has been deleted.",
				});
			})
			.catch((err) => {
				notification.open({
					type: "error",
					message: err.toString(),
				});
			});
	}

	addFormRef = React.createRef();

	render() {
		return (
			<>
				<div className="admin-forms-addWrapper">
					<Form
						ref={this.addFormRef}
						hideRequiredMark
						onFinish={(values) => {
							var updates = {};
							updates.full = values.full.trim();
							updates.short = values.short.trim();
							updates.time = firebase.database.ServerValue.TIMESTAMP;

							if (values.full.includes("typeform.com")) {
								updates.type = "typeform";
							} else if (
								values.full.includes("docs.google.com/forms") ||
								values.full.includes("forms.gle")
							) {
								updates.type = "googleforms";
							} else {
								updates.type = "other";
							}

							for (let entry of this.state.formData) {
								if (entry.short === updates.short) {
									notification.open({
										type: "error",
										message: "Choose another Custom URL",
										description: (
											<>
												<p>
													<code>{updates.short}</code> is already being used by{" "}
													<code>{entry.full}</code>
												</p>
											</>
										),
									});
									return;
								}
								if (
									entry.full === updates.full &&
									!this.state.settings.manyToOne
								) {
									notification.open({
										type: "error",
										message: (
											<p>
												This form already has a Custom URL:{" "}
												<code>{updates.full}</code>
											</p>
										),
										description: (
											<p>
												To allow for multiple custom urls per form, change the{" "}
												<code>Many to One</code> setting.
											</p>
										),
									});
									return;
								}
							}

							firebase
								.database()
								.ref("urls/")
								.push(updates)
								.then(() => {
									notification.open({
										type: "success",
										message: "Success",
										description: "New form has been added.",
									});

									this.addFormRef.current.resetFields();
								})
								.catch((err) => {
									notification.open({
										type: "error",
										message: err.toString(),
									});
								});
						}}
					>
						<div style={{ display: "flex", flexDirection: "row" }}>
							<Form.Item
								label="Original URL"
								className="admin-forms-editRowItem"
								rules={[
									{
										required: true,
										message: "Please enter the form URL!",
									},
								]}
								name="full"
								style={{ marginRight: "15px", flexGrow: 1 }}
							>
								<Input />
							</Form.Item>
							<Form.Item
								label="Custom URL"
								className="admin-forms-editRowItem admin-forms-editRowItem-customURL"
								rules={[
									{
										required: true,
										message: "Please enter a custom slug for the form!",
									},
								]}
								name="short"
								style={{ marginRight: "15px", flexGrow: 3 }}
							>
								<Input style={{ flexGrow: 1 }} />
							</Form.Item>

							<Button type="primary" htmlType="submit" style={{ flexGrow: 0 }}>
								Add
							</Button>
						</div>
					</Form>
				</div>

				<Table
					loading={this.state.loading}
					columns={this.state.formColumns}
					dataSource={this.state.formData}
				/>

				<style
					dangerouslySetInnerHTML={{
						__html: [
							".admin-forms-editRowItem-customURL div div div:before {",
							"content: '" +
								window.location.protocol +
								"//" +
								window.location.hostname +
								(window.location.port ? ":" + window.location.port : "") +
								"/" +
								"';",
							"margin: 0;",
							"margin-right: 5px;",
							"align-self: center;",
							"}",
						].join("\n"),
					}}
				/>
			</>
		);
	}
}

export default AdminForms;
