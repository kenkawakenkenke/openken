import './App.css';
import { BrowserRouter as Router, Route, useParams, Link } from "react-router-dom";
import { FirebaseAuthContextProvider } from "./auth/firebase_auth_wth_claims.js";
import { ToastContextProvider } from "./common/toast.js";

import AccessTokenPage from "./pages/access_token_page.js";
function MainPage() {
  return <div>Hello world</div>
}

function App() {
  return (
    <div className="App">
      <FirebaseAuthContextProvider>
        <ToastContextProvider>
          <Router>
            <Route exact path="/" component={MainPage} />
            <Route exact path="/access_token" component={AccessTokenPage} />
          </Router>
        </ToastContextProvider>
      </FirebaseAuthContextProvider>
    </div>
  );
}

export default App;
