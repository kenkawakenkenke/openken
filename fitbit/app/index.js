/*
 * Entry point for the watch app
 */
import { me } from "appbit";
import document from "document";
import { vibration } from "haptics";
import * as messaging from "messaging";
import clock from "clock";
import { today } from "user-activity";

import CompanionUrlRequester from "./companion_requester.js";

import SensorDataCollector from "./sensor_collector.js";

let labelHeartRate = document.getElementById("labelHeartRate");
let labelChargeLevel = document.getElementById("labelChargeLevel");
let labelWalkCount = document.getElementById("labelWalkCount");
let labelConnectionLost = document.getElementById("labelConnectionLost");

let labelStatus = document.getElementById("labelStatus");
let labelStatusSpec;
function showStatusText(text, ok = true) {
    labelStatusSpec = {
        t: new Date(),
        text,
        ok,
    };
    // labelStatus.text = localeTimeString(new Date()) + ": " + text;
}
function getFriendlyDuration(secs) {
    return Math.floor(secs) + "s ago";
    if (secs < 30) {
        return "few seconds ago";
    }
    if (secs < 60) {
        return "under a minute ago";
    }
    if (secs < 60 * 2) {
        return "a minute ago";
    }
    if (secs < 60 * 10) {
        return "minutes ago";
    }
    return "a while back";
}
function updateStatusText(now) {
    if (!labelStatusSpec) {
        return;
    }
    const elapsedSecs = (now.getTime() - labelStatusSpec.t.getTime()) / 1000;
    labelStatus.text = `${getFriendlyDuration(elapsedSecs)}: ${labelStatusSpec.text}`;
    labelStatus.style.fill = labelStatusSpec.ok ? "#ffffff" : "ff0000";
}

// For some reason, toLoaleTimeString ignores timezones.
function localeTimeString(t) {
    function formatPiece(p) {
        const pText = p.toString();
        while (pText.length < 2) pText = "0" + pText;
        return pText;
    }
    return `${formatPiece(t.getHours())}:${formatPiece(t.getMinutes())}:${formatPiece(t.getSeconds())}`
}
let waitingResponse = false;
function submitReading(data) {
    if (waitingResponse) {
        console.log("==== Still waiting response, connection may be lost.");
        vibration.start("nudge-max");
        labelConnectionLost.style.visibility = "visible";
    }

    console.log(`Send: ${JSON.stringify(data)} `);
    showStatusText("Sending...", true);

    // data.heartRate = 110;
    // data.chargeLevel = 100;
    // data.walkCount = 11234;
    labelHeartRate.text = `${data.heartRate} `;
    labelChargeLevel.text = `${Math.floor(data.chargeLevel)}%`
    labelWalkCount.text = `${today.adjusted.steps}`

    const baseURL = "https://asia-northeast1-open-ken.cloudfunctions.net/submitFitbitData";
    const serializedData = encodeURIComponent(JSON.stringify(data));
    const requestURL = `${baseURL}?data=${serializedData}`;
    waitingResponse = true;
    requester.request(requestURL,
        response => {
            waitingResponse = false;
            const parsed = JSON.parse(response);
            if (parsed.status === "err") {
                showStatusText("Error", false);
                vibration.start("nudge-max");
                console.log("failed: " + parsed.reason);
                labelConnectionLost.style.visibility = "visible";
                return;
            }
            showStatusText("Sent!!", true);
            console.log("got response: " + JSON.stringify(parsed));
            labelConnectionLost.style.visibility = "hidden";
        },
        err => {
            waitingResponse = false;
            vibration.start("nudge-max");
            showStatusText("Failed send", false);
            showMessage("Failed send: " + new Date());
            labelConnectionLost.visibility = "visible";
        });
}
const dataCollector = new SensorDataCollector(30, submitReading);

// Ensure we stay alive.
me.appTimeoutEnabled = false;
vibration.start("bump");

showStatusText("Waiting for companion app..", true);

const requester = new CompanionUrlRequester();

messaging.peerSocket.addEventListener("open", (evt) => {
    showStatusText("Ready", true);
    console.log("Ready to send or receive messages on the device");
    dataCollector.start();
});

messaging.peerSocket.addEventListener("close", (evt) => {
    console.error(`Connection closed: ${JSON.stringify(evt)} `);
    showStatusText("Connection closed: " + JSON.stringify(evt), false);
    vibration.start("nudge-max");
});

messaging.peerSocket.addEventListener("error", (err) => {
    console.error(`Connection error: ${err.code} - ${err.message} `);
    showStatusText("Connection error: " + err.message, false);
    vibration.start("nudge-max");
});

// Setup clock
let labelClock = document.getElementById("labelClock");
clock.granularity = "seconds"; // seconds, minutes, or hours
clock.addEventListener("tick", (evt) => {
    const now = new Date();
    labelClock.text = monoDigits(localeTimeString(now));
    updateStatusText(now);

    // Metrics
    const latestData = dataCollector.latestData;
    if (latestData && latestData.heartRate) {
        labelHeartRate.text = `${latestData.heartRate} `;
    }
    if (latestData && latestData.chargeLevel) {
        labelChargeLevel.text = `${Math.floor(latestData.chargeLevel)}%`
    }
    labelWalkCount.text = `${today.adjusted.steps}`
});

// From: https://dev.fitbit.com/build/guides/user-interface/css/
// Convert a number to a special monospace number
function monoDigits(num, pad = true) {
    let monoNum = '';
    if (typeof num === 'number') {
        num |= 0;
        if (pad && num < 10) {
            monoNum = c0 + monoDigit(num);
        } else {
            while (num > 0) {
                monoNum = monoDigit(num % 10) + monoNum;
                num = (num / 10) | 0;
            }
        }
    } else {
        let text = num.toString();
        let textLen = text.length;
        for (let i = 0; i < textLen; i++) {
            monoNum += monoDigit(text.charAt(i));
        }
    }
    return monoNum;
}

const c0 = String.fromCharCode(0x10);
const c1 = String.fromCharCode(0x11);
const c2 = String.fromCharCode(0x12);
const c3 = String.fromCharCode(0x13);
const c4 = String.fromCharCode(0x14);
const c5 = String.fromCharCode(0x15);
const c6 = String.fromCharCode(0x16);
const c7 = String.fromCharCode(0x17);
const c8 = String.fromCharCode(0x18);
const c9 = String.fromCharCode(0x19);

function monoDigit(digit) {
    switch (digit) {
        case 0: return c0;
        case 1: return c1;
        case 2: return c2;
        case 3: return c3;
        case 4: return c4;
        case 5: return c5;
        case 6: return c6;
        case 7: return c7;
        case 8: return c8;
        case 9: return c9;
        case '0': return c0;
        case '1': return c1;
        case '2': return c2;
        case '3': return c3;
        case '4': return c4;
        case '5': return c5;
        case '6': return c6;
        case '7': return c7;
        case '8': return c8;
        case '9': return c9;
        default: return digit;
    }
}
