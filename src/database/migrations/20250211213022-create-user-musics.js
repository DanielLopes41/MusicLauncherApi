'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_musics', {
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        field: 'user_id',
      },
      musicId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'musics', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        field: 'music_id',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_musics')
  },
}
