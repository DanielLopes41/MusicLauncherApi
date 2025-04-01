import { Router } from 'express'
import musicController from '../controllers/MusicController.js'
import loginRequired from '../middlewares/loginRequired.js'

const router = Router()

router.post('/', loginRequired, musicController.download)
router.get('/', musicController.index)
router.delete('/', loginRequired, musicController.delete)
router.put('/', loginRequired, musicController.syncWithUser)
export default router
