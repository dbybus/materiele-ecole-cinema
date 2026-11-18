import React from 'react';
import LoginButton from './login-button';
import LogoutButton from './logout-button';
import { useAuth0 } from '../auth';
import { Dropdown } from 'react-bootstrap';

function ProfileMenu(props){
  const {name, picture} = props
  const { isAuthenticated } = useAuth0();

  return (
    <Dropdown align="end">
      <Dropdown.Toggle id="dropdown-basic" className="profile-toggle">
        {/* Name only on wide screens (≥ 1200px); below that the avatar is enough and the name is in the menu */}
        <span className="d-none d-xl-inline">{name}</span>
        <img src={picture} alt="User avatar" className="profile-avatar"/>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Header className="d-xl-none">{name}</Dropdown.Header>
        <Dropdown.Item href="/profile">Profile</Dropdown.Item>
        <Dropdown.Item href="/listusers">Utilisateur</Dropdown.Item>
        <Dropdown.Item>{isAuthenticated ? <LogoutButton /> : <LoginButton />}</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
};

export default ProfileMenu;
