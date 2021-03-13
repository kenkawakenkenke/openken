import document from "document";
import { monoDigit } from "./font_util.js";
import { vibration } from "haptics";

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

// For some reason, toLoaleTimeString ignores timezones.
function localeTimeString(t) {
    function formatPiece(p) {
        const pText = p.toString();
        while (pText.length < 2) pText = "0" + pText;
        return pText;
    }
    return `${formatPiece(t.getHours())}:${formatPiece(t.getMinutes())}:${formatPiece(t.getSeconds())}`
}

export default class UI {
    constructor() {
        this.labelHeartRate = document.getElementById("labelHeartRate");
        this.labelChargeLevel = document.getElementById("labelChargeLevel");
        this.labelWalkCount = document.getElementById("labelWalkCount");
        this.labelConnectionLost = document.getElementById("labelConnectionLost");

        this.labelStatus = document.getElementById("labelStatus");
        this.labelClock = document.getElementById("labelClock");

    }

    showConnectionLostLabel() {
        console.log("Connection lost!");
        vibration.start("nudge-max");
        this.labelConnectionLost.style.visibility = "visible";
    }
    hideConnectionLostLabel() {
        this.labelConnectionLost.style.visibility = "hidden";
    }

    showStatusText(text, ok = true) {
        console.log(text);
        if (!ok) {
            vibration.start("nudge-max");
        }
        this.labelStatusSpec = {
            t: new Date(),
            text,
            ok,
        };
    }

    updateStatusText(now) {
        const labelStatusSpec = this.labelStatusSpec;
        if (!labelStatusSpec) {
            return;
        }
        const elapsedSecs = (now.getTime() - labelStatusSpec.t.getTime()) / 1000;
        this.labelStatus.text = `${getFriendlyDuration(elapsedSecs)}: ${labelStatusSpec.text}`;
        this.labelStatus.style.fill = labelStatusSpec.ok ? "#ffffff" : "#ff0000";
    }

    updateClockFace(now) {
        this.labelClock.text = monoDigit(localeTimeString(now));
    }

    updateMetrics(heartRate, chargeLevel, steps) {
        if (heartRate) {
            this.labelHeartRate.text = `${heartRate} `;
        }
        if (chargeLevel) {
            this.labelChargeLevel.text = `${Math.floor(chargeLevel)}%`;
        }
        if (steps) {
            this.labelWalkCount.text = `${steps}`;
        }
    }

}
