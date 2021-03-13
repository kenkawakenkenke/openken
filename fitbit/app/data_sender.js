import CompanionUrlRequester from "./companion_requester.js";

export default class DataSender {
    constructor(ui) {
        this.ui = ui;
        this.requester = new CompanionUrlRequester();
        this.waitingResponse = false;
    }

    handleData(data) {
        if (this.waitingResponse) {
            this.ui.showConnectionLostLabel();
        }
        this.ui.showStatusText("Sending...", true);

        const baseURL = "https://asia-northeast1-open-ken.cloudfunctions.net/submitFitbitData";
        const serializedData = encodeURIComponent(JSON.stringify(data));
        const requestURL = `${baseURL}?data=${serializedData}`;
        this.waitingResponse = true;

        const parentThis = this;
        this.requester.request(requestURL,
            response => {
                parentThis.waitingResponse = false;
                parentThis.ui.hideConnectionLostLabel();

                const parsed = JSON.parse(response);
                if (parsed.status === "err") {
                    parentThis.ui.showStatusText("Error:" + parsed.reason, false);
                    return;
                }
                parentThis.ui.showStatusText("Sent!", true);
            },
            err => {
                parentThis.waitingResponse = false;
                parentThis.ui.showStatusText("Failed:" + err, false);
                parentThis.ui.showConnectionLostLabel();
            });
    }
}
