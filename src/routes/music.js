import { Router } from 'express'
import musicController from '../controllers/MusicController'

const router = Router()

router.post('/', musicController.download)
router.get('/', musicController.index)
router.delete('/', musicController.delete)
router.put('/', musicController.syncWithUser)
export default router
