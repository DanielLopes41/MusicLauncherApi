import { Router } from 'express'
import userController from '../controllers/UserController'

const router = Router()

router.post('/', userController.store)
router.get('/', userController.index)
router.delete('/:id', userController.delete)
router.put('/:id', userController.update)
export default router
