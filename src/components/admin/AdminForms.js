import React from "react";
import "./AdminForms.css";
import firebase from "../../firebase";
import {
	Table,
	Space,
	Tooltip,
	Form,
	Input,
	Select,
	Button,
	notification,
	Popconfirm,
	Empty,
} from "antd";
import {
	EditOutlined,
	DeleteOutlined,
	DownOutlined,
	SearchOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";

class AdminForms extends React.Component {
	constructor(props) {
		super(props);

		// const formColumns =

		this.state = {
			// formColumns: formColumns,
			formData: [],
			loading: true,
			settings: {
				manyToOne: true,
			},
		};

		this.checkURL = this.validateURL.bind(this);
	}

	getColumnSearchProps = (dataIndex) => ({
		filterDropdown: ({
			setSelectedKeys,
			selectedKeys,
			confirm,
			clearFilters,
		}) => (
			<div style={{ padding: 8 }}>
				<Input
					ref={(node) => {
						this.searchInput = node;
					}}
					placeholder={`Search ${dataIndex}`}
					value={selectedKeys[0]}
					onChange={(e) =>
						setSelectedKeys(e.target.value ? [e.target.value] : [])
					}
					onPressEnter={() =>
						this.handleSearch(selectedKeys, confirm, dataIndex)
					}
					style={{ width: 188, marginBottom: 8, display: "block" }}
				/>
				<Space>
					<Button
						type="primary"
						onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
						icon={<SearchOutlined />}
						size="small"
						style={{ width: 90 }}
					>
						Search
					</Button>
					<Button
						onClick={() => this.handleReset(clearFilters)}
						size="small"
						style={{ width: 90 }}
					>
						Reset
					</Button>
				</Space>
			</div>
		),
		filterIcon: (filtered) => (
			<SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
		),
		onFilter: (value, record) =>
			record[dataIndex]
				? record[dataIndex]
						.toString()
						.toLowerCase()
						.includes(value.toLowerCase())
				: "",
		onFilterDropdownVisibleChange: (visible) => {
			if (visible) {
				setTimeout(() => this.searchInput.select(), 100);
			}
		},
		render: (text) =>
			this.state.searchedColumn === dataIndex ? (
				<Highlighter
					highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
					searchWords={[this.state.searchText]}
					autoEscape
					textToHighlight={text ? text.toString() : ""}
				/>
			) : (
				text
			),
	});

	handleSearch = (selectedKeys, confirm, dataIndex) => {
		confirm();
		this.setState({
			searchText: selectedKeys[0],
			searchedColumn: dataIndex,
		});
	};

	handleReset = (clearFilters) => {
		clearFilters();
		this.setState({ searchText: "" });
	};

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
					} else {
						this.setState({ loading: false });
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

	validateURL(url) {
		return new Promise((resolve, reject) => {
			var corsAnywhere = "https://cors-anywhere.herokuapp.com/";

			fetch(corsAnywhere + url)
				.then(function (response) {
					if (response.status === 404) {
						throw new Error("404");
					} else {
						resolve(url);
					}
				})
				.catch(function (err) {
					reject("Invalid URL: " + err);
				});
		});
	}

	validateAll(values, existingPushKey) {
		return new Promise((resolve, reject) => {
			if (values.short === "admin") {
				notification.open({
					type: "error",
					message: "Silly you!",
					description: (
						<>
							<p>
								You can't use <code>{values.short}</code> as your custom URL.
							</p>
						</>
					),
				});
				return reject("You can't use admin as your custom URL");
			}

			for (let entry of this.state.formData) {
				if (entry.pushKey !== existingPushKey) {
					if (entry.short === values.short) {
						notification.open({
							type: "error",
							message: "Choose another Custom URL",
							description: (
								<>
									<p>
										<code>{values.short}</code> is already being used by{" "}
										<code>{entry.full}</code>
									</p>
								</>
							),
						});
						return reject(
							values.short + " is already being used by " + entry.full
						);
					}
					if (entry.full === values.full && !this.state.settings.manyToOne) {
						notification.open({
							type: "error",
							message: (
								<p>
									This form already has a Custom URL:{" "}
									<code>{values.short}</code>
								</p>
							),
							description: (
								<p>
									To allow for multiple custom urls per form, change the{" "}
									<code>Many to One</code> setting.
								</p>
							),
						});
						return reject(
							"This form already has a Custom URL: " + values.short
						);
					}
				}
			}

			return resolve(values);
		});
	}

	submit(values) {
		this.validateAll(values).then(() => {
			firebase
				.database()
				.ref("urls/")
				.push(values)
				.then(() => {
					notification.open({
						type: "success",
						message: "Success",
						description: (
							<p>
								<code>{values.short}</code> has been added.
							</p>
						),
					});

					this.addFormRef.current.resetFields();
				})
				.catch((err) => {
					notification.open({
						type: "error",
						message: err.toString(),
					});
				});
		});
	}

	render() {
		const formColumns = [
			{
				title: "Custom URL",
				dataIndex: "short",
				key: "short",

				filterDropdown: ({
					setSelectedKeys,
					selectedKeys,
					confirm,
					clearFilters,
				}) => (
					<div style={{ padding: 8 }}>
						<Input
							ref={(node) => {
								this.searchInput = node;
							}}
							placeholder={`Search Custom URL`}
							value={selectedKeys[0]}
							onChange={(e) =>
								setSelectedKeys(e.target.value ? [e.target.value] : [])
							}
							onPressEnter={() =>
								this.handleSearch(selectedKeys, confirm, "short")
							}
							style={{ width: 188, marginBottom: 8, display: "block" }}
						/>
						<Space>
							<Button
								type="primary"
								onClick={() =>
									this.handleSearch(selectedKeys, confirm, "short")
								}
								icon={<SearchOutlined />}
								size="small"
								style={{ width: 90 }}
							>
								Search
							</Button>
							<Button
								onClick={() => this.handleReset(clearFilters)}
								size="small"
								style={{ width: 90 }}
							>
								Reset
							</Button>
						</Space>
					</div>
				),
				filterIcon: (filtered) => (
					<SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
				),
				onFilter: (value, record) =>
					record["short"]
						? record["short"]
								.toString()
								.toLowerCase()
								.includes(value.toLowerCase())
						: "",
				onFilterDropdownVisibleChange: (visible) => {
					if (visible) {
						setTimeout(() => this.searchInput.select(), 100);
					}
				},
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
										updates.time = row.time;

										this.validateAll(updates, row.pushKey).then(() => {
											this.close(row.pushKey);

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
										});
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
												<Select.Option value="airtable">
													Airtable Forms
												</Select.Option>
												<Select.Option value="surveymonkey">
													Survey Monkey
												</Select.Option>
												<Select.Option value="other">Other</Select.Option>
											</Select>
										</Form.Item>
										<Space>
											<Button type="primary" htmlType="submit">
												Save
											</Button>
											<Popconfirm
												title="Are you sure you want to delete this form?"
												onConfirm={() => {
													this.delete(row.pushKey);
													this.close(row.pushKey);
												}}
												okText="Delete"
												cancelText="No"
												placement="topLeft"
											>
												<Button danger>Delete</Button>
											</Popconfirm>
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
						<>
							{this.state.searchedColumn === "short" ? (
								<a
									target="_blank"
									href={url}
									rel="noopener noreferrer"
									style={{ wordBreak: "break-all" }}
								>
									<Highlighter
										highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
										searchWords={[this.state.searchText]}
										autoEscape
										textToHighlight={url ? url.toString() : ""}
									/>
								</a>
							) : (
								<a
									target="_blank"
									href={url}
									rel="noopener noreferrer"
									style={{ wordBreak: "break-all" }}
								>
									{url}
								</a>
							)}
						</>
					);
				},
				sorter: {
					compare: (a, b) => a.short.localeCompare(b.short),
					multiple: 2,
				},
			},
			{
				title: "Original URL",
				dataIndex: "full",
				key: "full",
				sorter: {
					compare: (a, b) => a.full.localeCompare(b.full),
					multiple: 1,
				},
				filterDropdown: ({
					setSelectedKeys,
					selectedKeys,
					confirm,
					clearFilters,
				}) => (
					<div style={{ padding: 8 }}>
						<Input
							ref={(node) => {
								this.searchInput = node;
							}}
							placeholder={`Search Original URL`}
							value={selectedKeys[0]}
							onChange={(e) =>
								setSelectedKeys(e.target.value ? [e.target.value] : [])
							}
							onPressEnter={() =>
								this.handleSearch(selectedKeys, confirm, "full")
							}
							style={{ width: 188, marginBottom: 8, display: "block" }}
						/>
						<Space>
							<Button
								type="primary"
								onClick={() => this.handleSearch(selectedKeys, confirm, "full")}
								icon={<SearchOutlined />}
								size="small"
								style={{ width: 90 }}
							>
								Search
							</Button>
							<Button
								onClick={() => this.handleReset(clearFilters)}
								size="small"
								style={{ width: 90 }}
							>
								Reset
							</Button>
						</Space>
					</div>
				),
				filterIcon: (filtered) => (
					<SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
				),
				onFilter: (value, record) =>
					record["full"]
						? record["full"]
								.toString()
								.toLowerCase()
								.includes(value.toLowerCase())
						: "",
				onFilterDropdownVisibleChange: (visible) => {
					if (visible) {
						setTimeout(() => this.searchInput.select(), 100);
					}
				},
				render: (url, row) => {
					if (row.edit) {
						return {
							props: { colSpan: 0 },
						};
					}
					return (
						<>
							{this.state.searchedColumn === "full" ? (
								<a
									target="_blank"
									href={url}
									rel="noopener noreferrer"
									style={{ wordBreak: "break-all" }}
								>
									<Highlighter
										highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
										searchWords={[this.state.searchText]}
										autoEscape
										textToHighlight={url ? url.toString() : ""}
									/>
								</a>
							) : (
								<a
									target="_blank"
									href={url}
									rel="noopener noreferrer"
									style={{ wordBreak: "break-all" }}
								>
									{url}
								</a>
							)}
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
				sorter: {
					compare: (a, b) => a.time - b.time,
					multiple: 3,
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
							<Tooltip title="Edit">
								<a
									onClick={() => {
										this.edit(row.pushKey);
									}}
									style={{ color: "inherit" }}
								>
									<EditOutlined className="admin-forms-actionIcons" />
								</a>
							</Tooltip>

							<Popconfirm
								title="Are you sure you want to delete this form?"
								onConfirm={() => {
									this.delete(row.pushKey);
								}}
								okText="Delete"
								cancelText="No"
								placement="topLeft"
							>
								<Tooltip title="Delete">
									<DeleteOutlined className="admin-forms-actionIcons" />
								</Tooltip>
							</Popconfirm>
						</Space>
					);
				},
			},
		];

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
							} else if (values.full.includes("airtable.com/")) {
								updates.type = "airtable";

								var split = updates.full.split("/");
								var domain = split.indexOf("airtable.com");
								var embed = split[domain + 1] === "embed";
								if (!embed) {
									split.splice(domain + 1, 0, "embed");
									updates.full = split.join("/");
								}
							} else if (values.full.includes("surveymonkey.com")) {
								updates.type = "surveymonkey";
							} else {
								updates.type = "other";
							}

							this.submit(updates);

							// NOT WORKING - attempt to validate full url
							//
							// this.validateURL(updates.full)
							// 	.then(() => {
							// 		this.submit(updates);
							// 	})
							// 	.catch((err) => {
							// 		notification.open({
							// 			type: "warning",
							// 			message: "Is that a valid url?!",
							// 			description: (
							// 				<>
							// 					<code>{updates.full}</code>
							// 					<br />
							// 					<Button type="primary" onClick={this.submit(updates)}>
							// 						Yeah! Add it.
							// 					</Button>
							// 				</>
							// 			),
							// 		});
							// 		return err;
							// 	});
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
								<Input
									addonBefore={
										window.location.protocol +
										"//" +
										window.location.hostname +
										(window.location.port ? ":" + window.location.port : "") +
										"/"
									}
									style={{ flexGrow: 1 }}
								/>
							</Form.Item>

							<Button type="primary" htmlType="submit" style={{ flexGrow: 0 }}>
								Add
							</Button>
						</div>
					</Form>
				</div>

				<Table
					loading={this.state.loading}
					columns={formColumns}
					dataSource={this.state.formData}
					rowKey={(row) => row.short + row.edit}
					locale={{
						emptyText: (
							<Empty
								image="/icon512.png"
								description={<h3 style={{ color: "inherit" }}>No Forms</h3>}
							></Empty>
						),
					}}
				/>
			</>
		);
	}
}

export default AdminForms;
