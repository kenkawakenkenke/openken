// Example script to send fake data to the fitbit data reciver.
import fetch from "node-fetch";

async function sendData(data, accessToken) {
    const baseURL = "http://localhost:5001/open-ken/asia-northeast1/submitFitbitData";
    const serializedData = encodeURIComponent(JSON.stringify(data));
    const requestURL = `${baseURL}?data=${serializedData}&token=${accessToken}`;
    const response = await fetch(requestURL);
    const text = await response.text();
    console.log(text);
}
const data = {
    timestamp: new Date().getTime(),
    available: true,
    chargeLevel: 78,
    heartRate: 90,
    sleep: "awake",
};

(async () => {
    // Note, this is just an example access token, so we're not leaking anything here.
    const accessToken = "Ey2fon0qd6ONFT8J63Ymiv3JLGwFWQaL9LN0Q8n7FlMJ00Fp";

    await sendData(data, accessToken);
})();
