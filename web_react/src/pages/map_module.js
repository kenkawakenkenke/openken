import { MapContainer, TileLayer, Marker, Popup, Polyline, Rectangle, Circle } from 'react-leaflet'
import { useEffect, useRef, useState } from "react";

function computeViewBounds(polyline) {
    if (polyline.length === 0) {
        // return undefined;
        return [
            [50.505, -29.09],
            [52.505, 29.09],
        ];
    }
    if (polyline.length === 1 || isAllSame(polyline)) {
        const center = polyline[polyline.length - 1];
        const width = 0.01;
        return [
            [center[0] - width / 2, center[1] - width / 2],
            [center[0] + width / 2, center[1] + width / 2],
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
    const expander = 1.4;
    const width = right - left;
    const height = bottom - top;
    top -= height * expander;
    bottom += height * expander;
    left -= width * expander;
    right += width * expander;
    return [
        [top, left],
        [bottom, right]
    ];
}
function isAllSame(polyline) {
    if (polyline.length === 0) {
        return false;
    }
    const firstLat = polyline[0][0];
    const firstLng = polyline[0][1];
    return polyline.every(([lat, lng]) => lat === firstLat && lng === firstLng);
}
function MapModule({ locationData }) {
    const mapRef = useRef();
    // console.log(locationData);

    let polyline =
        locationData.map(location => ([location.latitude, location.longitude]));
    // console.log(polyline);
    const limeOptions = {
        color: '#aaffaa',
        weight: 10,
    }
    const darkOptions = {
        fillColor: "black",
        fillOpacity: 0.6,
        stroke: false,
    };
    const currentPositionStyle = {
        color: "lightblue",
        // fillColor: "yellow",
        weight: 4,
        // fillOpacity: 0.6,
    };

    // const [actualBounds, setActualBounds] = 

    const [mapReady, setMapReady] = useState(false);

    const viewBounds = computeViewBounds(polyline);
    useEffect(() => {
        if (mapRef.current) {
            console.log("updated:", viewBounds);
            mapRef.current.fitBounds(viewBounds);
            setMapReady(true);
        }
    }, [JSON.stringify(viewBounds), mapRef.current]);

    console.log("center", polyline[polyline.length - 1]);
    return <div>
        <MapContainer
            className="MapModule"
            whenCreated={mapInstance => {
                mapRef.current = mapInstance;
                console.log("set mapref!");
            }}
            scrollWheelZoom={false}
            style={{ height: '320px', width: "280px" }}>
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Rectangle
                bounds={[[-90, -180], [90, 180]]}
                pathOptions={darkOptions}
                opacity={0.1}
            />

            {/* {!isAllSame(polyline) && <Polyline
                pathOptions={limeOptions}
                positions={polyline}
            />} */}
            {/* {polyline.length > 0 && <Marker position={polyline[polyline.length - 1]}></Marker>} */}
            {/* {polyline.length > 0 && mapRef.current && mapReady &&
                < Circle
                    center={polyline[polyline.length - 1]}
                    pathOptions={currentPositionStyle}
                    radius={50}
                />} */}

            {/* <Marker position={[51.505, -0.09]}>
                <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
    </Popup>
            </Marker> */}
        </MapContainer>

    </div>;
}
export default MapModule;
