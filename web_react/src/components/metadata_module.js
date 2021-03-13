import { CardContent } from "@material-ui/core";
import { TwitterFollowButton } from 'react-twitter-embed';

function MetadataModule({ dashboardData }) {
    return <div>
        <CardContent>
            <p>Fitbit🔋: {dashboardData.fitbitChargeLevel}%</p>
            <p>
                <a href="https://github.com/kenkawakenkenke/openken" target="_blank">
                    OpenKen Project
                </a>
            </p>
            <TwitterFollowButton screenName={'kenkawakenkenke'} />

        </CardContent>
    </div>;
}
export default MetadataModule;