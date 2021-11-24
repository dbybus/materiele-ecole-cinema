import { BrowserRouter as Router, Switch } from "react-router-dom";
import ListMateriele from './components/ListMateriele';
import AddMateriele from './components/AddMateriele';
import Reservation from './components/Reservation';
import Loading from './components/loading';
import { useAuth0 } from '@auth0/auth0-react';
import NavBar from './components/NavBar';
import Profile from "./components/profile"
import ListUsers from "./components/ListUsers"
import ProtectedRoute from "./auth/protected-route";
import AddReservation from "./components/AddReservation";
import ListMaterieleReservation from './components/ListMaterieleReservation';
import ListNotApprovedReservations from './components/ListNotApprovedReservations';

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
          <ProtectedRoute path="/" exact component={Reservation} />
          <ProtectedRoute path="/Reservation" exact component={Reservation} />
          <ProtectedRoute path="/profile" component={Profile} />
          <ProtectedRoute path="/ListMateriele" component={ListMateriele} />
          <ProtectedRoute path="/listusers" component={ListUsers} />
          <ProtectedRoute path="/AddMateriele" component={AddMateriele} />
          <ProtectedRoute path="/AddReservation" component={AddReservation} />
          <ProtectedRoute path="/ListMaterieleReservation" component={ListMaterieleReservation} />
          <ProtectedRoute path="/ListNotApprovedReservations" component={ListNotApprovedReservations} />
        </Switch>
      </div>
      </Router>
    </div>
  );
}

export default App;
