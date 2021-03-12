/*
 * Entry point for the companion app
 */
import * as messaging from "messaging";
import { me } from "companion";
import { settingsStorage } from "settings";

// TODO: allow watch to show an error if we haven't set an access token yet.
function getAccessToken() {
    const accessTokenEntry = settingsStorage.getItem("accessToken");
    return accessTokenEntry && JSON.parse(accessTokenEntry).name;
};

messaging.peerSocket.addEventListener("open", (evt) => {
    console.log("Ready to send or receive messages on the companion");
});

messaging.peerSocket.addEventListener("message", (evt) => {
    console.log("companion received message");
    const payload = evt.data;
    if (!payload) {
        return;
    }
    // fetch: expects a "url" in the payload.
    if (payload.request === "fetch") {
        // console.log("Companion received fetch request:", JSON.stringify(payload));
        handleFetch(payload);
        return;
    }
});

function handleFetch(payload) {
    // const url = payload.url;

    // TODO: this should be handled by the watch
    const url = `${payload.url}&token=${getAccessToken()}`;

    const requestID = payload.id;
    fetchAndRespond(url, response => {
        messaging.peerSocket.send({
            request: "fetchResponse",
            id: requestID,
            response,
        });
    });
}

async function fetchAndRespond(url, callback) {
    await fetch(url)
        .then(res => res.text())
        .then(body => {
            callback(body);
            return body;
        });
};
