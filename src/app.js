import user from './routes/user.js'
import token from './routes/token.js'
import music from './routes/music.js'
import express from 'express'
import cors from 'cors'
import './database/index.js'
export class App {
  constructor() {
    this.app = express()
    this.middlewares()
    this.routes()
  }

  middlewares() {
    this.app.use(cors())
    this.app.options('*', cors())
    this.app.use(express.urlencoded({ extended: true }))
    this.app.use(express.json())
  }

  routes() {
    this.app.use('/users', user)
    this.app.use('/music', music)
    this.app.use('/tokens', token)
  }
}

export default new App().app
