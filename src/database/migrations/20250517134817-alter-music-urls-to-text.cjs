'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('musics', 'cloudinaryUrl', {
      type: Sequelize.TEXT,
      allowNull: false,
    })

    await queryInterface.changeColumn('musics', 'thumbnailUrl', {
      type: Sequelize.TEXT,
      allowNull: true,
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('musics', 'cloudinaryUrl', {
      type: Sequelize.STRING,
      allowNull: false,
    })

    await queryInterface.changeColumn('musics', 'thumbnailUrl', {
      type: Sequelize.STRING,
      allowNull: true,
    })
  },
}
