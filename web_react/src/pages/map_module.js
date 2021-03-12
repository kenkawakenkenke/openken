import { MapContainer, TileLayer, Marker, Popup, Polyline, Rectangle, Circle } from 'react-leaflet'
import { useEffect, useRef, useState } from "react";

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
        top = Math.min(top, lat);
        left = Math.min(left, lng);
        bottom = Math.max(bottom, lat);
        right = Math.max(right, lng);
    });
    const expander = 1.25;
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
    const mapRef = useRef();

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
    const viewBounds = computeViewBounds(polyline, latestLocation);
    useEffect(() => {
        if (mapRef.current) {
            console.log("updated:", viewBounds[0], viewBounds[1]);
            mapRef.current.fitBounds(viewBounds);
            setMapReady(true);
        }
    }, [JSON.stringify(viewBounds), mapRef.current]);

    if (locationData.length === 0) {
        return <div>No location data</div>;
    }
    return <div>
        <MapContainer
            className="MapModule"
            whenCreated={mapInstance => {
                mapRef.current = mapInstance;
            }}
            scrollWheelZoom={true}
            style={{ height: '320px', width: "480px" }}>
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

    </div>;
}
export default MapModule;
