import { Model, DataTypes } from 'sequelize'
import bcryptjs from 'bcryptjs'
export default class User extends Model {
  static init(sequelize) {
    super.init(
      {
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            isEmail: {
              msg: 'Email inválido',
            },
          },
        },
        password_hash: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: '',
        },
        password: {
          type: DataTypes.VIRTUAL,
          allowNull: false,
          defaultValue: '',
          validate: {
            len: {
              args: [6, 50],
              msg: 'A senha deve ter entre 6 e 50 caracteres',
            },
          },
        },
      },
      {
        sequelize,
        tableName: 'users',
        timestamps: true,
      },
    )

    this.addHook('beforeSave', async user => {
      user.password_hash = await bcryptjs.hash(user.password, 8)
    })

    return this
  }

  static associate(models) {
    this.belongsToMany(models.Music, { through: 'user_musics' })
  }

  passwordIsValid(password) {
    return bcryptjs.compare(password, this.password_hash)
  }
}
