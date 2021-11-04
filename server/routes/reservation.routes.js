module.exports = app => {
    const resevation = require("../controllers/reservation.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/create", resevation.create);
  
    // Retrieve all Tutorials
    router.get("/findAll", resevation.findAll);
 
  
    app.use('/api/reservation', router);
  };