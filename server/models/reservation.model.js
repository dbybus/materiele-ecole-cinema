module.exports = (sequelize, Sequelize) => {
    const Reservation = sequelize.define("reservation", {
        titre: {
            type: Sequelize.STRING
        },
        lieu: {
            type: Sequelize.STRING
        },
        date_start: {
            type: Sequelize.DATE
        },
        date_end: {
            type: Sequelize.DATE
        },
        createur: {
            type: Sequelize.STRING
        },
        beneficiaire: {
            type: Sequelize.STRING
        },
        materiel: {
            type: Sequelize.TEXT
        },
        confirm: {
            type: Sequelize.STRING
        },
        isApproved: {
            type: Sequelize.BOOLEAN
        }
    });

    return Reservation;
};