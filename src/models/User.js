import { Model, DataTypes } from "sequelize";

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
              msg: "Email inválido",
            },
          },
        },
        password: {
          type: DataTypes.STRING, 
          allowNull: false,
          validate: {
            len: {
              args: [6, 50],
              msg: "A senha deve ter entre 6 e 50 caracteres",
            },
          },
        },
      },
      {
        sequelize,
      }
    );
  }
}
