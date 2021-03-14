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
}));

function textForActivity(activity) {
    switch (activity) {
        case "vehicle":
            return "乗り物に乗ってます";
        case "bicycle":
            return "自転車に乗ってます";
        case "still":
            return "じっとしています";
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

function ActivityStateModule({ dashboardData }) {
    const classes = useStyles();
    return <div>
        <CardContent className={classes.root}>
            <Typography variant="h4">
                {textForActivity(dashboardData.activityState)}
            </Typography>
        </CardContent>
    </div>;
}
export default ActivityStateModule;
