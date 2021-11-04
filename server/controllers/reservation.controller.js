const db = require("../models");
const Reservation = db.reservation;
const Op = db.Sequelize.Op;
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

// Create and Save a new reservation
exports.create = async (req, res) => {
  if(req.headers['authorization']){
    
    //Verify authorization
    const token = getBearerToken(req.headers['authorization']);
    verifyToken(token, req, res);
    verifyPermissionExists(req,res);

    if(req.payload.permissions[0] === 'write:materiels'){

      if (!req.body.titre) {
        res.status(400).send({
          message: "Content can not be empty!"
        });
        return;
      }

      const materiel = JSON.stringify(req.body.materiel);
      
      // Create a reservation json object
      const reservation = {
        titre: req.body.titre,
        lieu: req.body.lieu,
        date_start: req.body.date_start,
        date_end: req.body.date_end,
        createur: req.body.createur,
        beneficiaire: req.body.beneficiaire,
        materiel: materiel,
      };
          
      // Save reservation in the database
      Reservation.create(reservation)
        .then(data => {
          res.send(data);
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while creating the Reservation."
          });
        });
    }
  }
};

// Retrieve all Reservations from the database.
exports.findAll = (req, res) => {

  if(req.headers['authorization']){

    const token = getBearerToken(req.headers['authorization']);

    try {
      
      verifyToken(token, req, res);
      
      const name = req.query.name;
      var condition = name ? { name: { [Op.like]: `%${name}%` } } : null;
    
      Reservation.findAll({ where: condition })
        .then(data => {
          res.send(data);
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving reservations."
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