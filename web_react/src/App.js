import './App.css';
import { BrowserRouter as Router, Route, useParams } from "react-router-dom";
import { FirebaseAuthContextProvider } from "./auth/firebase_auth_wth_claims.js";
import { ToastContextProvider } from "./common/toast.js";

import AccessTokenPage from "./pages/access_token_page.js";
import MainPage from "./pages/main_page.js";

// This is Ken's uid. This is special because it's the default user
// that shows when opening the home page.
const DEFAULT_KEN_UID = "lwwdKIncbFfZXyHcxXEtqueDcme2";

function MainPageRouter() {
  const { uid } = useParams();
  return <MainPage uid={uid || DEFAULT_KEN_UID} />;
}

function App() {
  return (
    <div className="App">
      <FirebaseAuthContextProvider>
        <ToastContextProvider>
          <Router>
            <Route exact path="/" component={MainPageRouter} />
            <Route exact path="/user/:uid" component={MainPageRouter} />
            <Route exact path="/access_token" component={AccessTokenPage} />
          </Router>
        </ToastContextProvider>
      </FirebaseAuthContextProvider>
    </div>
  );
}

export default App;
