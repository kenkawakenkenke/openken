import firebase from "firebase";
import { useDocumentData } from "react-firebase-hooks/firestore";
import moment from "moment-timezone";
import "./main_page.css";
import { useEffect, useState } from "react";

function HeartRatePane({ dashboardData }) {
    const heartRate = dashboardData.heartRate;

    return <div className="DataModule">
        <div className="HeartRateText">
            {heartRate}
        </div>
    </div>;
}

function formatTimeFromNow(t) {
    const now = moment();
    const duration = moment.duration(now.diff(t), "milliseconds");
    return duration.humanize() + " ago";
    // return duration + " ago";
}

function MainPage({ uid }) {
    const [dashboardData, loading, error] = useDocumentData(
        firebase.firestore().collection("realtimeDashboard").doc(uid),
        { idField: "docKey" }
    );

    const [tPoll, setTPoll] = useState(moment());
    useEffect(() => {
        const timer = setInterval(() => {
            setTPoll(moment().tz("Asia/Tokyo"));
        }, 1000);
        return () => {
            clearInterval(timer);
        }
    }, []);

    if (error) {
        return <div>Error on loading data!</div>;
    }
    if (loading) {
        return <div>Loading...</div>;
    }
    const tLastUpdate = moment(dashboardData.tLastUpdate.toDate()).tz("Asia/Tokyo");
    return <div className="DashboardPage">
        <HeartRatePane dashboardData={dashboardData} />

        <div className="DataModule">
            Last update: {formatTimeFromNow(tLastUpdate)}
        </div>

        <div className="DataModule">{tPoll.format("HH:mm:ss")}
        </div>
    </div>;
}

export default MainPage;
