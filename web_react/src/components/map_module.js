import { MapContainer, TileLayer, Polyline, Rectangle, Circle } from 'react-leaflet'
import { useEffect, useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { CardActions, CardContent } from '@material-ui/core';
import { formatTimeFromNow } from "../util/time_format.js";
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
    root: {
        width: "100%",
        height: "250px",
    },
}));

function computeViewBounds(polyline, latestLocation) {
    if (!latestLocation) {
        // Some random location. We shouldn't even be showing a map.
        return [
            [50.505, -29.09],
            [52.505, 29.09],
        ];
    }
    const [centerLat, centerLng] = [latestLocation.latitude, latestLocation.longitude];
    if (polyline.length < 2 || isAllSame(polyline)) {
        const width = 0.01;
        return [
            [centerLat - width / 2, centerLng - width / 2],
            [centerLat + width / 2, centerLng + width / 2],
        ];
    }

    let [top, left] = polyline[0];
    let [bottom, right] = polyline[0];
    polyline.forEach(([lat, lng]) => {
        top = Math.max(top, lat);
        left = Math.min(left, lng);
        bottom = Math.min(bottom, lat);
        right = Math.max(right, lng);
    });
    const expander = 1.1;
    const halfWidth = Math.max(centerLng - left, right - centerLng);
    const halfHeight = Math.max(centerLat - bottom, top - centerLat);
    left = centerLng - halfWidth * expander;
    right = centerLng + halfWidth * expander;
    top = centerLat + halfHeight * expander;
    bottom = centerLat - halfHeight * expander;
    return [
        [top, left],
        [bottom, right]
    ];
}
function isAllSame(polyline) {
    if (polyline.length === 0) {
        return true;
    }
    const firstLat = polyline[0][0];
    const firstLng = polyline[0][1];
    return polyline.every(([lat, lng]) => lat === firstLat && lng === firstLng);
}
function coordToMapCoord(coord) {
    return [coord.latitude, coord.longitude];
}
function MapModule({ locationData }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const [mapRef, setMapRef] = useState();

    let polyline = locationData
        .filter(location => !location.semantic)
        .map(coordToMapCoord);

    const limeOptions = {
        color: '#aaffaa',
        weight: 2,
    }
    const darkOptions = {
        fillColor: "black",
        fillOpacity: 0.6,
        stroke: false,
    };
    const currentPositionStyle = {
        color: "lightblue",
        weight: 4,
    };
    const currentPositionSensitiveStyle = {
        color: "#D4D256",
        weight: 4,
    };

    const [mapReady, setMapReady] = useState(false);

    const latestLocation = locationData.length > 0 && locationData[locationData.length - 1];
    const [[viewBoundTop, viewBoundLeft],
        [viewBoundBottom, viewBoundRight]]
        = computeViewBounds(polyline, latestLocation);
    // console.log(viewBoundTop, viewBoundLeft, viewBoundBottom, viewBoundRight);
    useEffect(() => {
        if (!mapRef) {
            return;
        }
        mapRef.fitBounds(
            [[viewBoundTop, viewBoundLeft],
            [viewBoundBottom, viewBoundRight]]
        );
        setMapReady(true);
    }, [viewBoundTop, viewBoundLeft, viewBoundBottom, viewBoundRight, mapRef]);

    if (locationData.length === 0) {
        return <div>No location data</div>;
    }
    return <div>
        <CardContent>
            {t("Location is blurred out for some places")}

            <MapContainer
                className={classes.root}
                whenCreated={mapInstance => {
                    setMapRef(mapInstance);
                }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Rectangle
                    bounds={[[-90, -180], [90, 180]]}
                    pathOptions={darkOptions}
                    opacity={0.1}
                />

                {!isAllSame(polyline) && mapReady && <Polyline
                    pathOptions={limeOptions}
                    positions={polyline}
                />}
                {latestLocation && mapReady &&
                    <Circle
                        center={coordToMapCoord(latestLocation)}
                        pathOptions={latestLocation.semantic ? currentPositionSensitiveStyle : currentPositionStyle}
                        radius={latestLocation.radius || 100}
                    />
                }
            </MapContainer>
        </CardContent>
        <CardActions>
            {t("Last update")} {formatTimeFromNow(latestLocation.t.toDate(), t)}
        </CardActions>
    </div>;
}
export default MapModule;
