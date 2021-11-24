import React, { useState, useEffect} from 'react';
import LoginButton from './login-button';
import LogoutButton from './logout-button';
import { useAuth0 } from '@auth0/auth0-react';
import { Dropdown } from 'react-bootstrap';

function ProfileMenu(props){
  const {name, picture} = props
  const { isAuthenticated } = useAuth0();

  return ( 
    <Dropdown>
      <Dropdown.Toggle id="dropdown-basic" style={{backgroundColor: '#F8F8F8', color: 'black', borderColor:'#F8F8F8'}}>
        <span>{name}</span>
        <img src={picture} alt="User avatar" style={{width: 50, paddingLeft: 10 }}/>
      </Dropdown.Toggle>
    
      <Dropdown.Menu>
        <Dropdown.Item href="/profile">Profile</Dropdown.Item>
        <Dropdown.Item href="/listusers">Utilisateur</Dropdown.Item>
        <Dropdown.Item>{isAuthenticated ? <LogoutButton /> : <LoginButton />}</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
};

export default ProfileMenu;