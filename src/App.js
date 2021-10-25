import { BrowserRouter as Router, Switch } from "react-router-dom";
import "./css/Login.css";
import ListMateriele from './components/ListMateriele';
import Agenda from './components/Agenda';
import Loading from './components/loading';
import { useAuth0 } from '@auth0/auth0-react';
import NavBar from './components/nav-bar';
import Profile from "./components/profile"
import ProtectedRoute from "./auth/protected-route";

function App() {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div id="app" className="d-flex flex-column h-100">
      <NavBar />
      <Router>
      <div className="container flex-grow-1">
        <Switch>
          <ProtectedRoute path="/" exact component={ListMateriele} />
          <ProtectedRoute path="/profile" component={Profile} />
          <ProtectedRoute path="/agenda" component={Agenda} />
        </Switch>
      </div>
      </Router>
    </div>
  );
}

export default App;
