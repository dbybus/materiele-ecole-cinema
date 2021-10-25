import React from 'react';

import LoginButton from './login-button';
import LogoutButton from './logout-button';
import TokenService from '../services/token.service'
import { useAuth0 } from '@auth0/auth0-react';

function AuthenticationButton(){
  const { isAuthenticated, user, getAccessTokenSilently} = useAuth0();
    if(user){
        TokenService.setUser(user);

        getAccessTokenSilently().then(token =>{
            TokenService.setLocalAccessToken(token);
        })
    }
  return isAuthenticated ? <LogoutButton /> : <LoginButton />;
};

export default AuthenticationButton;