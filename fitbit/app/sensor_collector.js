
import { HeartRateSensor } from "heart-rate";
import { BodyPresenceSensor } from "body-presence";
import sleep from "sleep"
import { battery } from "power";
import { Accelerometer } from "accelerometer";
import { computeZeroCross } from "./sensor_util.js";
{
}

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
            parentThis.latestData = {
                timestamp: new Date().getTime(),
                heartRate: hrm.heartRate,
                available: body.present,
                sleep: sleep.state,
                chargeLevel: Math.floor(battery.chargeLevel),
            };
            parentThis.poll();
        });


        // Accelerometer readings
        const frequency = 30;
        const batch = 30 * frequency;
        const accel = new Accelerometer({ frequency, batch });
        this.accel = accel;
        this.accelerometerDataBuffer = [];
        accel.addEventListener("reading", () => {
            const timeFetched = new Date();
            const zeroCross = computeZeroCross(accel.readings);
            parentThis.accelerometerDataBuffer.push(
                {
                    t: timeFetched.getTime(),
                    zeroCross,
                });
            // console.log(`${localeTimeString(timeFetched)}, ${zeroCross}`);
        });
    }

    start() {
        this.body.start();
        this.hrm.start();
        this.accel.start();
    }

    poll() {
        const dataToSend = this.latestData;
        if (!dataToSend) {
            console.log("abort: no data");
            return;
        }
        this.latestData = undefined;

        const now = new Date().getTime();
        const readyToSend = !this.lastSend || (now - this.lastSend > this.sendEveryMs);
        if (!readyToSend) {
            // console.log("abort: not enough time: " + tSinceLastSend);
            return;
        }
        this.lastSend = now;

        // Add buffered accelerometer data
        this.accelerometerDataBuffer.forEach(acc => console.log("zeroX:" + acc.zeroCross));
        dataToSend.accel = this.accelerometerDataBuffer;
        this.accelerometerDataBuffer = [];

        this.callback(dataToSend);
    }
}
export default SensorDataCollector;
