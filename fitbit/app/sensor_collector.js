
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
        body.start();
        const hrm = new HeartRateSensor();
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
        hrm.start();
    }

    poll() {
        const dataToSend = this.latestData;
        if (!dataToSend) {
            console.log("abort: no data");
            return;
        }
        this.latestData = undefined;

        const now = new Date().getTime();
        const tSinceLastSend = now - (this.lastSent || 0);
        if (tSinceLastSend < this.sendEveryMs) {
            // console.log("abort: not enough time: " + tSinceLastSend);
            return;
        }
        this.lastSent = now;

        this.callback(dataToSend);
    }
}
export default SensorDataCollector;
