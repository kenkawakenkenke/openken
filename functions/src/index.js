const functions = require("firebase-functions");
const firebase = require('firebase-admin');
firebase.initializeApp(functions.config().firebase)
const { onCallGenerateAccessToken } = require("./access_token_gen.js");
const { onSubmitFitbitData } = require("./fitbit_data_receiver.js");
const { onSubmitMobileData } = require("./mobile_data_receiver.js");
const { createPresentationData } = require("./data_aggregator.js");

// https://asia-northeast1-open-ken.cloudfunctions.net/hello
exports.hello = functions.region("asia-northeast1")
    .https
    .onRequest(async (req, res) => {
        res.status(200).send("Hello cloud functions!");
        return;
    });

// Handler for receiving raw data from Fitbit device.
// Expects parameters:
// token: access token
// data: serialized JSON which at least contains timestamp field.
// https://asia-northeast1-open-ken.cloudfunctions.net/submitFitbitData
exports.submitFitbitData = functions
    .region('asia-northeast1')
    .https
    .onRequest(onSubmitFitbitData);

// Handler for receiving raw data from mobile apps.
exports.submitMobileData =
    functions
        .region("asia-northeast1")
        .https
        .onCall(onSubmitMobileData);

// Handler for changes to fitbit data, to create a new presentation data
// by packaging various raw data sources.
exports.onNewFitbitData
    = functions
        .region('asia-northeast1')
        .firestore
        .document('rawFitbitData/{docId}')
        .onCreate(async (fitbitData, context) => {
            createPresentationData(fitbitData.data().uid);
            return 0;
        });

// Handler for changes to mobile data, to create a new presentation data
// by packaging various raw data sources.
exports.onNewMobileData
    = functions
        .region('asia-northeast1')
        .firestore
        .document('rawMobileData/{docId}')
        .onCreate(async (mobileData, context) => {
            createPresentationData(mobileData.data().uid);
            return 0;
        });

// Handler for regenerating access tokens for the logged in user.
// Called from https://open-ken.web.app/access_token.
exports.generateAccessToken =
    functions
        .region("asia-northeast1")
        .https
        .onCall(onCallGenerateAccessToken);
