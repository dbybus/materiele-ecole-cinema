module.exports = (sequelize, Sequelize) => {
    const MaterielReservation = sequelize.define("materielreservations", {
        reservationId: {
            type: Sequelize.INTEGER
        },
        materielId: {
            type: Sequelize.INTEGER
        },
        quantite: {
            type: Sequelize.INTEGER
        }
    }
    );

    return MaterielReservation;
};