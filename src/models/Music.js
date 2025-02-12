import { Model, DataTypes } from 'sequelize'

export default class Music extends Model {
  static init(sequelize) {
    super.init(
      {
        title: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isString(value) {
              if (typeof value !== 'string') {
                throw new Error('Title must be a string')
              }
            },
          },
        },
        thumbnailUrl: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: {
            isString(value) {
              if (typeof value !== 'string') {
                throw new Error('Thumbnail URL must be a string')
              }
            },
          },
          field: 'thumbnailUrl',
        },
        cloudinaryUrl: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isString(value) {
              if (typeof value !== 'string') {
                throw new Error('Cloudinary URL must be a string')
              }
            },
          },
          field: 'cloudinaryUrl',
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
          field: 'userId',
        },
      },
      {
        sequelize,
        tableName: 'musics',
        timestamps: true,
      },
    )
    return this
  }

  static associate(models) {
    this.belongsToMany(models.User, { through: 'user_musics' })
  }
}
