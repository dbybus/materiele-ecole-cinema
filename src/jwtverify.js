const JWT = require('jsonwebtoken');

let verifyToken = (token, req, res) => {
  if(token){
    JWT.verify(token, process.env.REACT_APP_AUTH0_SECRET.replace(/\\n/gm, '\n'), { algorithms: ['RS256'] }, (err, payload) =>{
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
    
    JWT.sign(payload, secret, options, (err, token) => {
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