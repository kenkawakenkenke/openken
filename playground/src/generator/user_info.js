// Example script to send fake data to the mobile data reciver.
import firebase from './setup_firebase.js';

export async function getTestUserInfo() {
    const accessTokens = await firebase.firestore().collection("accessTokens").get();

    const accessTokenForUid = {};
    accessTokens.forEach(accessToken => {
        accessTokenForUid[accessToken.data().uid] = accessToken.id;
    });
    if (Object.entries(accessTokenForUid).length === 0) {
        console.log("No users in accessTokens, please register at http://localhost:3000/access_token");
        return undefined;
    }
    const [uid, accessToken] = Object.entries(accessTokenForUid)[0];
    return { uid, accessToken };
}
