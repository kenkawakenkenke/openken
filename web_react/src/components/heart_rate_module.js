import moment from "moment-timezone";
import Heart from "./heart.js";
import { formatTimeFromNow } from "../util/time_format.js";
import {
    LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts';
import { makeStyles } from '@material-ui/core/styles';
import { CardActions, CardContent } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    Contents: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "8px",
    },
    HeartRateAndIcon: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
    HeartRateText: {
        fontSize: "8em",
    },
    HeartContainer: {
        width: "100px",
        height: "100px",
    },
    HeartRateWarning: {
        color: "red",
        fontSize: "2em",
    },
}));

function HeartRateModule({ dashboardData }) {
    const classes = useStyles();
    if (!dashboardData.tLastUpdate.fitbit) {
        return <div></div>;
    }
    const heartRates = dashboardData.heartRate.map(
        heartRate => ({
            t: heartRate.t.toDate().getTime(),
            v: heartRate.v,
        })
    );
    let heartRate = heartRates[heartRates.length - 1].v;
    let heartRateText = heartRate;
    let warningText = "";

    let min = heartRates.length > 0 ? heartRates[0].v : 0;
    let max = min;
    heartRates.map(r => r.v).forEach(v => {
        min = Math.min(min, v);
        max = Math.max(max, v);
    });

    const fitbitUpdateTime = moment(dashboardData.tLastUpdate.fitbit.toDate()).tz("Asia/Tokyo");
    const now = moment();
    const duration = moment.duration(now.diff(fitbitUpdateTime), "milliseconds");
    if (duration.asSeconds() > 120) {
        heartRate = 0;
        heartRateText = "-";
        warningText = "2分以上データがありません";
    }

    return <div>
        <CardContent className={classes.Contents}>
            <div className={classes.HeartRateAndIcon}>
                <div className={classes.HeartContainer}>
                    <Heart bpm={heartRate} />
                </div>
                <div className={classes.HeartRateText}>
                    {heartRateText}
                </div>
            </div>
            <div className={classes.HeartRateWarning}>
                {warningText}
            </div>

            <ResponsiveContainer width='100%' aspect={4.0 / 1.5}>
                <LineChart
                    data={heartRates}
                    margin={{
                        top: 0,
                        right: 8,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="t"
                        tickFormatter={(v) => moment(v).format("HH:mm")}
                    />
                    <YAxis domain={[min, max]} />
                    <Tooltip />
                    <Line dataKey="v" fill="#8884d8" />
                </LineChart>
            </ResponsiveContainer>
        </CardContent>
        <CardActions>最終データ更新：{formatTimeFromNow(fitbitUpdateTime)}</CardActions>
    </div>;
}
export default HeartRateModule;
