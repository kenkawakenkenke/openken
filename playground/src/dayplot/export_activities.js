import firebase from '../generator/setup_firebase.js';
import moment from "moment-timezone";

async function loadFitbitData(db, from) {
    const fitbitDataRef = await db.collection("rawFitbitData")
        .where("data.timestamp", ">=", from)
        // .limit(10)
        .get();
    const fitbitData = [];
    fitbitDataRef.forEach(f => fitbitData.push(f.data()));
    return fitbitData;
}

async function loadMobileData(db, from) {
    const fitbitDataRef = await db.collection("rawMobileData")
        .where("data.timestamp", ">=", from)
        // .limit(10)
        .get();
    const data = [];
    fitbitDataRef.forEach(f => data.push(f.data()));
    return data;
}

function activityState(fitbitData, mobileData) {
    // Asleep always wins.
    if (fitbitData.some(d => d.sleep === "asleep")) {
        return "asleep";
    }
    if (mobileData.some(d => d.activity === "walking")) {
        return "walking";
    }

    if (mobileData.some(d => d.activity === "running")) {
        return "running";
    }
    if (fitbitData.some(d => d.zeroCross >= 50)) {
        return "exercise";
    }
    if (mobileData.some(d => d.activity === "still")) {
        return "still";
    }
    return "unknown";
}

async function getActivities(db, granSize, from) {
    const fitbitData = await loadFitbitData(db, from);
    const mobileData = await loadMobileData(db, from);

    const dataForGranForDay = [];
    function getDataForGran(day) {
        let data = dataForGranForDay[day.unix()];
        if (!data) {
            dataForGranForDay[day.unix()] = data = [];
        }
        return data;
    }
    function getData(day, gran) {
        const dataForGran = getDataForGran(day);
        let data = dataForGran[gran];
        if (!data) {
            data = dataForGran[gran] = {
                fitbit: [],
                mobile: [],
            };
        }
        return data;
    }
    // const granSize = 5;
    function getDataForTime(t) {
        const day = t.clone().startOf("day");
        const minuteOfDay = t.get("hours") * 60 + t.get("minutes");
        const gran = Math.floor(minuteOfDay / granSize) * granSize;
        return getData(day, gran);
    }
    fitbitData.forEach(data => {
        const t = moment(data.data.timestamp.toDate()).tz("Asia/Tokyo");
        getDataForTime(t).fitbit.push(data.data);
    });
    mobileData.forEach(data => {
        const t = moment(data.data.timestamp.toDate()).tz("Asia/Tokyo");
        getDataForTime(t).mobile.push(data.data);
    });
    return Object.keys(dataForGranForDay)
        .map(day => moment(parseInt(day) * 1000))
        .map(day => {
            const dayInfo = {
                day,
                activities: [],
            }
            for (let gran = 0; gran < 1440; gran += granSize) {
                const t = day.clone().add(gran, "minutes");
                const data = getDataForTime(t);
                const activity = activityState(data.fitbit, data.mobile);
                // console.log(t.format("MM/DD HH:mm"), data.fitbit.length, data.mobile.length, activity);
                dayInfo.activities.push(activity);
                // if (data.fitbit.length > 0) {
                //     console.log(data.fitbit[0]);
                // }
                // if (data.mobile.length > 0) {
                //     console.log(data.mobile[0]);
                // }
            }
            return dayInfo;
        });
}

const activityPriorities = [
    "asleep",
    "walking",
    "running",
    "exercise",
    "still",
    "unknown",
];

function vote(activities) {
    let numForActivity = {};
    activities.forEach(a => {
        numForActivity[a] = (numForActivity[a] || 0) + 1;
    });

    const max = Object.values(numForActivity).reduce((accum, c) => Math.max(accum, c), 0);
    const draws = Object.fromEntries(Object.entries(numForActivity)
        .filter(([activity, num]) => num === max)
        .map(([activity, num]) => [activity, true]));
    // console.log(max, draws);
    const chosen = activityPriorities.filter(a => draws[a])[0];
    // console.log(" -> ", chosen);
    return chosen;
}

// before running this, run:
// export FIRESTORE_EMULATOR_HOST="localhost:8080"
(async () => {
    const db = firebase.firestore();

    const from = moment("2021-03-15");

    const fineGranSize = 5;
    const coarseGranSize = 60;

    const fineDays = await getActivities(db, fineGranSize, from);
    const coarseDays = fineDays.map(dayInfo => {
        // console.log(dayInfo.day.format("MM/DD HH:mm"), dayInfo.activities);
        const coarseActivities = [];
        for (let i = 0; i < 1440; i += coarseGranSize) {
            const from = Math.floor(i / fineGranSize);
            const to = Math.floor((i + coarseGranSize) / fineGranSize);

            // console.log(i, dayInfo.activities.slice(from, to));
            const voted = vote(dayInfo.activities.slice(from, to));
            coarseActivities.push(voted);
        }
        return {
            day: dayInfo.day,
            activities: coarseActivities,
        }
    });
    for (let dayInfo of coarseDays) {
        console.log(dayInfo.day.format("YYYYMMDD"), dayInfo.activities);
        await db.collection("coarseActivities" + coarseGranSize)
            .doc(dayInfo.day.format("YYYYMMDD"))
            .update({
                day: dayInfo.day,
                activities: dayInfo.activities
            }, { merge: true });
    }

})();