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

async function fetchMobileData(uid, fromUnixTime) {
    // Fetch fitbit data from past 30 minutes.
    const historicalDataRef = await firestore
        .collection("rawMobileData")
        .where("uid", "==", uid)
        .where("data.timestamp", ">=", fromUnixTime * 1000)
        .orderBy("data.timestamp", "asc")
        .get();
    let historicalData = [];
    historicalDataRef.forEach(ref => {
        const mobileRecord = ref.data();
        const data = mobileRecord.data;
        // Make it a little easier to use.
        historicalData.push({
            ...data,
            t: moment(data.timestamp).tz("Asia/Tokyo"),
        });
    });
    return historicalData;
}

function activityState(maybeLatestFitbitData, maybeLatestMobileData) {
    // Asleep always wins.
    if (maybeLatestFitbitData && maybeLatestFitbitData.sleep === "asleep") {
        return "asleep";
    }
    if (maybeLatestMobileData && maybeLatestMobileData.activity) {
        return maybeLatestMobileData.activity;
    }
    // Probably "awake".
    if (maybeLatestFitbitData) {
        return maybeLatestFitbitData.sleep;
    }
    return "unknown";
}
function lastUpdateTime(maybeLatestFitbitData, maybeLatestMobileData) {
    let time = {};
    if (maybeLatestFitbitData) {
        time.fitbit = maybeLatestFitbitData.t;
    }
    if (maybeLatestMobileData) {
        time.mobile = maybeLatestMobileData.t;
    }
    return time;
}
function getLocation(mobileData) {
    // TODO: fuzz out for sensitive locations.
    return mobileData.map(mobileRecord => ({
        latitude: mobileRecord.location.latitude,
        longitude: mobileRecord.location.longitude,
    }));
}
function aggregate(fitbitData, mobileData) {
    const latestFitbitData = fitbitData.length > 0 && fitbitData[fitbitData.length - 1];
    const latestMobileData = mobileData.length > 0 && mobileData[mobileData.length - 1];

    let aggregateData = {};
    // Realtime heart rate
    if (latestFitbitData && latestFitbitData.heartRate) {
        aggregateData.heartRate = latestFitbitData.heartRate;
    }

    if (latestFitbitData && latestFitbitData.chargeLevel) {
        aggregateData.fitbitChargeLevel = latestFitbitData.chargeLevel;
    }

    // Activity state (asleep, walking, etc).
    aggregateData.activityState = activityState(latestFitbitData, latestMobileData);

    // Location data
    aggregateData.location = getLocation(mobileData);

    // Last update times
    aggregateData.tLastUpdate = lastUpdateTime(latestFitbitData, latestMobileData);

    return aggregateData;
}

exports.createPresentationData = async (uid) => {
    const historicalTimeCutoff = moment().add(-10, "minutes");

    const fitbitData = await fetchFitbitData(uid, historicalTimeCutoff.unix());
    const mobileData = await fetchMobileData(uid, historicalTimeCutoff.unix());
    // Do the same for android data.

    // Roll them up,
    const aggregatedData = aggregate(fitbitData, mobileData);

    console.log(aggregatedData);
    // Save.
    await firestore
        .collection("realtimeDashboard")
        .doc(uid)
        .set(aggregatedData);
};
