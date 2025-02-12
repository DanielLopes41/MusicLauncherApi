import Sequelize from 'sequelize'
import databaseConfig from '../config/database.js'
import User from '../models/User.js'
import Music from '../models/Music.js'
const models = [User, Music]

const connection = new Sequelize(databaseConfig)
models.forEach((model) => model.init(connection))
models.forEach((model) => model.associate && model.associate(connection.models))
