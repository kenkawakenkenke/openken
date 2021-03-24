import firebase from "firebase/app";
import { useCollectionData } from "react-firebase-hooks/firestore";
import moment from "moment-timezone";
import { imgForActivity } from "./activity_state_module.js";
import { makeStyles } from "@material-ui/core";

const gifSizePx = 42;

const useStyles = makeStyles((theme) => ({
    root: {
        margin: "8px",
        fontSize: "4em",
        // width: "300px",
    },
    unknownActivity: {
        width: gifSizePx + "px",
        height: gifSizePx + "px",
        backgroundColor: "white",
        display: "inline-block",
    }
}));
function weekDay(englishDOW) {
    switch (englishDOW) {
        case "Mon":
            return "月";
        case "Tue":
            return "火";
        case "Wed":
            return "水";
        case "Thu":
            return "木";
        case "Fri":
            return "金";
        case "Sat":
            return "土";
        case "Sun":
            return "日";
        default:
            return "Boom";
    }
}

function Day({ dayData }) {
    const classes = useStyles();
    const date = moment(dayData.day.toDate()).tz("Asia/Tokyo").locale("ja-JP");
    return <div>
        {date.format("MM月DD日")}（{weekDay(date.format("ddd"))}）
        {dayData.activities
            .map(a => a === "unknown" ? "" : imgForActivity(a))
            .map(img => {
                if (img === "") {
                    return <div className={classes.unknownActivity}></div>;
                }
                return <img src={img} width={gifSizePx} />;
            })}
    </div>;
}

function DayAnimation() {
    const [data, loading, error] = useCollectionData(
        firebase.firestore().collection("coarseActivities60"),
        { idField: "docKey" }
    );
    if (loading || error) {
        console.log(error);
        return <div>Loading...</div>;
    }
    console.log(data);
    return <div>
        {data.map(dayData =>
            <Day dayData={dayData} />)
        }
    </div>;
}
export default DayAnimation;
