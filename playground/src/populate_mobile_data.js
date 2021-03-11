// Example script to send fake data to the mobile data reciver.
import admin from 'firebase-admin';

// We only need the project ID because this script only runs against the emulator.
const firebaseConfig = {
    projectId: "open-ken",
};
admin.initializeApp(firebaseConfig);

const [lat, lng] = [35.6995549, 139.4707288];
const data = {
    data: {
        timestamp: new Date(),
        location: {
            latitude: lat,
            longitude: lng,
        },
        activity: Math.random() < 0.5 ? "walking" : "still",
    },
    // This is just a locally generated (emulated) uid, so we're not leaking anything.
    uid: "9CzOXQHx1FJlpdmcuCQaxMKTdn7c"
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

    await admin.firestore().collection("rawMobileData")
        .add(data);

    console.log("done");
})();
