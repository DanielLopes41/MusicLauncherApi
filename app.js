import user from './src/routes/user.js'
import token from './src/routes/token.js'
import music from './src/routes/music.js'
import express from 'express'
import cors from 'cors'
import './src/database/index.js'
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
