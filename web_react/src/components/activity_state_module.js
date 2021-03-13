import { CardContent } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        margin: "8px",
        fontSize: "4em",
        width: "300px",
    },
}));

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

function ActivityStateModule({ dashboardData }) {
    const classes = useStyles();
    return <div>
        <CardContent className={classes.root}>
            {textForActivity(dashboardData.activityState)}
        </CardContent>
    </div>;
}
export default ActivityStateModule;
