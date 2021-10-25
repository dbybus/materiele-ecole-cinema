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

module.exports = verifyToken;