import firebase from "firebase/app";
import {
    useDocumentData
    // , useCollectionDataOnce
} from "react-firebase-hooks/firestore";
import moment from "moment-timezone";
import "./main_page.css";
import { useEffect, useState } from "react";

import Heart from "../components/heart.js";
import MapModule from "./map_module.js";

function ActivityStateModule({ dashboardData }) {
    function textForActivity(activity) {
        switch (activity) {
            case "vehicle":
                return "乗車中";
            case "bicycle":
                return "自転車に乗ってます";
            case "still":
                return "じっとしてます";
            case "walking":
                return "歩いてます";
            case "running":
                return "走ってます";
            case "asleep":
                return "寝てます";
            case "awake":
                return "起きてます";
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

    const fitbitUpdateTime = moment(dashboardData.tLastUpdate.fitbit.toDate()).tz("Asia/Tokyo");
    const now = moment();
    const duration = moment.duration(now.diff(fitbitUpdateTime), "milliseconds");
    if (duration.asSeconds() > 120) {
        heartRate = 0;
        heartRateText = "-";
        warningText = "2分以上データがありません";
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
            <div>最終データ更新：{formatTimeFromNow(fitbitUpdateTime)}</div>
        </div>
    </div>;
}

// function CurrentTimeModule({ tLastUpdate }) {
//     return <div className="DataModule">
//         <div className="CurrentTimeText">
//             {tLastUpdate.format("HH:mm:ss")}
//         </div>
//     </div>
// }

function formatTimeFromNow(t) {
    if (!t) {
        return "データなし";
    }
    const now = moment();
    const durationMs = now.diff(t);
    if (durationMs < 60 * 1000) {
        return "数秒前";
    }
    if (durationMs < 2 * 60 * 1000) {
        return "一分前";
    }
    if (durationMs < 10 * 60 * 1000) {
        return "数分前";
    }
    if (durationMs < 60 * 60 * 1000) {
        return "十数分前";
    }
    if (durationMs < 2 * 60 * 60 * 1000) {
        return "一時間前";
    }
    return "ずっと前";
}

function usePollingUpdate(updateEveryMs) {
    const [tPoll, setTPoll] = useState(moment());
    useEffect(() => {
        const timer = setInterval(() => {
            setTPoll(moment().tz("Asia/Tokyo"));
        }, 1000);
        return () => {
            clearInterval(timer);
        }
    }, []);
    return tPoll;
}

function MetadataModule({ dashboardData }) {
    const mobileUpdateTime = dashboardData.tLastUpdate.mobile && moment(dashboardData.tLastUpdate.mobile.toDate()).tz("Asia/Tokyo");

    return <div className="DataModule">
        <p>Fitbit🔋: {dashboardData.fitbitChargeLevel}%</p>
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

    usePollingUpdate();

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

    const mobileUpdateTime = dashboardData.tLastUpdate.mobile && moment(dashboardData.tLastUpdate.mobile.toDate()).tz("Asia/Tokyo");
    return <div>
        <h2>OpenKen</h2>
        <div className="DashboardPage">
            {/* <MapModule locationData={locationDumpData} /> */}

            <ActivityStateModule dashboardData={dashboardData} />
            <HeartRateModule dashboardData={dashboardData} />

            {/* <CurrentTimeModule tLastUpdate={pollingTime} /> */}

            <div className="DataModule">
                <MapModule locationData={dashboardData.location || []} />
                <div>最終データ更新：{formatTimeFromNow(mobileUpdateTime)}</div>
            </div>

            <MetadataModule dashboardData={dashboardData} />

        </div>
    </div>;
}

export default MainPage;
