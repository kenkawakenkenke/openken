// Example script to send lots of fake data to the fitbit data reciver.
import firebase from './generator/setup_firebase.js';
import { generateMobileData } from "./generator/mobile_data_generator.js";
import { generateFitbitData } from "./generator/fitbit_data_generator.js";
import { getTestUserInfo } from "./generator/user_info.js";

(async () => {
    const { uid, accessToken } = await getTestUserInfo();

    for (let i = 0; i < 20; i++) {
        await generateFitbitData(accessToken);
        await generateMobileData(firebase, uid);
    }
})();
