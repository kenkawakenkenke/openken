import { CardContent } from "@material-ui/core";

function MetadataModule({ dashboardData }) {
    return <div>
        <CardContent>
            <p>Fitbit🔋: {dashboardData.fitbitChargeLevel}%</p>
        </CardContent>
    </div>;
}
export default MetadataModule;