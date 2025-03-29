'use strict'
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeColumn('musics', 'userId')
  },
}
