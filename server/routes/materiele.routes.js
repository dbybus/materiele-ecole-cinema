module.exports = app => {
    const materiele = require("../controllers/materiele.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/create", materiele.create);
  
    // Retrieve all Tutorials
    router.get("/findAll", materiele.findAll);
  
    // Retrieve a single Tutorial with id
    router.get("/findOne/:id", materiele.findOne);
  
    // Update a Tutorial with id
    router.put("/update/:id", materiele.update);
  
    // Delete a Tutorial with id
    router.delete("/delete/:id", materiele.delete);
  
    // Delete all Tutorials
    router.delete("/deleteAll/", materiele.deleteAll);

    router.post("/uploadImgMat", materiele.uploadImgMat);
    router.get("/files", materiele.getListFiles);
    router.get("/files/:name", materiele.download);
    router.post("/deleteImgMat", materiele.deleteImgMat);
  
    app.use('/api/materiele', router);
  };