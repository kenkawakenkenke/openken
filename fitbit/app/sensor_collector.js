
import { HeartRateSensor } from "heart-rate";
import { BodyPresenceSensor } from "body-presence";
import sleep from "sleep"
import { battery } from "power";

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
    }

    start() {
        this.body.start();
        this.hrm.start();
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

        this.callback(dataToSend);
    }
}
export default SensorDataCollector;
