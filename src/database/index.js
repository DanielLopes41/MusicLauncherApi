import Sequelize from 'sequelize'
import databaseConfig from '../config/database'
import User from '../models/User'
import Music from '../models/Music'
const models = [User, Music]

const connection = new Sequelize(databaseConfig)
models.forEach((model) => model.init(connection))
models.forEach((model) => model.associate && model.associate(connection.models))
