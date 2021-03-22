import { Button, CardContent } from "@material-ui/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TwitterFollowButton } from 'react-twitter-embed';
import AboutDialog from "./about";

function MetadataModule({ dashboardData }) {
    const { t } = useTranslation();
    const [aboutDialogOpen, setAboutDialogOpen] = useState(false);

    return <div>
        <CardContent>
            <p>Fitbit🔋: {dashboardData.fitbitChargeLevel}%</p>
            <p>
                <Button variant="outlined" color="primary" size="small" onClick={() => setAboutDialogOpen(true)}>
                    {t("About OpenKen")}
                </Button>
                <AboutDialog open={aboutDialogOpen} onClose={() => setAboutDialogOpen(false)} />
            </p>
            <TwitterFollowButton screenName={'kenkawakenkenke'} />

        </CardContent>
    </div>;
}
export default MetadataModule;