const db = require("../models");
const Materiele = db.materiele;
const Op = db.Sequelize.Op;
const uploadFile = require("../middlewareUploads");
const fs = require("fs")
const {verifyToken, signRefreshToken} = require('../../src/jwtverify');

const getBearerToken = (header) => {
  const authHeader = header;
  const berearToken = authHeader.split(' ');
  return berearToken[1];
};

const verifyPermissionExists = (req, res) => {
  if (req.payload.permissions.length === 0) {
    res.status(401).send({
      message: "You dont have authorization to view this content"
    });
    return;
  }
};

// Create and Save a new user
exports.create = async (req, res) => {
  if(req.headers['authorization']){
    
    //Verify authorization
    const token = getBearerToken(req.headers['authorization']);
    verifyToken(token, req, res);
    verifyPermissionExists(req,res);

    if(req.payload.permissions[0] === 'write:materiels'){

      if (!req.body.label) {
        res.status(400).send({
          message: "Content can not be empty!"
        });
        return;
      }
      
      // Create a material json object
      const material = {
        label: req.body.label,
        ref: req.body.ref,
        //panne: req.body.panne,
        //externe: req.body.externe,
        categorie: req.body.categorie,
        //sousCateg: req.body.sousCateg,
        Qtotale: req.body.Qtotale,
        tarifLoc: req.body.tarifLoc,
        valRemp: req.body.valRemp,
        dateAchat: req.body.dateAchat,
        //ownerExt: req.body.ownerExt,
        //remarque: req.body.remarque,
        degre: req.body.degre,
        lieu: req.body.lieu,
        url_pic: req.body.url_pic
      };
          
      // Save material in the database
      Materiele.create(material)
        .then(data => {
          res.send(data);
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while creating the Material."
          });
        });
    }
  }
};

// Retrieve all Tutorials from the database.
exports.findAll = (req, res) => {
  console.log("REQUEST HEADER ",req.headers)
  if(req.headers['authorization']){

    const token = getBearerToken(req.headers['authorization']);

    try {
      
      verifyToken(token, req, res);
      
      const name = req.query.name;
      var condition = name ? { name: { [Op.like]: `%${name}%` } } : null;
    
      Materiele.findAll({ where: condition })
        .then(data => {
          res.send(data);
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving materials."
          });
        });

    } catch (error) {
      console.log(error)
    }    
  }else{
    res.status(500).send({
      message:
         "You dont have proper access."
    });
  }
    
};

// Find a single material with an id
exports.findOne = (req, res) => {
 
  if(req.headers['authorization']){
    
    const token = getBearerToken(req.headers['authorization']);
    verifyToken(token, req, res);

    const id = req.params.id;

    Materiele.findByPk(id)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message: "Error retrieving Material with id=" + id
        });
      });
  }
};

// Update a material by the id in the request
exports.update = (req, res) => {
  if(req.headers['authorization']){

    //Verify authorization
    const token = getBearerToken(req.headers['authorization']);
    verifyToken(token, req, res);
    verifyPermissionExists(req,res);

    if(req.payload.permissions[0] === 'write:materiels'){
      const id = req.params.id;

      Materiele.update(req.body, {
        where: { id: id }
      })
        .then(num => {
          if (num == 1) {
            res.send({
              message: "Material was updated successfully."
            });
          } else {
            res.send({
              message: `Cannot update Tutorial with id=${id}. Maybe Tutorial was not found or req.body is empty!`
            });
          }
        })
        .catch(err => {
          res.status(500).send({
            message: "Error updating Material with id=" + id
          });
        });
      }
    }
};

// Delete a Tutorial with the specified id in the request
exports.delete = (req, res) => {
  if(req.headers['authorization']){
    //Verify authorization
    const token = getBearerToken(req.headers['authorization']);
    verifyToken(token, req, res);
    verifyPermissionExists(req,res);

    if(req.payload.permissions[0] === 'write:materiels'){

      const id = req.params.id;

      Materiele.destroy({
        where: { id: id }
      })
        .then(num => {
          if (num == 1) {
            res.send({
              message: "Material was deleted successfully!"
            });
          } else {
            res.send({
              message: `Cannot delete Material with id=${id}. Maybe Tutorial was not found!`
            });
          }
        })
        .catch(err => {
          res.status(500).send({
            message: "Could not delete Material with id=" + id
          });
        });
    }
  }
};

// Delete all Tutorials from the database.
exports.deleteAll = (req, res) => {
  if(req.headers['authorization']){
    
    //Verify authorization
    const token = getBearerToken(req.headers['authorization']);
    verifyToken(token, req, res);
    verifyPermissionExists(req,res);
    
    if(req.payload.permissions[0] === 'write:materiels'){
      
      Materiele.destroy({
            where: {},
            truncate: false
      })
        .then(nums => {
          res.send({ message: `${nums} Material were deleted successfully!` });
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while removing all material."
          });
        });
    }
  }
};


//#region IMAGE handelling

exports.uploadImgMat = async (req, res) => {
  
  if(req.headers['authorization']){
    //Verify authorization
    const token = getBearerToken(req.headers['authorization']);
    verifyToken(token, req, res);
    verifyPermissionExists(req,res);
    
    if(req.payload.permissions[0] === 'write:materiels'){
      
      try {
        await uploadFile(req, res);

        if (req.file == undefined) {
          return res.status(400).send({ message: "Please upload a file!" });
        }

        res.status(200).send({
          message: "Uploaded the file successfully: " + req.file.originalname,
        });
      } catch (err) {
        res.status(500).send({
          message: `Could not upload the file: ${req.file.originalname}. ${err}`,
        });
      }
    }
  }
};

exports.getListFiles = (req, res) => {
  const directoryPath = __basedir + "/public/img/materiels/";

  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      res.status(500).send({
        message: "Unable to scan files!",
      });
    }

    let fileInfos = [];

    files.forEach((file) => {
      fileInfos.push({
        name: file,
        url: baseUrl + file,
      });
    });

    res.status(200).send(fileInfos);
  });
};

exports.download = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/public/img/materiels/";

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
};

//Integrer cette functionalite dans le la export.delete plus tard 
exports.deleteImgMat = (req, res) => {
  console.log(req.body.url_pic)
  if(req.headers['authorization']){
    //Verify authorization
    const token = getBearerToken(req.headers['authorization']);
    verifyToken(token, req, res);
    verifyPermissionExists(req,res); 
    
    if(req.payload.permissions[0] === 'write:materiels'){
      
      try {
        if (req.body == undefined || req.body.url_pic === '') {
          return res.status(400).send({ message: "Please upload a file!" });
        }

        fs.unlink("./public"+req.body.url_pic, (err) => {
          if (err) {
            res.status(500).send({
              message: "Could not delete the file. " + err,
            });
          }  
        });

        res.status(200).send({
          message: "deleteted the file successfully: " + req.body.url_pic,
        });
      } catch (err) {
        res.status(500).send({
          message: `Could not delete the file: ${req.body.url_pic}. ${err}`,
        });
      }
    }
  }
};