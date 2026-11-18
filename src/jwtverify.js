// Loaded lazily: jsonwebtoken@8 (via buffer-equal-constant-time) crashes at load time on
// Node >= 25 (SlowBuffer removed), and it isn't needed when auth is disabled.
const getJWT = () => require('jsonwebtoken');

let verifyToken = (token, req, res) => {
  // Local dev without Auth0: grant full permissions, skip JWT verification
  if (process.env.REACT_APP_AUTH_DISABLED === 'true') {
    req.payload = { permissions: ['write:materiels'] };
    return;
  }
  if(token){
    getJWT().verify(token, process.env.REACT_APP_AUTH0_SECRET.replace(/\\n/gm, '\n'), { algorithms: ['RS256'] }, (err, payload) =>{
      if(err){
        isValid = false;
        res.status(401).send({
          message:
            "Token is not valid."
        });
      }

      req.payload = payload;
    })
  }
  else {
    return res.json({
      success: false,
      message: 'Token not provided'
    });
  }
};

let  signRefreshToken = () => {
  return new Promise((resolve, reject) => {
    const payload = {}
    const secret = process.env.REACT_APP_AUTH0_REFRESH_SECRET

    const options = {
      expiresIn: '1y',
      issuer: process.env.REACT_APP_AUTH0_ISSUER,
      audience: process.env.REACT_APP_AUTH0_AUDIENCE,
    }
    
    getJWT().sign(payload, secret, options, (err, token) => {
      if (err) {
        console.log(err.message)
        reject(err)
       
      }
      console.log("Refresh TOKEN ", token)
      resolve(token)
    })
  })
}

module.exports = {
  verifyToken,
  signRefreshToken
};