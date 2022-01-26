import { useState, useEffect } from 'react';
import Badge from "@material-ui/core/Badge";
import { FaBell } from 'react-icons/fa'
import ProfileMenu from './ProfileMenu';
import {Nav, Navbar, Container} from 'react-bootstrap'
import { useAuth0 } from '@auth0/auth0-react';
import TokenService from '../services/token.service'
import ReservationDataService from '../services/reservation.service'

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
     
      getAccessTokenSilently().then(token =>{
          TokenService.setLocalAccessToken(token);
          
          ReservationDataService.getAll(token).then(response => {
              setNonApproved(response.data.filter(item => !item.isApproved).length)
              setMyNonApproved(response.data.filter(item => !item.isApproved && user.email === item.beneficiaire).length);
          })
          .catch((e) => {
            console.log(e);
          });
      })
      //console.log(localStorage.getItem("nonApprovedReservations"))
    }
    
  }, [user]);

  return (
    <Navbar collapseOnSelect expand="lg" bg='light'>
      <Container>
        <Navbar.Brand href="#home">
        <img className="logo"
            src="/img/logocinema.jpg"
            width='250px'
            float= 'right'
            alt="Ecole-Cinema logo" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav" style={{paddingLeft: 100}}>
            <Nav className="mr-auto">
                <Nav.Link href="/Reservation">Réservation</Nav.Link>
                <Nav.Link href="/ListMateriele">Matériel</Nav.Link>
                <Nav.Link href="/ListNotApprovedReservations" style={{visibility: adminRole !== undefined || profRole !== undefined ? 'visible' : 'hidden'}}>Réservation à valider
                  <Badge color="secondary" badgeContent={nonApproved} style={{paddingLeft: 5}}>
                    <FaBell />{" "}
                  </Badge>
                </Nav.Link>
                <Nav.Link href="/ListMesReservations" >Mes Réservation
                  <Badge color="secondary" badgeContent={myNonApproved} style={{paddingLeft: 5}}>
                    <FaBell />{" "}
                  </Badge>
                </Nav.Link>
            </Nav>
        </Navbar.Collapse>
        <ProfileMenu name={name} picture={picture}/>
      </Container>
    </Navbar>
      
  );
};

export default NavBar;