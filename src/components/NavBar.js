import React from 'react'
import {Nav, Navbar, NavDropdown, Container} from 'react-bootstrap'

const NavBar = () => {
    return (
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
            <Container>
                <Navbar.Brand href="#home">Materiele Ecole Cinema</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="/Dashboard">Dashboard</Nav.Link>
                        <Nav.Link href="/ListMateriele">Materiels</Nav.Link>
                        <Nav.Link href="/Agenda">Agenda</Nav.Link>
                        <Nav.Link href="/profile">Profile</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default NavBar
