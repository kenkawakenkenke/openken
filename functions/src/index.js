const functions = require("firebase-functions");
const firebase = require('firebase-admin');
firebase.initializeApp(functions.config().firebase);
const firestore = firebase.firestore();

// https://asia-northeast1-open-ken.cloudfunctions.net/submitSensorData
exports.submitSensorData = functions
    .region('asia-northeast1')
    .https.onCall((data, context) => {
        const uid = context.auth.uid;
        const sensorData = data.sensorData;
        console.log(uid, sensorData);
        return {
            status: "ok",
            message: "hello world! " + uid + " " + context.auth.token.name,
        };
    });

// https://asia-northeast1-open-ken.cloudfunctions.net/hello
exports.hello = functions.region("asia-northeast1")
    .https
    .onRequest(async (req, res) => {
        res.status(200).send("Hello cloud functions!");
        return;
    });
