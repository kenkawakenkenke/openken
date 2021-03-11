const firebase = require('firebase-admin');
const firestore = firebase.firestore();
const moment = require("moment-timezone");

exports.onSubmitMobileData =
    async (data, context) => {
        if (!context.auth) {
            return {
                status: "error",
                reason: "not authenticated",
            }
        }
        const uid = context.auth.uid;
        data.timestamp = moment(data.timestamp).tz("Asia/Tokyo");

        // Just save it in firestore
        const doc = firestore
            .collection("rawMobileData")
            .doc(`${uid}_${data.timestamp.unix()}`);
        await doc.set({
            uid,
            data,
        });
    };

