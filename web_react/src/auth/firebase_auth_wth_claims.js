import { FirebaseAuthConsumer, FirebaseAuthProvider } from "@react-firebase/auth";
import firebase from "firebase/app";
import "firebase/auth";
import { useState, createContext, useContext } from "react";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// isSignedIn is true iff we have a valid user and claims object.
function createAuth(isSignedIn, user, providerId, claims = undefined) {
    if (!claims) {
        isSignedIn = false;
    }
    return {
        isSignedIn,
        user,
        providerId,
        claims
    };
}

export const FirebaseAuthContextProvider = (props) => {
    const [idToken, setIdToken] = useState({});

    return <FirebaseAuthProvider firebase={firebase}>
        <FirebaseAuthConsumer>
            {
                ({ isSignedIn, user, providerId }) => {

                    let auth;
                    if (!isSignedIn || !firebase.auth().currentUser) {
                        auth = createAuth(isSignedIn, user, providerId);
                    } else if (idToken.uid === user.uid && idToken.claims !== undefined) {
                        // We're signed in, and have claims too.
                        auth = createAuth(isSignedIn, user, providerId, idToken.claims);
                    } else {
                        // We're waiting for getIdTokenResult reply
                        auth = createAuth(isSignedIn, user, providerId);
                        firebase.auth().currentUser.getIdTokenResult()
                            .then((idTokenResult) => {
                                if (user.uid === idTokenResult.claims.user_id) {
                                    setIdToken({
                                        uid: user.uid,
                                        claims: idTokenResult.claims,
                                    });
                                } else {
                                    // Should be super rare; the current user has changed
                                    // since we called getIdTokenResult(). Not even sure
                                    // if this is possible.
                                    setIdToken({
                                        uid: user.uid,
                                    })
                                }
                            });
                    }
                    return <AuthContext.Provider value={auth}>
                        {props.children}
                    </AuthContext.Provider>;
                }
            }
        </FirebaseAuthConsumer>
    </FirebaseAuthProvider>;
};
