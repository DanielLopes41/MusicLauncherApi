'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('musics', 'userId');
  },
};
