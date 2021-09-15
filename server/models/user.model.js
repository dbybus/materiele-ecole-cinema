module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
      name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      firebase_uid: {
        type: Sequelize.STRING
      },
      role: {
        type: Sequelize.STRING
      }
    });

    return User;
};
