import React from "react";
import { Helmet } from "react-helmet";
import Error from "./../Error";
import Loading from "./../Loading";

class SurveyMonkey extends React.Component {
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
					if (response.status === 404) {
						throw new Error("404");
					}
					return response.text();
				})
				.then(
					function (responseText) {
						var parsedResponse = new window.DOMParser().parseFromString(
							responseText,
							"text/html"
						);
						if (
							parsedResponse.title.includes("SurveyMonkey Survey Not Found")
						) {
							this.setState({ loading: false, error: true });
						} else {
							this.setState({
								loading: false,
								error: false,
								formTitle: parsedResponse.title,
							});
						}
					}.bind(this)
				)
				.catch(
					function (err) {
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
									class="survey-monkey"
									src={this.props.src}
									frameBorder="0"
									width="100%"
									height="100%"
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

export default SurveyMonkey;
