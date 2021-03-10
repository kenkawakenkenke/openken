const firebase = require('firebase-admin');
const firestore = firebase.firestore();

exports.onSubmitMobileData =
    async (data, context) => {
        if (!context.auth) {
            return {
                status: "error",
                reason: "not authenticated",
            }
        }
        const uid = context.auth.uid;

        console.log("received", uid, data);
        // Just save it in firestore
        const doc = firestore
            .collection("rawMobileData")
            .doc(`${uid}_${data.timestamp}`);
        await doc.set({
            uid,
            data,
        });
    };

