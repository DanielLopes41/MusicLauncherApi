import dotenv from 'dotenv'
dotenv.config()
export default {
  dialect: 'postgres',
  url: process.env.DATABASE_URL,
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
