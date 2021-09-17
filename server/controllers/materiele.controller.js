const db = require("../models");
const Materiele = db.materiele;
const Op = db.Sequelize.Op;

// Create and Save a new user
exports.create = (req, res) => {
    if (!req.body.label) {
        res.status(400).send({
          message: "Content can not be empty!"
        });
        return;
      }
    
      // Create a User
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

      };
      
      // Save User in the database
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
};

// Retrieve all Tutorials from the database.
exports.findAll = (req, res) => {
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
};

// Find a single Tutorial with an id
exports.findOne = (req, res) => {
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
};

// Update a Tutorial by the id in the request
exports.update = (req, res) => {
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
};

// Delete a Tutorial with the specified id in the request
exports.delete = (req, res) => {
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
};

// Delete all Tutorials from the database.
exports.deleteAll = (req, res) => {
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
};