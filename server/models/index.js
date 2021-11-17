const dbConfig = require("../db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./user.model.js")(sequelize, Sequelize);
db.materiele = require("./materiele.model.js")(sequelize, Sequelize);
db.reservation = require("./reservation.model.js")(sequelize, Sequelize);
db.materielreservation = require("./materielreservation.model.js")(sequelize, Sequelize);


db.materiele.hasMany( db.materielreservation, {as:"getMateriel",  foreignKey: 'materielId'} );
db.reservation.hasMany(db.materielreservation, { as:"getReservation", foreignKey: 'reservationId', onDelete: 'cascade'});
db.materielreservation.belongsTo(db.materiele, { as:"getMateriel", foreignKey: 'materielId'});
db.materielreservation.belongsTo(db.reservation, {  as:"getReservation", foreignKey: 'reservationId'});

/* db.materiele.belongsToMany(db.reservation, {through: "MaterielReservations", unique: false, foreignKey: {name: "materielId", unique: false}})
db.reservation.belongsToMany(db.materiele, {through: "MaterielReservations", unique: false, foreignKey: {name: "reservationId", unique: false}})  
 */

module.exports = db;