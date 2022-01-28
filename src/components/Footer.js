import React from 'react'
import {Nav, Navbar, Container} from 'react-bootstrap';

export default function Footer() {
    return (
        <div className="footer-copyright text-center py-3 my-10 bg-light position-static">
            <Container expand="lg" bg='light'>
                <div><a href='/files/Reglement materiel GE+LA  2016_12.pdf' target='_blank' rel='noopener noreferrer'>Règlement du Matériel &gt;&gt;</a></div>
                &copy; {new Date().getFullYear()} Copyright: <a href="https://www.educasuisse.ch"> Educasuisse </a>
                <div>Auteur: Dmitri Baibus</div>
            </Container>
        </div>
    )
}
