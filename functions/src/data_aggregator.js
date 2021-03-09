const firebase = require('firebase-admin');
const firestore = firebase.firestore();
const moment = require("moment-timezone");

async function fetchFitbitData(uid, fromUnixTime) {
    // Fetch fitbit data from past 30 minutes.
    const historicalDataRef = await firestore
        .collection("rawFitbitData")
        .where("uid", "==", uid)
        .where("data.timestamp", ">=", fromUnixTime * 1000)
        .orderBy("data.timestamp", "asc")
        .get();
    let historicalData = [];
    historicalDataRef.forEach(ref => {
        const fitbitRecord = ref.data();
        const data = fitbitRecord.data;
        // Make it a little easier to use.
        historicalData.push({
            ...data,
            t: moment(data.timestamp).tz("Asia/Tokyo"),
        });
    });
    return historicalData;
}

function activityState(maybeLatestFitbitData) {
    if (maybeLatestFitbitData && maybeLatestFitbitData.sleep === "asleep") {
        return "asleep";
    }
    return "unknown";
}
function lastUpdateTime(maybeLatestFitbitData) {
    const tLastFitbitTime = maybeLatestFitbitData && maybeLatestFitbitData.t;
    return tLastFitbitTime;
}
function aggregate(fitbitData) {
    const latestFitbitData = fitbitData.length > 0 && fitbitData[fitbitData.length - 1];

    let aggregateData = {};
    // Realtime heart rate
    if (latestFitbitData && latestFitbitData.heartRate) {
        aggregateData.heartRate = latestFitbitData.heartRate;
    }
    // Activity state (asleep, walking, etc).
    aggregateData.activityState = activityState(activityState(latestFitbitData));

    // Last update times
    aggregateData.tLastUpdate = lastUpdateTime(latestFitbitData);

    return aggregateData;
}

exports.createPresentationData = async (uid, latestSnapshot) => {
    const historicalTimeCutoff = moment().add(-30, "minutes");

    const fitbitData = await fetchFitbitData(uid, historicalTimeCutoff.unix());
    // Do the same for android data.

    // Roll them up,
    const aggregatedData = aggregate(fitbitData);

    console.log(aggregatedData);
    // Save.
    await firestore
        .collection("realtimeDashboard")
        .doc(uid)
        .set(aggregatedData);
};
