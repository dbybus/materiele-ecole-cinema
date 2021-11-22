var axios = require("axios").default;
import http from "../http-common";
var request = require("request");


const {verifyToken, signRefreshToken} = require('../../src/jwtverify');

class TokenService {
    getLocalRefreshToken() {
      return signRefreshToken();
    }
  
    getLocalAccessToken() {
      return localStorage.getItem("token");
    }

    async getApiAccessToken() {
      return axios.post(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/oauth/token`, 
        {
          client_id: process.env.REACT_APP_AUTH0_API_CLIENT_ID,
          client_secret: process.env.REACT_APP_AUTH0_API_CLIENT_SECRET,
          audience: `${process.env.REACT_APP_AUTH0_ISSUER}/api/v2/`,
          grant_type: "client_credentials"
        },
        {
          headers: {
          'Content-type': 'application/json',
          'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE',
          'Access-Control-Allow-Origin': '*',
          "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Auth0-Client",
          //"Access-Control-Allow-Credentials": "true"
          }
        }).then(result => {
            // Handle result…
            console.log(result.data);
        }).catch((e) => {
            console.log(e);
        });
    }

    setLocalAccessToken(token) {
        localStorage.setItem("token", token);
    }

    updateLocalAccessToken(token) {
      let user = JSON.parse(localStorage.getItem("user"));
      user.accessToken = token;
      localStorage.setItem("user", JSON.stringify(user));
    }
  
    getUser() {
      return JSON.parse(localStorage.getItem("user"));
    }
  
    setUser(user) {
      console.log(JSON.stringify(user));
      localStorage.setItem("user", JSON.stringify(user));
    }
  
    removeUser() {
      localStorage.removeItem("user");
    }
  }
  
  export default new TokenService();
