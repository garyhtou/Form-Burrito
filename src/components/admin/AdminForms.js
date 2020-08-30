import React from "react";
import "./AdminForms.css";
import Firebase from "./../../Firebase";
import config from "./../../config";
import { Table, Space, Tooltip } from "antd";
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
						return { children: url, props: { colSpan: 4 } };
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
					var date = new Date(epoch * 1000);
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
		};
	}

	componentDidMount() {
		Firebase.database()
			.ref("urls")
			.on(
				"value",
				function (snapshot) {
					var data = snapshot.val();
					var formData = [];

					for (var pushKey in data) {
						var entry = data[pushKey];

						formData.push({
							short: entry.short,
							full: entry.full,
							time: entry.time,
							pushKey: pushKey,
							edit: false,
							editParent: false,
						});
					}

					this.setState({ formData, loading: false });
				}.bind(this)
			);
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

		let editRow = <div className="editRow">{editEntry.short}</div>;

		formData.splice(entryIndex + 1, 0, {
			short: editRow,
			full: null,
			time: null,
			pushKey: pushKey,
			edit: true,
			editParent: false,
		});

		formData[entryIndex].editParent = true;

		this.setState({ formData: formData }, () => {
			console.log(this.state.formData);
		});

		console.log("edit", pushKey);
	}

	delete(pushKey) {
		console.log("delete", pushKey);
	}

	render() {
		return (
			<>
				<Table
					loading={this.state.loading}
					columns={this.state.formColumns}
					dataSource={this.state.formData}
				></Table>
			</>
		);
	}
}

export default AdminForms;
