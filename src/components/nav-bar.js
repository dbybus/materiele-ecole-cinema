import React from 'react';
import MainNav from './NavBar';
import AuthNav from './auth-nav';

function NavBar(){
  return (

      <nav className="navbar navbar-expand-md navbar-light bg-light">
        <div className="container">
          <div className="navbar-brand logo" />
          <MainNav />
          <AuthNav />
        </div>
      </nav>
  );
};

export default NavBar;