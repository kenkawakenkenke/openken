import firebase from "firebase/app";
import { useDocumentData } from "react-firebase-hooks/firestore";
import {
    Card, Grid, Typography
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { usePollingUpdate } from "../common/update_every.js";

// Sub modules
import ActivityStateModule from "../components/activity_state_module.js";
import HeartRateModule from "../components/heart_rate_module.js";
import AccelerationModule from "../components/acceleration_module.js";
import MetadataModule from "../components/metadata_module.js";
import MapModule from "../components/map_module.js";
import NumViewersModule from "../components/num_viewers_module.js";

const useStyles = makeStyles((theme) => ({
    cards: {
        flexGro: 1,
        margin: "8px",
    },
    cardGrid: {
        minWidth: "380px",
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
        <NumViewersModule uid={uid} />,
        <MetadataModule dashboardData={dashboardData} />,
    ];
    return <div>
        <Typography variant="h2">
            OpenKen
        </Typography>
        <div className={classes.cards}>
            <Grid container spacing={1}>
                {cardContents.map((cardContent, idx) =>
                    <Grid item xs={12} sm={3} key={`cardModule_${idx}`} className={classes.cardGrid}>
                        <Card elevation={3} className={classes.cardModule}>
                            {cardContent}
                        </Card>
                    </Grid>
                )}
            </Grid>
        </div>
    </div >;
}

export default MainPage;
