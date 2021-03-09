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

        return {
            status: "ok",
        };
    };

