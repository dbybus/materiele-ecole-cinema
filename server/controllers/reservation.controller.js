const db = require("../models");
const Reservation = db.reservation;
const Materiele = db.materiele;
const MaterielReservation = db.materielreservation;
const {verifyToken, signRefreshToken} = require('../../src/jwtverify');

const getBearerToken = (header) => {
  const authHeader = header;
  const berearToken = authHeader.split(' ');
  return berearToken[1];
};

const verifyPermissionExists = (req, res) => {
  if (req.payload.permissions.length === 0) {
    const writePermission = req.payload.permissions.find('write:materiels');
    if(writePermission === undefined){
      res.status(401).send({
        message: "You dont have authorization to view this content"
      });
      return;
    }
  }
};

// Create and Save a new reservation
exports.create = async (req, res) => {
  if(req.headers['authorization']){
    
    //Verify authorization
    const token = getBearerToken(req.headers['authorization']);
    verifyToken(token, req, res);
    verifyPermissionExists(req,res);

    if (!req.body.titre) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
      return;
    }

    // Create a reservation json object
    const reservation = {
      titre: req.body.titre,
      lieu: req.body.lieu,
      date_start: req.body.date_start,
      date_end: req.body.date_end,
      createur: req.body.createur,
      createurEmail: req.body.createurEmail,
      beneficiaire: req.body.beneficiaire,
      isApproved: req.body.isApproved
    };
        
    // Save reservation in the database
    Reservation.create(reservation)
      .then(data => {

        req.body.materiel.forEach(element => {
          //add many to many relation materiel to reservation
          addMaterial(data.id, element)
        });

        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Reservation."
        });
      });
  }
};

function addMaterial(reservationId, materiel){
  return Reservation.findByPk(reservationId)
    .then((reservation) => {
      if (!reservation) {
        console.log("Reservation not found!");
        return null;
      }

      return Materiele.findByPk(materiel.id).then((materielDb) => {
        if (!materielDb) {
          console.log("Materiel not found!");
          return null;
        }

        const reservationTemp = {
          reservationId: reservation.id,
          materielId: materiel.id,
          quantite: materiel.quantite
        };

        MaterielReservation.create(reservationTemp).then(() => {
          console.log(`>> added Material id=${materielDb.id} to Reservation id=${reservation.id}`);
        }).catch(error => {
          console.log(error)
        });

        return reservation;
      });
    })
    .catch((err) => {
      console.log(">> Error while adding Materiel to Reservation: ", err);
    });
};

// Update a reservation by the id in the request
exports.update = (req, res) => {

  if(req.headers['authorization']){

    //Verify authorization
    const token = getBearerToken(req.headers['authorization']);
    verifyToken(token, req, res);
    verifyPermissionExists(req,res);
    const writeAccess = req.payload.permissions.find(item => item === 'write:materiels');
  
    if(writeAccess !== undefined){
      const id = req.params.id;
      
      const reservation = {
        titre: req.body.titre,
        lieu: req.body.lieu,
        date_start: req.body.date_start,
        date_end: req.body.date_end,
        createur: req.body.createur,
        createurEmail: req.body.createurEmail,
        beneficiaire: req.body.beneficiaire,
        isApproved: req.body.isApproved
      };
      
      Reservation.update(reservation, {
        where: { id: id }
      })
        .then(num => {
          if (num == 1) {
            res.send({
              message: "Reservation was updated successfully."
            });
          } else {
            res.send({
              message: `Cannot update Reservation with id=${id}. Maybe Tutorial was not found or req.body is empty!`
            });
          }
        })
        .catch(err => {
          res.status(500).send({
            message: "Error updating Reservation with id=" + id
          });
        });

        req.body.materiel.forEach(element => {
          if(element.quantite !== 0){
            updateMaterial(id, element);
          }  
        });
    }
  }
};

function updateMaterial(reservationId, materiel){
  MaterielReservation.destroy({
    where: { reservationId: reservationId }
  })
    .then(() => {      
      try {       
        addMaterial(reservationId, materiel);
        console.log("Material in reservation was updated succesfully");
      } catch (error) {
        console.log(`Error updating Reservation with id=${reservationId}, materielId=${materiel.id} with error=${error}.`);
      }
    })
    .catch(err => {
      console.log(`Error updating Reservation with id=${reservationId} with error=${err}.`);
    });

};

// Retrieve all Reservations from the database.
exports.findAll = (req, res) => {

  if(req.headers['authorization']){

    const token = getBearerToken(req.headers['authorization']);

    try {
      
      verifyToken(token, req, res);
    
      Reservation.findAll( 
      {
        include: [{model: MaterielReservation, as:"getReservation", attributes: ['id', 'quantite'], 
        include: [{model: Materiele, as:"getMateriel", attributes: ['id','ref','label', 'Qtotale', 'tarifLoc']}]}],
      })
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

exports.findOne = (req, res) => {
 
  if(req.headers['authorization']){
    
    const token = getBearerToken(req.headers['authorization']);
    verifyToken(token, req, res);

    const id = req.params.id;

    Reservation.findByPk(id)
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



// Delete a reservation with the specified id in the request
exports.delete = (req, res) => {
  if(req.headers['authorization']){
    //Verify authorization
    const token = getBearerToken(req.headers['authorization']);
    verifyToken(token, req, res);
    verifyPermissionExists(req,res);
    const writeAccess = req.payload.permissions.find(item => item === 'write:materiels');
  
    if(writeAccess !== undefined){

      const id = req.params.id;

      Reservation.destroy({
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

// Delete all reservations from the database.
exports.deleteAll = (req, res) => {
  if(req.headers['authorization']){
    
    //Verify authorization
    const token = getBearerToken(req.headers['authorization']);
    verifyToken(token, req, res);
    verifyPermissionExists(req,res);
    
    const writeAccess = req.payload.permissions.find(item => item === 'write:materiels');
  
    if(writeAccess !== undefined){
      
      Reservation.destroy({
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
