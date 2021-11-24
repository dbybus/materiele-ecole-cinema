module.exports = app => {
    const reservation = require("../controllers/reservation.controller.js");
  
    var router = require("express").Router();
  
    // Create a new reservation
    router.post("/create", reservation.create);
  
    // Retrieve all reservations
    router.get("/findAll", reservation.findAll);
    
    router.get("/findOne/:id", reservation.findOne);
    //Update reservation
    router.put("/update/:id", reservation.update)

    router.delete("/delete/:id", reservation.delete)

    app.use('/api/reservation', router);
  };