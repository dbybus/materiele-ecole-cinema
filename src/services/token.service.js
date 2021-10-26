const {verifyToken, signRefreshToken} = require('../../src/jwtverify');
class TokenService {
    getLocalRefreshToken() {
      return signRefreshToken();
    }
  
    getLocalAccessToken() {
      return localStorage.getItem("token");
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
