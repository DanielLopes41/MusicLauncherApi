import { Router } from 'express'
import userController from '../controllers/UserController.js'
import loginRequired from '../middlewares/loginRequired.js'

const router = Router()

router.post('/', userController.store)
router.get('/', loginRequired, userController.show)
router.delete('/', loginRequired, userController.delete)
router.put('/', loginRequired, userController.update)
export default router
