import {
    CardContent, Typography
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
const useStyles = makeStyles((theme) => ({
    root: {
        margin: "8px",
        fontSize: "4em",
        // width: "300px",
    },
    activityImg: {
        width: "100%",
    }
}));

function textForActivity(activity) {
    switch (activity) {
        case "vehicle":
            return "乗り物に乗ってます";
        case "bicycle":
            return "自転車に乗ってます";
        case "still":
            return "じっとしています";
        case "exercise":
            return "活動してます";
        case "walking":
            return "歩いています";
        case "running":
            return "走っています";
        case "asleep":
            return "寝ています";
        case "awake":
            return "起きています";
        default:
            return "Unknown";
    }
}

function imgForActivity(activity) {
    switch (activity) {
        case "vehicle":
            return "imgs/activities/activity_still.gif";
        case "bicycle":
            return "imgs/activities/activity_still.gif";
        case "still":
            return "imgs/activities/activity_still.gif";
        case "exercise":
            return "imgs/activities/activity_exercise.gif";
        case "walking":
            return "imgs/activities/activity_walk.gif";
        case "running":
            return "imgs/activities/activity_running.gif";
        case "asleep":
            return "imgs/activities/activity_sleep.jpg";
        case "awake":
            return "imgs/activities/activity_still.gif";
        default:
            return "imgs/activities/activity_still.gif";
    }
}

function ActivityStateModule({ dashboardData }) {
    const classes = useStyles();
    return <div>
        <CardContent className={classes.root}>
            <Typography variant="h4">
                {textForActivity(dashboardData.activityState)}
                <img src={imgForActivity(dashboardData.activityState)} className={classes.activityImg} />
            </Typography>
        </CardContent>
    </div>;
}
export default ActivityStateModule;
