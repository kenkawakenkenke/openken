import { useState } from "react";
import { useAuth } from "../auth/firebase_auth_wth_claims";
import firebase from "../backend/firebase_config";
import "./user_info_page.css";
import { useDocumentData } from "react-firebase-hooks/firestore";
import getDistance from 'geolib/es/getDistance';
import {
    Button,
    TextField,
} from "@material-ui/core";
import {
    MapContainer, TileLayer, Rectangle, Circle,
    useMapEvents,
} from 'react-leaflet'
import { useToaster } from "../common/toast";

function doSignIn() {
    const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(googleAuthProvider);
};

function doSignOut() {
    firebase.auth().signOut();
}

function LocationClickHandler({ coordCallback }) {
    useMapEvents({
        click(e) {
            coordCallback(e.latlng);
        },
    });
    return null;
}

function SensitiveLocationPane({ isEditing, location, onStartEdit, onCancelEdit, onDelete, onUpdate }) {
    const isErrorRadius = !(parseInt(location.radius) > 0);
    return <div className={`SensitiveLocationRow ${isEditing ? "SensitiveLocationRowSelected" : ""}`}>
        {isEditing && "*"}
        <TextField className="SensitiveLocationField" label="Label"
            value={location.label}
            onChange={(e) => onUpdate({
                ...location,
                label: e.target.value
            })}
            variant="outlined" />
        <TextField className="SensitiveLocationField" label="Latitude" value={location.latitude} variant="outlined" />
        <TextField className="SensitiveLocationField" label="Longitude" value={location.longitude} variant="outlined" />
        <TextField className="SensitiveLocationField" label="Radius" value={location.radius}
            type="number"
            onChange={(e) => {
                const radiusNum = parseInt(e.target.value);
                onUpdate({
                    ...location,
                    radius: radiusNum >= 0 ? radiusNum : e.target.value,
                });
            }}
            variant="outlined"
            error={isErrorRadius}
            helperText={isErrorRadius && "Needs to be a positive number"}
        />
        {!isEditing && <Button variant="contained" onClick={onStartEdit}>Edit</Button>}
        {isEditing && <Button variant="contained" onClick={onCancelEdit}>OK</Button>}
        <Button variant="contained" onClick={onDelete}>Delete</Button>
    </div>;
}
function SensitiveLocationSettingsModule({ locations, onUpdate }) {
    const [mapRef, setMapRef] = useState();
    const [editingLocations, setEditingLocations] = useState(locations);
    const [selectedIndex, setSelectedIndex] = useState();
    const zoomIntoLocation = (location) => {
        mapRef.setView({ lat: location.latitude, lng: location.longitude }, 15);
    };
    const selectEditingIndex = (index) => {
        setSelectedIndex(index);
        if (index >= 0) {
            zoomIntoLocation(editingLocations[index]);
        }
    };

    const isEditingLocationsValid =
        editingLocations.every(location => {
            // Radius is a number
            if (!(parseInt(location.radius) > 0)) {
                return false;
            }
            if (location.label.length === 0) {
                return false;
            }
            return true;
        });

    const addLocation = () => {
        const center = mapRef.getCenter();
        const newLocation = {
            latitude: center.lat,
            longitude: center.lng,
            radius: 150,
            label: "A new location",
        };
        setEditingLocations([
            ...editingLocations,
            newLocation]);
        zoomIntoLocation(newLocation);
        setSelectedIndex(editingLocations.length);
    }
    const updateLocation = (index, updatedLocation) => {
        setEditingLocations(
            editingLocations
                .slice(0, index)
                .concat(updatedLocation)
                .concat(editingLocations.slice(index + 1)));
    };
    const selectClickedLocation = (clickedLocation) => {
        for (let index = 0; index < editingLocations.length; index++) {
            const location = editingLocations[index];
            const dist = getDistance(location, clickedLocation);
            if (dist <= location.radius) {
                setSelectedIndex(index);
                return;
            }
        }
    };

    const deleteLocation = (index) => {
        if (index >= editingLocations.length) {
            return;
        }
        setEditingLocations(editingLocations.slice(0, index).concat(editingLocations.slice(index + 1)));
        setSelectedIndex(undefined);
    }

    const darkOptions = {
        fillColor: "black",
        fillOpacity: 0.6,
        stroke: false,
    };
    const locationCircleOptions = {
        color: "blue",
        fillColor: "blue",
        fillOpacity: 0.4,
    };
    const selectedLocationCircleOptions = {
        color: "yellow",
        fillColor: "yellow",
        fillOpacity: 0.4,
    };

    return <div>
        {selectedIndex >= 0 && "Click on the map to select the center:"}
        <MapContainer
            className="MapModule"
            whenCreated={mapInstance => {
                setMapRef(mapInstance);
            }}
            center={[35.6995549, 139.4707288]}
            zoom={12}
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
            {
                editingLocations.map((location, index) => <Circle
                    key={`circle_${index}_${location.label}`}
                    center={[location.latitude, location.longitude]}
                    pathOptions={index === selectedIndex ? selectedLocationCircleOptions : locationCircleOptions}
                    radius={location.radius}
                />)
            }
            <LocationClickHandler coordCallback={latlng => {
                if (selectedIndex >= 0) {
                    updateLocation(selectedIndex, {
                        ...editingLocations[selectedIndex],
                        latitude: latlng.lat,
                        longitude: latlng.lng,
                    });
                } else {
                    selectClickedLocation({
                        latitude: latlng.lat,
                        longitude: latlng.lng,
                    });
                }
            }} />
        </MapContainer>

        <div className="SensitiveLocationsForm">
            {editingLocations.map((location, index) =>
                <SensitiveLocationPane
                    key={`sensitivelocation_${index}`}
                    isEditing={index === selectedIndex}
                    location={location}
                    onStartEdit={() => selectEditingIndex(index)}
                    onCancelEdit={() => selectEditingIndex(undefined)}
                    onDelete={() => deleteLocation(index)}
                    onUpdate={(newLocation) => updateLocation(index, newLocation)}
                />
            )}
            <Button variant="contained" onClick={addLocation}>Add new location</Button>
            <Button variant="contained" disabled={!isEditingLocationsValid} onClick={() => onUpdate(editingLocations)} color="primary">Save</Button>
        </div>
    </div >;
}

