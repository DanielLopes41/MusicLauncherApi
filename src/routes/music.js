import { Router } from 'express'
import multer from 'multer'
import musicController from '../controllers/MusicController.js'
import multerConfig from '../config/multer.js'
import loginRequired from '../middlewares/loginRequired.js'

const upload = multer(multerConfig)

const router = Router()

router.post(
  '/',
  loginRequired,
  upload.single('Music'),
  musicController.download,
)
router.get('/', musicController.index)
router.delete('/', loginRequired, musicController.delete)
router.put('/', loginRequired, musicController.syncWithUser)
export default router
