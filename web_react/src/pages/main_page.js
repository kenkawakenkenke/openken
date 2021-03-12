import firebase from "firebase";
import { useDocumentData, useCollectionDataOnce } from "react-firebase-hooks/firestore";
import moment from "moment-timezone";
import "./main_page.css";
import { useEffect, useState } from "react";

import Heart from "../components/heart.js";
import MapModule from "./map_module.js";


function ActivityStateModule({ dashboardData }) {
    function textForActivity(activity) {
        switch (activity) {
            case "vehicle":
                return "Ken is in a vehicle";
            case "bicycle":
                return "Ken is on a bicycle";
            case "still":
            case "walking":
            case "running":
            case "asleep":
            case "awake":
                return `Ken is ${activity}`;
            default:
                return "Unknown";
        }
    }

    return <div className="DataModule ActivityStateModule">
        <p>{textForActivity(dashboardData.activityState)}</p>
    </div>;
}

function HeartRateModule({ dashboardData }) {
    if (!dashboardData.tLastUpdate.fitbit) {
        return <div></div>;
    }
    let heartRate = dashboardData.heartRate;
    let heartRateText = heartRate;
    let warningText = "";
    const now = moment();
    const duration = moment.duration(now.diff(moment(dashboardData.tLastUpdate.fitbit.toDate())), "milliseconds");
    if (duration.asSeconds() > 120) {
        heartRate = 0;
        heartRateText = "-";
        warningText = "No data for 2 minutes";
    }

    return <div className="DataModule HeartRateModule">
        <div className="HeartRateAndWarning">
            <div className="HeartRateAndIcon">
                <div className="HeartContainer">
                    <Heart bpm={heartRate} />
                </div>
                <div className="HeartRateText">
                    {heartRateText}
                </div>
            </div>
            <div className="HeartRateWarning">{warningText}</div>
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

    // const [locationDump, locationloading, locationerror] = useCollectionDataOnce(
    //     firebase.firestore().collection("rawMobileData")
    //         .orderBy("data.timestamp", "asc"),
    //     { idField: "docKey" }
    // );

    const pollingTime = usePollingUpdate();

    if (error) {
        return <div>Error on loading data!</div>;
    }
    if (loading) {
        return <div>Loading...</div>;
    }

    // let locationDumpData = [];
    // if (!locationloading && !locationerror && locationDump) {
    //     locationDumpData =
    //         locationDump
    //             .map(record => record.data.location)
    //             .filter(location => location)
    //         ;
    // }
    if (!dashboardData) {
        return <div>No data</div>
    }

    return <div>
        <h2>OpenKen</h2>
        <div className="DashboardPage">
            {/* <MapModule locationData={locationDumpData} /> */}

            <ActivityStateModule dashboardData={dashboardData} />
            <HeartRateModule dashboardData={dashboardData} />

            {/* <CurrentTimeModule tLastUpdate={pollingTime} /> */}

            <MetadataModule dashboardData={dashboardData} />

            <MapModule locationData={dashboardData.location || []} />
        </div>
    </div>;
}

export default MainPage;
