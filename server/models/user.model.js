module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
      name: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      isAdmin: {
        type: Sequelize.BOOLEAN
      }
    });
  
    return User;
  };