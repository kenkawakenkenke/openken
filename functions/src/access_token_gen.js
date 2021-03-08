const firebase = require('firebase-admin');
const firestore = firebase.firestore();

const CHAR_CODE_SMALL_A = "a".charCodeAt(0);
const CHAR_CODE_LARGE_A = "A".charCodeAt(0);
const CHAR_CODE_0 = "0".charCodeAt(0);

// Assumed to be between 0 and 27+27+10.
function numToChar(num) {
    if (num < 26) {
        return String.fromCharCode(num + CHAR_CODE_SMALL_A);
    }
    num -= 26;
    if (num < 26) {
        return String.fromCharCode(num + CHAR_CODE_LARGE_A);
    }
    num -= 26;
    if (num < 10) {
        return String.fromCharCode(num + CHAR_CODE_0);
    }
    throw new "out of bounds" + num;
}
function generateRandomAcccessToken(length = 64) {
    let token = "";
    for (let i = 0; i < length; i++) {
        const num = Math.floor(Math.random() * 62);
        token += numToChar(num);
    }
    return token;
}

exports.onCallGenerateAccessToken =
    async (data, context) => {
        if (!context.auth) {
            return {
                status: "error",
                reason: "not authenticated",
            }
        }
        const uid = context.auth.uid;

        const collection = firestore.collection("accessTokens");

        let batch = firestore.batch();

        // Clear out existing tokens
        const existingTokens = await collection.where("uid", "==", uid).get();
        existingTokens.forEach(existingToken => {
            batch.delete(collection.doc(existingToken.id));
        });

        const newToken = generateRandomAcccessToken(48);
        const newDoc = collection.doc(newToken);
        batch.set(newDoc, {
            uid,
            tCreated: new Date(),
        });

        // await new Promise((resolve) => {
        //     setTimeout(() => {
        //         resolve(0)
        //     }, 2000);
        // });

        await batch.commit();

        return {
            token: newToken,
        };
    };

