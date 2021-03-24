import {
    CardContent, Typography
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
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

function textForActivity(activity, t) {
    switch (activity) {
        case "vehicle":
            return t("On a vehicle");
        case "bicycle":
            return t("On a bicycle");
        case "still":
            return t("Resting");
        case "exercise":
            return t("Being active");
        case "walking":
            return t("Walking");
        case "running":
            return t("Running");
        case "asleep":
            return t("Sleeping");
        case "awake":
            return t("Awake");
        default:
            return t("Unknown");
    }
}

export function imgForActivity(activity) {
    switch (activity) {
        case "vehicle":
            return "/imgs/activities/activity_still.gif";
        case "bicycle":
            return "/imgs/activities/activity_still.gif";
        case "still":
            return "/imgs/activities/activity_still.gif";
        case "exercise":
            return "/imgs/activities/activity_exercise.gif";
        case "walking":
            return "/imgs/activities/activity_walk.gif";
        case "running":
            return "/imgs/activities/activity_running.gif";
        case "asleep":
            return "/imgs/activities/activity_sleep.jpg";
        case "awake":
            return "/imgs/activities/activity_still.gif";
        default:
            return "/imgs/activities/activity_still.gif";
    }
}

function ActivityStateModule({ dashboardData }) {
    const classes = useStyles();
    const { t } = useTranslation();
    return <div>
        <CardContent className={classes.root}>
            <Typography variant="h4">
                {textForActivity(dashboardData.activityState, t)}
                <img src={imgForActivity(dashboardData.activityState)} className={classes.activityImg} />
            </Typography>
        </CardContent>
    </div>;
}
export default ActivityStateModule;
