const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const https = require("https");

dotenv.config();

const app = express();
global.__basedir = __dirname;

var corsOptions = {
  origin: false,
  //origin: "http://localhost:3000"
};

app.use(cors());
/* app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
}); */
// parse requests of content-type - application/json
app.use(bodyParser.json());
/* app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorisation'
  );

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
}) */

const db = require("./server/models");
db.sequelize.sync();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

require("./server/routes/user.routes")(app);
require("./server/routes/materiele.routes")(app);

const privateKey = fs.readFileSync("./.cert/key.pem", "utf8");
const certificate = fs.readFileSync("./.cert/cert.pem", "utf8");
const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);
// set port, listen for requests
const PORT = process.env.PORT || 3001;

httpsServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});



