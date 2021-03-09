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

    // vibration.start("bump");
    const baseURL = "https://asia-northeast1-open-ken.cloudfunctions.net/submitSensorData";
    const serializedData = encodeURIComponent(JSON.stringify(data));
    const requestURL = `${baseURL}?data=${serializedData}`;

    requester.request(requestURL,
        response => {
            // console.log("got response: " + response);
        });
}
const dataCollector = new SensorDataCollector(30, submitReading);

// Ensure we stay alive.
me.appTimeoutEnabled = false;
vibration.start("bump");

showMessage("Waiting for companion app..");

const requester = new CompanionUrlRequester();

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
