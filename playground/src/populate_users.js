// Example script to send fake data to the mobile data reciver.
import admin from 'firebase-admin';

// We only need the project ID because this script only runs against the emulator.
const firebaseConfig = {
    projectId: "open-ken",
};
admin.initializeApp(firebaseConfig);

// This is just a locally generated (emulated) uid, so we're not leaking anything.
const uid = "9CzOXQHx1FJlpdmcuCQaxMKTdn7c";

// Just random location in Kokubunji.
const [lat, lng] = [35.6995549, 139.4707288];
const data = {
    sensitiveLocation: [
        {
            label: "someSensitiveLocation",
            latitude: lat,
            longitude: lng,
            radius: 150,
        }
    ],
};

function isUsingEmulator() {
    return process.env.FIRESTORE_EMULATOR_HOST
        && (process.env.FIRESTORE_EMULATOR_HOST.length > 0);
}

(async () => {
    if (!isUsingEmulator()) {
        console.log("Not running against the emulator. Please run:");
        console.log("export FIRESTORE_EMULATOR_HOST=\"localhost:8080\"");
        return;
    }

    await admin.firestore().collection("users")
        .doc(uid)
        .set(data);

    console.log("done");
})();
