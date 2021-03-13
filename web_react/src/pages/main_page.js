import firebase from "firebase/app";
import {
    useDocumentData
} from "react-firebase-hooks/firestore";
import moment from "moment-timezone";

import {
    Card, CardContent, Grid, Typography
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { formatTimeFromNow } from "../util/time_format.js";
import { usePollingUpdate } from "../common/update_every.js";

// Sub modules
import ActivityStateModule from "../components/activity_state_module.js";
import HeartRateModule from "../components/heart_rate_module.js";
import AccelerationModule from "../components/acceleration_module.js";
import MetadataModule from "../components/metadata_module.js";
import MapModule from "../components/map_module.js";

const useStyles = makeStyles((theme) => ({
    cards: {
        // display: "flex",
        // flexFlow: "row wrap",
        flexGro: 1,
    },
    cardModule: {
        margin: "8px",
    },
}));

function MainPage({ uid }) {
    const [dashboardData, loading, error] = useDocumentData(
        firebase.firestore().collection("realtimeDashboard").doc(uid),
        { idField: "docKey" }
    );
    const classes = useStyles();

    usePollingUpdate(5000);

    if (error) {
        return <div>Error on loading data!</div>;
    }
    if (loading) {
        return <div>Loading...</div>;
    }

    if (!dashboardData) {
        return <div>No data</div>
    }

    const cardContents = [
        <ActivityStateModule dashboardData={dashboardData} />,
        <HeartRateModule dashboardData={dashboardData} />,
        <AccelerationModule dashboardData={dashboardData} />,
        <MapModule locationData={dashboardData.location || []} />,
        <MetadataModule dashboardData={dashboardData} />
    ];
    return <div>
        <Typography variant="h2">
            OpenKen
        </Typography>
        <div className={classes.cards}>
            <Grid container spacing={1}>
                {cardContents.map((cardContent, idx) =>
                    <Grid item xs={4} key={`cardModule_${idx}`}>
                        <Card elevation={3} className={classes.cardModule}>
                            {cardContent}
                        </Card>
                    </Grid>
                )}
            </Grid>
        </div>
    </div>;
}

export default MainPage;
