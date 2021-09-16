module.exports = (sequelize, Sequelize) => {
    const Materiele = sequelize.define("materiele", {
      name: {
        type: Sequelize.STRING
      },
      reference: {
        type: Sequelize.STRING
      },
      image: {
        type: Sequelize.BLOB
      },
      quantite: {
        type: Sequelize.INTEGER
      },
      categorie: {
        type: Sequelize.STRING
      },
      tarif: {
        type: Sequelize.INTEGER
      },
      valeur: {
        type: Sequelize.INTEGER
      },
      lieu: {
        type: Sequelize.STRING
      },
      faculte: {
        type: Sequelize.STRING
      },
      achete: {
        type: Sequelize.DATE
      },
      reserve: {
        type: Sequelize.BOOLEAN
      },
    });

    return Materiele;
};