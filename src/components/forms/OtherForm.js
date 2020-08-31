import React from "react";
import { Helmet } from "react-helmet";
import "./Typeform.css";
import Error from "../Error";
import Loading from "../Loading";

class OtherForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = { loading: true, error: false, formTitle: "" };
		if (typeof props.src === "undefined" || props.src === "") {
			this.state = { loading: false, error: true };
		}
	}

	componentDidMount() {
		var corsAnywhere = "https://cors-anywhere.herokuapp.com/";
		var formURL = this.props.src;

		if (!this.state.error) {
			fetch(corsAnywhere + formURL)
				.then(function (response) {
					return response.text();
				})
				.then(
					function (responseText) {
						var parsedResponse = new window.DOMParser().parseFromString(
							responseText,
							"text/html"
						);
						this.setState({
							loading: false,
							error: false,
							formTitle: parsedResponse.title,
						});
					}.bind(this)
				)
				.catch(
					function (err) {
						console.error(err);
						this.setState({ loading: false, error: true });
					}.bind(this)
				);
		}
	}

	render() {
		return (
			<>
				{this.state.loading ? (
					<Loading />
				) : (
					<>
						{this.state.error ? (
							<Error />
						) : (
							<>
								{this.state.formTitle !== "" ? (
									<Helmet>
										<title>{this.state.formTitle}</title>
									</Helmet>
								) : (
									<></>
								)}

								<iframe
									src={this.props.src}
									width="100%"
									height="100%"
									frameborder="0"
									marginheight="0"
									marginwidth="0"
									title={this.state.formTitle}
								></iframe>
							</>
						)}
					</>
				)}
			</>
		);
	}
}

export default OtherForm;
