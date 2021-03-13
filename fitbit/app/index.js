/*
 * Entry point for the watch app
 */
import { me } from "appbit";
import * as messaging from "messaging";
import clock from "clock";
import { today } from "user-activity";
import UI from "./ui/index.js";
import SensorDataCollector from "./sensor_collector.js";
import DataSender from "./data_sender.js";

/**
 * dataCollector collects sensor data, calls callback with data every 30 seconds.
 * callback calls dataSender, which calls companion requester to send data to the server.
 * requester calls back with the server response,
 * and dataSender calls UI to update the status label.
 */
const ui = new UI();
const dataSender = new DataSender(ui);
const dataCollector = new SensorDataCollector(30,
    data => dataSender.handleData(data));

// Ensure we stay alive.
me.appTimeoutEnabled = false;

// Setup messaging.
messaging.peerSocket.addEventListener("open", (evt) => {
    ui.showStatusText("Ready", true);
    dataCollector.start();
});
messaging.peerSocket.addEventListener("close", (evt) => {
    ui.showStatusText("Connection closed: " + JSON.stringify(evt), false);
});
messaging.peerSocket.addEventListener("error", (err) => {
    ui.showStatusText("Connection error: " + err.message, false);
});

// Setup clock. Every Tick, we update the clock face and 
// status/metric labels.
clock.granularity = "seconds";
clock.addEventListener("tick", (evt) => {
    const now = new Date();
    ui.updateClockFace(now);
    ui.updateStatusText(now);
    ui.updateMetrics(
        dataCollector.latestData?.heartRate,
        dataCollector.latestData?.chargeLevel,
        today.adjusted.steps
    );
});
