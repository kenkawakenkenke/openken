const firebase = require('firebase-admin');
const firestore = firebase.firestore();
const moment = require("moment-timezone");

exports.onSubmitFitbitData = async (req, res) => {
    const respond = (response) =>
        res.status(200).send(JSON.stringify(response));

    const accessToken = req.query.token;
    let payload;
    try {
        payload = JSON.parse(req.query.data);
    } catch (err) {
        return respond({ status: "err", reason: "invalid data:" + err });
    }
    if (!payload.timestamp) {
        return respond({ status: "err", reason: "invalid data:" + err });
    }
    payload.timestamp = moment(payload.timestamp).tz("Asia/Tokyo");

    // Verify that there's a user for the token.
    const accessTokenRecord = await firestore.collection("accessTokens").doc(accessToken).get();
    if (!accessTokenRecord || !accessTokenRecord.data()) {
        return respond({ status: "err", reason: "failed auth" });
    }
    const uid = accessTokenRecord.data().uid;

    // Now store the payload.
    const doc = firestore
        .collection("rawFitbitData")
        .doc(`${uid}_${payload.timestamp.unix()}`);
    await doc.set({
        uid,
        data: payload,
    });

    return respond({ status: "ok" });
};