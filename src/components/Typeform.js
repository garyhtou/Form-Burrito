import React from "react";
import "./Typeform.css";
import Error from "./Error";
import Loading from "./Loading";

class Typeform extends React.Component {
	constructor(props) {
		super(props);
		this.state = { loading: true, error: false };
		if (typeof props.src === "undefined" || props.src === "") {
			this.state = { loading: false, error: true };
		}
	}

	componentDidMount() {
		var corsAnywhere = "https://cors-anywhere.herokuapp.com/";
		var typeformURL = this.props.src;

		if (!this.state.error) {
			fetch(corsAnywhere + typeformURL)
				.then(function (response) {
					return response.text();
				})
				.then(
					function (responseText) {
						var parsedResponse = new window.DOMParser().parseFromString(
							responseText,
							"text/html"
						);
						if (parsedResponse.title.includes("Incorrect URL")) {
							this.setState({ loading: false, error: true });
						} else {
							this.setState({ loading: false, error: false });
							//TODO set website title
						}
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
								<iframe
									id="typeform-full"
									width="100%"
									height="100%"
									frameBorder="0"
									allow="camera; microphone; autoplay; encrypted-media;"
									src={this.props.src}
								></iframe>
								<script
									type="text/javascript"
									src="https://embed.typeform.com/embed.js"
								></script>
							</>
						)}
					</>
				)}
			</>
		);
	}
}

export default Typeform;
