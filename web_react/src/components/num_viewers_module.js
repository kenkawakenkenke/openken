import { useUuid } from "../common/uuid.js";
import firebase from "firebase/app";
import { useCollectionData, useCollectionDataOnce, useDocumentData } from "react-firebase-hooks/firestore";
import { useEffect, useState } from "react";
import moment from "moment-timezone";
import {
    Card, CardContent, Grid, Typography
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { usePollingUpdate } from "../common/update_every.js";
import { useTranslation } from "react-i18next";

function NumViewersModule({ uid }) {
    const { t } = useTranslation();

    const getMinViewerTime = () => moment().add(-1, "minutes");
    const [minViewerTime, setMinViewerTime] = useState(getMinViewerTime());
    const [viewers, loading, error] = useCollectionDataOnce(
        firebase.firestore()
            .collection("viewer")
            .where("uid", "==", uid)
            .where("t", ">=", minViewerTime.toDate())
    );
    const viewerID = useUuid();
    usePollingUpdate(30000, () => {
        if (!viewerID) {
            return;
        }
        // console.log("writing viewer", viewerID);
        firebase.firestore().collection("viewer").doc(viewerID)
            .set({
                t: new Date(),
                uid,
            })
        // .then(res => console.log(" => write done"));
        setMinViewerTime(getMinViewerTime());
    }, [viewerID]);
    if (error) {
        console.log("error", error);
        return <div>Error:{JSON.stringify(error)}</div>
    }
    return <div>
        <CardContent>
            <Typography variant="h5">
                {t("Number watching")}
            </Typography>

            <Typography variant="h3">
                {error && "Error"}
                {loading ? "Loading.." : viewers.length}
            </Typography>
        </CardContent>
    </div>;
}
export default NumViewersModule;