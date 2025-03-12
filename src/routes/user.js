import { Router } from 'express'
import userController from '../controllers/UserController.js'
import loginRequired from '../middlewares/loginRequired.js'

const router = Router()

router.post('/', userController.store)
router.get('/', loginRequired, userController.show)
export default router
