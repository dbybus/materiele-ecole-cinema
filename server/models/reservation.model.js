module.exports = (sequelize, Sequelize) => {
    const Reservation = sequelize.define("reservation", {
        titre: {
            type: Sequelize.STRING
        },
        lieu: {
            type: Sequelize.STRING
        },
        date_start: {
            type: Sequelize.DATEONLY
        },
        date_end: {
            type: Sequelize.DATEONLY
        },
        createur: {
            type: Sequelize.STRING
        },
        beneficiaire: {
            type: Sequelize.STRING
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