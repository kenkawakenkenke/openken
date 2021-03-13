// Example script to send fake data to the fitbit data reciver.
import { generateFitbitData } from "./generator/fitbit_data_generator.js";
import { getTestUserInfo } from "./generator/user_info.js";

(async () => {
    const { accessToken } = await getTestUserInfo();

    await generateFitbitData(accessToken);
})();
