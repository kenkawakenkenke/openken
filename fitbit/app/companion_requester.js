import * as messaging from "messaging";

class CompanionUrlRequester {
    constructor() {
        let callbacks = {};
        this.requestAccumulator = 100;
        this.callbackForRequestId = callbacks;

        const parentThis = this;
        messaging.peerSocket.addEventListener("message", (evt) => {
            parentThis.messageEventListener(evt);
        });
    }

    messageEventListener(evt) {
        const payload = evt.data;
        if (!payload) {
            return;
        }
        if (payload.request !== "fetchResponse") {
            return;
        }
        const requestId = payload.id;
        const response = payload.response;
        const callback = this.callbackForRequestId[requestId];
        delete this.callbackForRequestId[requestId];
        if (!callback) {
            console.log("missing callback for", requestId);
            return;
        }
        callback(response);
    }

    request(url, callback) {
        if (messaging.peerSocket.readyState !== messaging.peerSocket.OPEN) {
            console.log("peer socket not open!! can't request.");
            return;
        }

        const requestID = this.requestAccumulator++;
        // console.log("new request " + requestID + " " + url);
        this.callbackForRequestId[requestID] = callback;

        // Send the data to peer as a message
        const payload = {
            request: "fetch",
            url,
            id: requestID,
        };
        messaging.peerSocket.send(payload);
    }
}
export default CompanionUrlRequester;
