import { Router } from 'express'
import tokenController from '../controllers/TokenController.js'

const router = Router()

router.post('/', tokenController.store)
export default router
