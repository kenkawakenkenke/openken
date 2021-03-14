const firebase = require('firebase-admin');
const firestore = firebase.firestore();
const moment = require("moment-timezone");
const geolib = require('geolib');

async function fetchFitbitData(uid, fromTime) {
    // Fetch fitbit data from past 30 minutes.
    const historicalDataRef = await firestore
        .collection("rawFitbitData")
        .where("uid", "==", uid)
        .where("data.timestamp", ">=", fromTime)
        .orderBy("data.timestamp", "asc")
        .get();
    let historicalData = [];
    historicalDataRef.forEach(ref => {
        const fitbitRecord = ref.data();
        const data = fitbitRecord.data;
        // Make it a little easier to use.
        historicalData.push(data);
    });
    return historicalData;
}

async function fetchMobileData(uid, fromTime) {
    // Fetch fitbit data from past 30 minutes.
    const historicalDataRef = await firestore
        .collection("rawMobileData")
        .where("uid", "==", uid)
        .where("data.timestamp", ">=", fromTime)
        .orderBy("data.timestamp", "asc")
        .get();
    let historicalData = [];
    historicalDataRef.forEach(ref => {
        const mobileRecord = ref.data();
        const data = mobileRecord.data;
        // Make it a little easier to use.
        historicalData.push(data);
    });
    return historicalData;
}

async function fetchUserInfo(uid) {
    const userInfo = await firestore
        .collection("users").doc(uid).get();
    return userInfo.data() ||
    // Return empty user info as fallback.
    {
        sensitiveLocation: [],
    };
}

function activityState(maybeLatestFitbitData, maybeLatestMobileData) {
    // Asleep always wins.
    if (maybeLatestFitbitData && maybeLatestFitbitData.sleep === "asleep") {
        return "asleep";
    }
    if (maybeLatestMobileData && maybeLatestMobileData.activity) {
        if (maybeLatestMobileData.activity === "still") {
            if (maybeLatestFitbitData && maybeLatestFitbitData.zeroCross >= 50) {
                return "exercise";
            }
        }
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
        time.fitbit = maybeLatestFitbitData.timestamp;
    }
    if (maybeLatestMobileData) {
        time.mobile = maybeLatestMobileData.timestamp;
    }
    return time;
}

function inSensitiveLocation(sensitiveLocations, location) {
    return sensitiveLocations
        .find(sensitiveLocation => {
            const distM = geolib.getDistance(sensitiveLocation, location);
            return distM < sensitiveLocation.radius;
        });
}
function getLocation(userInfo, mobileData) {
    return mobileData
        .filter(mobileRecord => mobileRecord.location)
        .map(mobileRecord => {
            const matchingSensitiveLocation =
                inSensitiveLocation(userInfo.sensitiveLocation, mobileRecord.location);
            if (matchingSensitiveLocation) {
                return {
                    t: mobileRecord.timestamp,
                    semantic: matchingSensitiveLocation.label,
                    latitude: matchingSensitiveLocation.latitude,
                    longitude: matchingSensitiveLocation.longitude,
                    radius: matchingSensitiveLocation.radius,
                };
            }
            return {
                t: mobileRecord.timestamp,
                latitude: mobileRecord.location.latitude,
                longitude: mobileRecord.location.longitude,
            };
        });
}
function getHeartRate(fitbitData) {
    return fitbitData
        .filter(fitbitRecord => fitbitRecord.heartRate >= 0)
        .map(fitbitRecord => ({
            t: fitbitRecord.timestamp,
            v: fitbitRecord.heartRate,
        }));
}
function getAccelerometer(fitbitData) {
    return fitbitData
        .filter(fitbitRecord => fitbitRecord.zeroCross >= 0)
        .map(fitbitRecord => ({
            t: fitbitRecord.timestamp,
            v: fitbitRecord.zeroCross,
        }));
}
function aggregate(userInfo, fitbitData, mobileData) {
    const latestFitbitData = fitbitData.length > 0 && fitbitData[fitbitData.length - 1];
    const latestMobileData = mobileData.length > 0 && mobileData[mobileData.length - 1];

    let aggregateData = {};
    // Realtime heart rate
    aggregateData.heartRate = getHeartRate(fitbitData);

    if (latestFitbitData && latestFitbitData.chargeLevel) {
        aggregateData.fitbitChargeLevel = latestFitbitData.chargeLevel;
    }

    // Activity state (asleep, walking, etc).
    aggregateData.activityState = activityState(latestFitbitData, latestMobileData);

    // Location data
    aggregateData.location = getLocation(userInfo, mobileData);

    // Accelerometer data
    aggregateData.accel = getAccelerometer(fitbitData);

    // Last update times
    aggregateData.tLastUpdate = lastUpdateTime(latestFitbitData, latestMobileData);

    return aggregateData;
}

exports.createPresentationData = async (uid) => {
    const historicalTimeCutoff = moment().add(-10, "minutes");

    const fitbitData = await fetchFitbitData(uid, historicalTimeCutoff);
    const mobileData = await fetchMobileData(uid, historicalTimeCutoff);
    const userInfo = await fetchUserInfo(uid);
    // Do the same for android data.

    // Roll them up,
    const aggregatedData = aggregate(userInfo, fitbitData, mobileData);

    // console.log(aggregatedData);
    // Save.
    await firestore
        .collection("realtimeDashboard")
        .doc(uid)
        .set(aggregatedData);
};
