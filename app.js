import user from './src/routes/user'
import express from 'express';
import './src/database'
export class App {
  constructor() {
    this.app = express()
    this.middlewares()
    this.routes()
  }

  middlewares() {
    this.app.use(express.urlencoded({ extended: true }))
    this.app.use(express.json())
  }

  routes() {
    this.app.use('/users', user)
  }
}

export default new App().app
