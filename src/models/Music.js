import {  Model, DataTypes } from "sequelize";

export default class Music extends Model {
  static init(sequelize) {
    super.init(
      {
        title: DataTypes.STRING,
        url:      DataTypes.STRING,
        filePath: DataTypes.STRING
      },
      {
        sequelize,
      }
    );
  }
}
