
import { HeartRateSensor } from "heart-rate";
import { BodyPresenceSensor } from "body-presence";
import sleep from "sleep"
import { battery } from "power";
import { Accelerometer } from "accelerometer";
import { computeZeroCross, DataBuffer, addPowerReadings } from "./sensor_util.js";

class SensorDataCollector {
    constructor(sendEverySec, callback) {
        this.sendEveryMs = sendEverySec * 1000;
        this.callback = callback;
        const parentThis = this;

        const body = new BodyPresenceSensor();
        this.body = body;
        const hrm = new HeartRateSensor();
        this.hrm = hrm;
        hrm.addEventListener("reading", () => {
            // console.log("set latest data");
            parentThis.latestData = {
                timestamp: new Date().getTime(),
                heartRate: hrm.heartRate,
                available: body.present,
                sleep: sleep.state,
                chargeLevel: Math.floor(battery.chargeLevel),
            };
            parentThis.dataToSend = parentThis.latestData;
            parentThis.poll();
        });


        // Accelerometer readings
        const frequency = 30;
        const batch = 1 * frequency;
        const accel = new Accelerometer({ frequency, batch });
        this.accel = accel;
        this.accelerometerDataBuffer = new DataBuffer(frequency * 30 * 2);
        accel.addEventListener("reading", () => {
            addPowerReadings(accel.readings, parentThis.accelerometerDataBuffer);
        });
    }

    start() {
        this.body.start();
        this.hrm.start();
        this.accel.start();
    }

    poll() {
        const dataToSend = this.dataToSend;
        if (!dataToSend) {
            console.log("abort: no data");
            return;
        }
        this.dataToSend = undefined;

        const now = new Date().getTime();
        if (!this.lastSend) {
            this.lastSend = now;
        }
        // const readyToSend = !this.lastSend || (now - this.lastSend > this.sendEveryMs);
        const readyToSend = (now - this.lastSend > this.sendEveryMs);
        if (!readyToSend) {
            // console.log("abort: not enough time: " + tSinceLastSend);
            return;
        }
        this.lastSend = now;

        // Add buffered accelerometer data
        dataToSend.zeroCross = computeZeroCross(this.accelerometerDataBuffer);
        // console.log(`accel:${this.accelerometerDataBuffer.length()} ${dataToSend.zeroCross}`);
        this.accelerometerDataBuffer.clear();
        // this.accelerometerDataBuffer.forEach(acc => console.log("zeroX:" + acc.zeroCross));
        // dataToSend.accel = this.accelerometerDataBuffer;
        // this.accelerometerDataBuffer = [];

        this.callback(dataToSend);
    }
}
export default SensorDataCollector;
