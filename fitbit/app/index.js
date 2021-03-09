/*
 * Entry point for the watch app
 */
import { me } from "appbit";
import document from "document";
import sleep from "sleep";
import { vibration } from "haptics";
import * as messaging from "messaging";

import CompanionUrlRequester from "./companion_requester.js";

import SensorDataCollector from "./sensor_collector.js";

//https://open-ken.web.app/access_token

let mainTextLabel = document.getElementById("statusLabel");
function showMessage(text) {
    mainTextLabel.text = text;
}

function submitReading(data) {
    console.log(`Send: ${JSON.stringify(data)}`);
    showMessage(new Date(data.timestamp));
}
const dataCollector = new SensorDataCollector(5, submitReading);

// Ensure we stay alive.
me.appTimeoutEnabled = false;
vibration.start("bump");

showMessage("Waiting for companion app..");

const requester = new CompanionUrlRequester();

// TODO: This should be generated on the device and persisted.
const deviceId = "kensfitbit";

function notifySleep() {
    showMessage("Good night!");
    vibration.start("bump");
    requester.request(
        `https://asia-northeast1-stopthemusic-ef911.cloudfunctions.net/fitbitAsleep?k=${deviceId}`,
        response => {
            console.log("got response: " + response);
        });
    // Let ourselves sleep now.
    me.appTimeoutEnabled = true;
}

const simulationButton = document.getElementById("demoButton");
simulationButton.addEventListener("click", (evt) => {
    // notifySleep();
});

messaging.peerSocket.addEventListener("open", (evt) => {
    showMessage("Ready");
    console.log("Ready to send or receive messages on the device");
});

messaging.peerSocket.addEventListener("close", (evt) => {
    console.error(`Connection closed: ${JSON.stringify(evt)}`);
    vibration.start("bump");
    showMessage("Woops: " + JSON.stringify(evt));
});

messaging.peerSocket.addEventListener("error", (err) => {
    console.error(`Connection error: ${err.code} - ${err.message}`);
    vibration.start("bump");
    showMessage("Woops: " + err.message);
});

// sleep.onchange = () => {
//     showMessage("Sleep:" + sleep.state);
//     console.log(`User sleep state is: ${sleep.state}`);
//     if (sleep.state === "asleep") {
//         console.log("Going to sleep!");
//         notifySleep();
//     }
// };
