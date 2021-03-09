import firebase from "firebase";
import { useDocumentData } from "react-firebase-hooks/firestore";
import moment from "moment-timezone";
import "./main_page.css";
import { useEffect, useState } from "react";

function HeartRateModule({ dashboardData }) {
    const heartRate = dashboardData.heartRate;

    return <div className="DataModule">
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
    const tLastUpdate = moment(dashboardData.tLastUpdate.toDate()).tz("Asia/Tokyo");
    return <div className="DashboardPage">

        <HeartRateModule dashboardData={dashboardData} />

        <CurrentTimeModule tLastUpdate={pollingTime} />

        <div className="DataModule">
            Last update: {formatTimeFromNow(tLastUpdate)}
        </div>

    </div>;
}

export default MainPage;
