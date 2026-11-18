import { useState, useEffect } from 'react';
import Badge from "@material-ui/core/Badge";
import { FaBell } from 'react-icons/fa'
import ProfileMenu from './ProfileMenu';
import {Nav, Navbar, Container} from 'react-bootstrap'
import { useAuth0 } from '../auth';
import TokenService from '../services/token.service'
import ReservationDataService from '../services/reservation.service'
import { RESERVATIONS_CHANGED } from './reservation/reservationUtils'

function NavBar(){
  const { user, getAccessTokenSilently} = useAuth0();
  const [name, setName] = useState("");
  const [picture, setPicture] = useState("");
  const [myNonApproved, setMyNonApproved] = useState(0);
  const [nonApproved, setNonApproved] = useState(0);
  const [adminRole, setAdminRole] = useState();
  const [profRole, setProfRole] = useState();

  useEffect(() => {

    if(user){

      setName(user.name);
      setPicture(user.picture);
      setAdminRole(user['https://example-api/role'].find(element => element === 'Admin'));
      setProfRole(user['https://example-api/role'].find(element => element === 'Prof'));
      TokenService.setUser(user);

      const loadCounts = () => getAccessTokenSilently().then(token =>{
          TokenService.setLocalAccessToken(token);

          ReservationDataService.getAll(token).then(response => {
              setNonApproved(response.data.filter(item => !item.isApproved).length)
              setMyNonApproved(response.data.filter(item => !item.isApproved && user.email === item.beneficiaire).length);
          })
          .catch((e) => {
            console.log(e);
          });
      });

      loadCounts();
      // Recount when a page creates / approves / refuses / deletes a reservation
      window.addEventListener(RESERVATIONS_CHANGED, loadCounts);
      return () => window.removeEventListener(RESERVATIONS_CHANGED, loadCounts);
    }

  }, [user]);

  const canValidate = adminRole !== undefined || profRole !== undefined;

  return (
    <Navbar collapseOnSelect expand="lg" bg='light' className="py-2">
      <Container fluid className="page-width">
        <Navbar.Brand href="/Reservation" className="me-2">
          <img className="logo" src="/img/logocinema.jpg" alt="Ecole-Cinema logo" />
        </Navbar.Brand>

        {/* Profile stays visible next to the burger on mobile, moves to the far right on desktop */}
        <div className="d-flex align-items-center ms-auto order-lg-last">
          <ProfileMenu name={name} picture={picture}/>
        </div>

        <Navbar.Toggle aria-controls="responsive-navbar-nav" className="ms-2" />

        <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto ms-lg-4">
                <Nav.Link href="/Reservation">Réservation</Nav.Link>
                <Nav.Link href="/ListMateriele">Matériel</Nav.Link>
                {canValidate && (
                  <Nav.Link href="/ListNotApprovedReservations">Réservation à valider
                    <Badge color="secondary" badgeContent={nonApproved} style={{paddingLeft: 5}}>
                      <FaBell />{" "}
                    </Badge>
                  </Nav.Link>
                )}
                <Nav.Link href="/ListMesReservations" >Mes Réservation
                  <Badge color="secondary" badgeContent={myNonApproved} style={{paddingLeft: 5}}>
                    <FaBell />{" "}
                  </Badge>
                </Nav.Link>
            </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>

  );
};

export default NavBar;
