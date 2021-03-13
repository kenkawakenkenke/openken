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

export async function generateFitbitData(accessToken) {
    const data = {
        timestamp: new Date().getTime(),
        available: true,
        chargeLevel: Math.floor(Math.random() * 100),
        heartRate: Math.floor(80 + Math.random() * 20),
        sleep: Math.random() < 0.5 ? "awake" : "asleep",
        zeroCross: Math.floor(Math.random() * 100),
    };
    return sendData(data, accessToken);
}
