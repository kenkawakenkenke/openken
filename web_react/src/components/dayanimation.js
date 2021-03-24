import firebase from "firebase/app";
import { useCollectionData } from "react-firebase-hooks/firestore";
import moment from "moment-timezone";
import { imgForActivity } from "./activity_state_module.js";
import { makeStyles } from "@material-ui/core";

const gifSizePx = 48;

const useStyles = makeStyles((theme) => ({
    root: {
        margin: "8px",
        marginBottom: "42px",
        // fontSize: "4em",
        // width: "300px",
    },
    dayDiv: {
        borderBottom: "#dddddd 0.1px solid",
    },
    dateDiv: {
        width: "200px",
        display: "inline-block",
    },
    unknownActivity: {
        width: gifSizePx + "px",
        height: gifSizePx + "px",
        backgroundColor: "white",
        display: "inline-block",
    },
    timeBox: {
        width: gifSizePx + "px",
        backgroundColor: "white",
        display: "inline-block",
        fontSize: "1em",
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
    return <div className={classes.dayDiv}>
        <div className={classes.dateDiv}>
            {date.format("MM月DD日")}（{weekDay(date.format("ddd"))}）
        </div>
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

const gran = 60;
function Times() {
    const classes = useStyles();
    const today = moment().tz("Asia/Tokyo").startOf("day");

    const times = [];
    for (let min = 0; min < 1440; min += gran) {
        times.push(today.clone().add(min, "minutes"));
    }

    return <div>
        <div className={classes.dateDiv}></div>
        {times.map((time, idx) => {
            return <div className={classes.timeBox}>
                {idx % 3 === 0 && time.format("HH:mm")}
            </div>;
        })}
    </div>;
}

function DayAnimation() {
    const classes = useStyles();
    const [data, loading, error] = useCollectionData(
        firebase.firestore().collection("coarseActivities60"),
        { idField: "docKey" }
    );
    if (loading || error) {
        console.log(error);
        return <div>Loading...</div>;
    }
    console.log(data);
    return <div className={classes.root}>
        <Times />
        {data.map(dayData =>
            <Day dayData={dayData} />)
        }
    </div>;
}
export default DayAnimation;
