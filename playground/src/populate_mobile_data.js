// Example script to send fake data to the mobile data reciver.
import firebase from './generator/setup_firebase.js';
import { getTestUserInfo } from "./generator/user_info.js";
import { generateMobileData } from "./generator/mobile_data_generator.js";

(async () => {
    const { uid } = await getTestUserInfo();
    await generateMobileData(firebase, uid);
})();
