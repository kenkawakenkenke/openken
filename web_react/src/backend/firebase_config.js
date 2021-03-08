import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/functions";
import "firebase/analytics";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDbQ4RKSIBrur7wgU5SscmR8AgDXxCRpmI",
    authDomain: "open-ken.firebaseapp.com",
    projectId: "open-ken",
    storageBucket: "open-ken.appspot.com",
    messagingSenderId: "977200409263",
    appId: "1:977200409263:web:ee460a0ab0729e1192425a",
    measurementId: "G-6M77LMT15R"
};

if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
    if (process.env.NODE_ENV === "development") {
        const localHost = "localhost";
        firebase.app().functions("asia-northEast1").useEmulator("localhost", 5001);
        firebase.firestore().useEmulator(localHost, 8080);
        firebase.auth().useEmulator(`http://${localHost}:9099/`);
    }
}
export default firebase;
