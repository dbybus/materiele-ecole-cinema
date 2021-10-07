module.exports = (sequelize, Sequelize) => {
    const Materiele = sequelize.define("materieles", {
      label: {
        type: Sequelize.STRING
      },
      ref: {
        type: Sequelize.STRING
      },
      panne: {
        type: Sequelize.INTEGER
      },
      externe: {
        type: Sequelize.BOOLEAN
      },
      categorie: {
        type: Sequelize.STRING
      },
      sousCateg: {
        type: Sequelize.INTEGER
      },
      //quantite
      Qtotale: {
        type: Sequelize.INTEGER
      },
      tarifLoc: {
        type: Sequelize.FLOAT
      },
      valRemp: {
        type: Sequelize.FLOAT
      },
      dateAchet: {
        type: Sequelize.DATE
      },
      ownerExt: {
        type: Sequelize.STRING
      },
      remarque: {
        type: Sequelize.TEXT
      },
      degre: {
        type: Sequelize.INTEGER
      },
      lieu: {
        type: Sequelize.STRING
      },
      url_pic: {
        type: Sequelize.STRING
      }
    });

    return Materiele;
};