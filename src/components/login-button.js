import React, { useEffect } from "react";
import { useAuth0 } from '@auth0/auth0-react';
import TokenService from '../services/token.service'

function LoginButton(){
    const { loginWithRedirect, user} = useAuth0();

    useEffect(() => {
        console.log(user)
        if (user){
            TokenService.setUser(user);
        }
    }, [user]);
  

  return (
    <button
      className="btn btn-primary btn-block"
      onClick={() => loginWithRedirect()}
    >
      Log In
    </button>
  );
};

export default LoginButton;