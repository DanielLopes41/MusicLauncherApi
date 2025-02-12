require('dotenv').config()
module.exports = {
  dialect: 'postgres',
  port: process.env.DATABASE_PORT,
  username: process.env.DATABASE_USERNAME,
  host: process.env.DATABASE_HOST,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
  dialectOptions: {
    timezone: 'America/Sao_Paulo',
  },
  timezone: 'America/Sao_Paulo',
}
