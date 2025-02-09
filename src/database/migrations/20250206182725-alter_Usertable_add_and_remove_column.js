'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'password_hash', {
              type: Sequelize.STRING,
              allowNull: false,
              defaultValue: '',
            });

    await queryInterface.removeColumn('users', 'password');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'password_hash', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '',
    });

    await queryInterface.removeColumn('users', 'password');
  },
};
