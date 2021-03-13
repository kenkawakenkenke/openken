import firebase from 'firebase-admin';

// We only need the project ID because this script only runs against the emulator.
const firebaseConfig = {
    projectId: "open-ken",
};
firebase.initializeApp(firebaseConfig);

export default firebase;
