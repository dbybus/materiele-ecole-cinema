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
        createurEmail: {
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