function SignedInPage() {
    const auth = useAuth();

    const toaster = useToaster();

    const [userInfo, loading, error] = useDocumentData(
        firebase.firestore().collection("users").doc(auth.user.uid),
        { idField: "docKey" }
    );

    const doSave = (newUserInfo) => {
        firebase.firestore()
            .collection("users")
            .doc(auth.user.uid)
            .set(newUserInfo);
        toaster("Saved!");
    }

    if (loading) {
        return <div>Loading...</div>
    }

    return <div>

        {error && `Error: ${error}`}

        <SensitiveLocationSettingsModule
            locations={userInfo?.sensitiveLocation || []}
            onUpdate={newLocations => {
                doSave({
                    ...userInfo,
                    sensitiveLocation: newLocations,
                })
            }}
        />
    </div>;
}

function UserInfoPage() {
    const auth = useAuth();

    return <div className="AccessTokenPage">
        {/* Signed in */}
        {auth.isSignedIn && <div className="AuthBar">
            <div>{auth.user.displayName}</div>
            <div>
                <Button variant="outlined" onClick={doSignOut}>Sign out</Button>
            </div>
        </div>}

        {/* Not signed in */}
        {!auth.isSignedIn &&
            <div className="AuthBar">
                <Button variant="outlined" onClick={doSignIn}>Sign in with Google</Button>
            </div>}

        {auth.isSignedIn &&
            <SignedInPage />}
    </div>;
}

export default UserInfoPage;
