module.exports = app => {
    const materiele = require("../controllers/materiele.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", materiele.create);
  
    // Retrieve all Tutorials
    router.get("/", materiele.findAll);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", materiele.findOne);
  
    // Update a Tutorial with id
    router.put("/:id", materiele.update);
  
    // Delete a Tutorial with id
    router.delete("/:id", materiele.delete);
  
    // Delete all Tutorials
    router.delete("/", materiele.deleteAll);

    router.post("/upload", materiele.upload);
    router.get("/files", materiele.getListFiles);
    router.get("/files/:name", materiele.download);
  
    app.use('/api/materiele', router);
  };