// Example script to send fake data to the mobile data reciver.
function generateData(uid) {
    // Just random location in Kokubunji.
    const [lat, lng] = [
        35.6995549 + (Math.random() - 0.5) * 0.005,
        139.4707288 + (Math.random() - 0.5) * 0.005];
    const data = {
        data: {
            timestamp: new Date(),
            location: {
                latitude: lat,
                longitude: lng,
            },
            activity: Math.random() < 0.5 ? "walking" : "still",
        },
        uid
    };
    return data;
}

export async function generateMobileData(firebase, uid) {
    const data = generateData(uid);
    return firebase.firestore().collection("rawMobileData")
        .add(data);
}
