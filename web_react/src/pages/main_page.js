import firebase from "firebase";
import { useDocumentData } from "react-firebase-hooks/firestore";
import moment from "moment-timezone";
import "./main_page.css";
import { useEffect, useState } from "react";

import Heart from "../components/heart.js";

function ActivityStateModule({ dashboardData }) {
    const heartRate = dashboardData.heartRate;

    return <div className="DataModule ActivityStateModule">
        <p>Ken is: {dashboardData.activityState}</p>
    </div>;
}

function HeartRateModule({ dashboardData }) {
    const heartRate = dashboardData.heartRate;

    if (!dashboardData.tLastUpdate.fitbit) {
        return <div className="DataModule HeartRateModule"></div>;
    }
    const now = moment();
    const duration = moment.duration(now.diff(moment(dashboardData.tLastUpdate.fitbit.toDate())), "milliseconds");
    if (duration.asSeconds() > 120) {
        return <div className="DataModule HeartRateModule">
            <div className="HeartContainer">
                <Heart bpm={0} />
            </div>
            <div className="HeartRateText">
                -
                     </div>
        </div>;
    }

    return <div className="DataModule HeartRateModule">
        <div className="HeartContainer">
            <Heart bpm={heartRate} />
        </div>
        <div className="HeartRateText">
            {heartRate}
        </div>
    </div>;
}

function CurrentTimeModule({ tLastUpdate }) {
    return <div className="DataModule">
        <div className="CurrentTimeText">
            {tLastUpdate.format("HH:mm:ss")}
        </div>
    </div>
}

function formatTimeFromNow(t) {
    if (!t) {
        return "No data";
    }
    const now = moment();
    const duration = moment.duration(now.diff(t), "milliseconds");
    return duration.humanize() + " ago";
    // return duration + " ago";
}

function usePollingUpdate(updateEveryMs) {
    const [tPoll, setTPoll] = useState(moment());
    useEffect(() => {
        const timer = setInterval(() => {
            setTPoll(moment().tz("Asia/Tokyo"));
        }, 1000);
        return () => {
            clearInterval(updateEveryMs);
        }
    }, []);
    return tPoll;
}

function MetadataModule({ dashboardData }) {
    const fitbitUpdateTime = dashboardData.tLastUpdate.fitbit && moment(dashboardData.tLastUpdate.fitbit.toDate()).tz("Asia/Tokyo");
    const mobileUpdateTime = dashboardData.tLastUpdate.mobile && moment(dashboardData.tLastUpdate.mobile.toDate()).tz("Asia/Tokyo");

    return <div className="DataModule">
        <p>Fitbit last update: {formatTimeFromNow(fitbitUpdateTime)}</p>
        <p>Fitbit charge🔋: {dashboardData.fitbitChargeLevel}%</p>
        <p>Mobile last update: {formatTimeFromNow(mobileUpdateTime)}</p>
    </div>;
}
function MainPage({ uid }) {
    const [dashboardData, loading, error] = useDocumentData(
        firebase.firestore().collection("realtimeDashboard").doc(uid),
        { idField: "docKey" }
    );

    const pollingTime = usePollingUpdate();

    if (error) {
        return <div>Error on loading data!</div>;
    }
    if (loading) {
        return <div>Loading...</div>;
    }

    return <div>
        <h2>OpenKen</h2>
Where you (primarily my family) can spy on Ken.

        <div className="DashboardPage">
            <ActivityStateModule dashboardData={dashboardData} />
            <HeartRateModule dashboardData={dashboardData} />

            <CurrentTimeModule tLastUpdate={pollingTime} />

            <MetadataModule dashboardData={dashboardData} />
        </div>
    </div>;
}

export default MainPage;
