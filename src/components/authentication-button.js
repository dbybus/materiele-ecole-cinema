import React, {useRef, useState, useEffect} from 'react';
import LoginButton from './login-button';
import LogoutButton from './logout-button';
import TokenService from '../services/token.service'
import { useAuth0 } from '@auth0/auth0-react';
import "../css/Profile.css"

function AuthenticationButton(){

  const dropdownRef = useRef(null);
  const { isAuthenticated, user, getAccessTokenSilently} = useAuth0();
  const [isActive, setIsActive] = useState(false);
  const [name, setName] = useState("");
  const [picture, setPicture] = useState("");
  const onClick = () => setIsActive(!isActive);

  useEffect(() => {

    if(user){

      setName(user.name);
      setPicture(user.picture);

      TokenService.setUser(user);
  
      getAccessTokenSilently().then(token =>{
          TokenService.setLocalAccessToken(token);
      })
    }
    
  }, [user]);

  useEffect(()=>{
    const pageClickEvent = (e) => {
      // If the active element exists and is clicked outside of
      if (dropdownRef.current !== null && !dropdownRef.current.contains(e.target)) {
        setIsActive(!isActive);
      }
    };

    if (isActive) {
      window.addEventListener('click', pageClickEvent);
    }
  
    return () => {
      window.removeEventListener('click', pageClickEvent);
    }
  },[isActive])

  return (
    <div className="menu-container">
        <button onClick={onClick} className="menu-trigger">
          <span>{name}</span>
          <img src={picture} alt="User avatar" />
        </button>
        <nav ref={dropdownRef} className={`menu ${isActive ? 'active' : 'inactive'}`}>
          <ul>
            <li><a href="/profile">Profile</a></li>
            <li><a href="/listusers">Utilisateur</a></li>
            <li>{isAuthenticated ? <LogoutButton /> : <LoginButton />}</li>
          </ul>
        </nav>
      </div>
    )
};

export default AuthenticationButton;