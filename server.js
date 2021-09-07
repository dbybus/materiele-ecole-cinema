const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

var corsOptions = {
  origin: "http://localhost:3000"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

const db = require("./server/models");
db.sequelize.sync();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/create", (req, res)=> {
    console.log(req.body.name);
    const name = req.body.name;
    const password = req.body.password;
    const email = req.body.email;
    const isAdmin = req.body.isAdmin;

    db.query("INSERT INTO users (name, password, email, isAdmin) VALUES (?, ?, ?, ?)"), [name, password, email, isAdmin], (err, result) => {
        if(err){
            console.log(err);
        }else{
            res.send("Values Inserted");
        }
    }
});

require("./server/routes/user.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});



