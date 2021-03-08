import { useState } from "react";
import { useAuth } from "../auth/firebase_auth_wth_claims";
import firebase from "../backend/firebase_config";
import "./access_token_page.css";
import { useCollectionDataOnce } from "react-firebase-hooks/firestore";
import CopyToClipBoard from 'react-copy-to-clipboard';
import Loader from 'react-loader-spinner';

import {
    Button,
    TextField,
    InputAdornment,
    Tooltip,
    IconButton,
    FilledInput
} from "@material-ui/core";
import AssignmentIcon from '@material-ui/icons/Assignment';
import { useEffect } from "react";
import { useToaster } from "../common/toast";

function doSignIn() {
    const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(googleAuthProvider);
};

function doSignOut() {
    firebase.auth().signOut();
}

function fetchToken(uid) {
    firebase.firestore().collection("accessTokens").where("uid", "==", uid)
        .limit(1);
}

function AccessTokenPane() {
    const auth = useAuth();
    const [accessTokens, loading, error] = useCollectionDataOnce(
        firebase.firestore().collection("accessTokens")
            .where("uid", "==", auth.user.uid)
            .limit(1),
        {
            idField: "docKey"
        }
    );
    const toaster = useToaster();

    const [isRegenerating, setIsRegenerating] = useState(false);
    const [regeneratedTokenOverride, setRegeneratedTokenOverride] = useState(undefined);
    function regenerateToken() {
        setIsRegenerating(true);
        firebase.app().functions("asia-northEast1")
            .httpsCallable("generateAccessToken")()
            .then(result => {
                setIsRegenerating(false);
                setRegeneratedTokenOverride(result.data.token);
            }).catch(err => {
                setIsRegenerating(false);
            });
    }


    const [currentToken, setCurrentToken] = useState("");
    useEffect(() => {
        if (isRegenerating) {
            setCurrentToken("");
            return;
        }
        if (regeneratedTokenOverride) {
            setCurrentToken(regeneratedTokenOverride);
            return;
        }
        if (loading || error || !accessTokens || accessTokens.length === 0) {
            setCurrentToken("");
            return;
        }
        setCurrentToken(accessTokens[0].docKey);
    }, [accessTokens, loading, error, currentToken, isRegenerating, regeneratedTokenOverride]);

    return <div>
        {isRegenerating && <div>
            Generating...
            <Loader type="Oval" color="#888888" height={48} width={48}></Loader>
        </div>}
        {!isRegenerating && <div>
            {currentToken.length > 0 &&
                <div>
                    <p>Here's your access token:</p>
                    <FilledInput
                        value={currentToken}
                        label="Your access token"
                        fullWidth={true}
                        endAdornment={
                            <InputAdornment position="end">
                                <CopyToClipBoard text={currentToken}>
                                    <IconButton
                                        disabled={currentToken === ''}
                                        onClick={() => toaster("Copied to clipboard!")}
                                        size="small"
                                        edge="end"
                                    >
                                        <AssignmentIcon />
                                    </IconButton>
                                </CopyToClipBoard>
                            </InputAdornment>
                        }
                    />
                </div>
            }
            <Button variant="contained" color="primary"
                onClick={regenerateToken}
            >
                {currentToken.length > 0 && "Regenerate access token"}
                {currentToken.length === 0 && "Generate access token"}
            </Button>
        </div>}
    </div>;
}

function AccessTokenPage() {
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
        {
            auth.isSignedIn &&
            <AccessTokenPane />}
    </div>;
}

export default AccessTokenPage;
