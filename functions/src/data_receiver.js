const firebase = require('firebase-admin');
const firestore = firebase.firestore();

exports.onSubmitSensorData = async (req, res) => {
    const respond = (response) => {
        res.status(200).send(JSON.stringify(response));
    };

    const accessToken = req.query.token;
    const payload = JSON.parse(req.query.data);
    // payload must contain a timestamp field.

    // Verify that there's a user for the token.
    const accessTokenRecord = await firestore.collection("accessTokens").doc(accessToken).get();
    if (!accessTokenRecord) {
        return respond({ status: "err", reason: "failed auth" });
    }
    const uid = accessTokenRecord.data().uid;

    // Now store the payload.
    const doc = firestore
        .collection("rawFitbitData")
        .doc(`${uid}_${payload.timestamp}`);
    await doc.set({
        uid,
        data: payload,
    });

    return respond({ status: "ok" });
};