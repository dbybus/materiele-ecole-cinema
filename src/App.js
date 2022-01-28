import { BrowserRouter as Router, Switch } from "react-router-dom";
import ListMateriele from './views/ListMateriele';
import AddMateriele from './views/AddMateriele';
import Reservation from './views/Reservation';
import Loading from './components/loading';
import { useAuth0 } from '@auth0/auth0-react';
import NavBar from './components/NavBar';
import Profile from "./views/Profile"
import ListUsers from "./views/ListUsers"
import ProtectedRoute from "./auth/protected-route";
import AddReservation from "./views/AddReservation";
import ListMaterieleReservation from './views/ListMaterieleReservation';
import ListNotApprovedReservations from './views/ListNotApprovedReservations';
import ListMesReservations from './views/ListMesReservations';
import Footer from "./components/Footer";

function App() {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div id="app" className="d-flex flex-column h-100">
      <NavBar />
      <Router>
      <div className="container my-4">
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
          <ProtectedRoute path="/ListMesReservations" component={ListMesReservations} />
        </Switch>
      </div>
      </Router>
      <Footer />
    </div>
  );
}

export default App;
