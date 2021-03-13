import moment from "moment-timezone";
import {
    LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { makeStyles } from '@material-ui/core/styles';
import { formatTimeFromNow } from "../util/time_format.js";
import { CardActions, CardContent } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    root: {
        margin: "8px",
    },
}));

function AccelerationModule({ dashboardData }) {
    const classes = useStyles();
    const data = dashboardData.accel.map(
        accelData => ({
            t: accelData.t.toDate().getTime(),
            v: accelData.v,
        })
    );
    if (!dashboardData.tLastUpdate.fitbit) {
        return <div></div>;
    }
    const maxY = Math.max(150, data.reduce((accum, c) => Math.max(accum, c.v), 0));
    const fitbitUpdateTime = moment(dashboardData.tLastUpdate.fitbit.toDate()).tz("Asia/Tokyo");
    return <div>
        <CardContent>
            <ResponsiveContainer width='100%' aspect={4.0 / 3}>
                <LineChart
                    width={400}
                    height={200}
                    data={data}
                    margin={{
                        top: 0,
                        right: 8,
                        left: 8,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="t"
                        tickFormatter={(v) => moment(v).format("HH:mm")}
                    />
                    <YAxis
                        domain={[0, maxY]}
                        label={{ value: '活動量', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Line dataKey="v" fill="#8884d8" />
                </LineChart>
            </ResponsiveContainer>
        </CardContent>
        <CardActions>
            最終データ更新：{formatTimeFromNow(fitbitUpdateTime)}
        </CardActions>
    </div>
}
export default AccelerationModule;
