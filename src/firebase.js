import firebase from "firebase/app";
import "firebase/analytics";
import "firebase/auth";
import "firebase/database";
import config from "./config";

// Firebase configuration is located in config.js

// Initialize Firebase
firebase.initializeApp(config.firebaseConfig);
if (typeof config.firebaseConfig.measurementId !== "undefined") {
	firebase.analytics();
}
firebase.auth();
firebase.database();

export default firebase;
