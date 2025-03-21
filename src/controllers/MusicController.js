import Music from '../models/Music.js'
import User from '../models/User.js'
import ytdl from '@distube/ytdl-core'
import fs from 'fs'
import cloudinary from '../config/cloudinary.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class MusicController {
  async download(req, res) {
    try {
      const user = await User.findByPk(req.userId)
      const music = Music
      if (req.file) {
        try {
          cloudinary.uploader
            .upload_stream({ resource_type: 'auto' }, async (error, result) => {
              if (error) {
                console.error(error)
                return res.status(500).json({
                  error: 'Failed to upload to Cloudinary',
                  details: error,
                })
              }

              await music
                .create({
                  title: `music_${Math.floor(Math.random() * 1000000)}`,
                  fileUrl: result.secure_url,
                  cloudinaryUrl: result.secure_url,
                  thumbnailUrl:
                    'https://media.istockphoto.com/id/1215540461/pt/vetorial/3d-headphones-on-sound-wave-background-colorful-abstract-visualization-of-digital-sound.jpg?s=612x612&w=0&k=20&c=22_trFnbPHR7OsBHgGa-spwJXedysy4etXcIKerJjsw=',
                })
                .then((newMusic) => newMusic.addUser(user))

              return res.status(200).json({
                fileUrl: result.secure_url,
                cloudinaryUrl: result.secure_url,
                thumbnailUrl:
                  'https://media.istockphoto.com/id/1215540461/pt/vetorial/3d-headphones-on-sound-wave-background-colorful-abstract-visualization-of-digital-sound.jpg?s=612x612&w=0&k=20&c=22_trFnbPHR7OsBHgGa-spwJXedysy4etXcIKerJjsw=',
              })
            })
            .end(req.file.buffer)
          return
        } catch (e) {
          console.error(e)
          return res.status(500).json({ error: 'Erro interno no servidor' })
        }
      }

      if (!req.body.url) {
        throw new Error('The Url is required')
      }
      const tempFilePath = path.resolve(__dirname, '..', 'temp')
      await ytdl(req.body.url, {
        filter: 'audioonly',
        quality: 'highestaudio',
      })
        .pipe(fs.createWriteStream(tempFilePath))
        .on('finish', async () => {
          try {
            const uploadResult = await cloudinary.uploader.upload(
              tempFilePath,
              {
                resource_type: 'auto',
                public_id: `music_${Math.floor(Math.random() * 1000000)}`,
              },
            )
            await fs.promises.unlink(tempFilePath)
            const info = await ytdl.getInfo(req.body.url)
            await music
              .create({
                title: info.videoDetails.title,
                thumbnailUrl: `https://img.youtube.com/vi/${info.videoDetails.videoId}/maxresdefault.jpg`,
                cloudinaryUrl: uploadResult.secure_url,
              })
              .then((newMusic) => newMusic.addUser(user))
            return res.json({
              title: info.videoDetails.title,
              thumbnailUrl: `https://img.youtube.com/vi/${info.videoDetails.videoId}/maxresdefault.jpg`,
              cloudinaryUrl: uploadResult.secure_url,
            })
          } catch (e) {
            console.error(e)
            return res.status(500).json({ error: 'Erro interno no servidor' })
          }
        })
    } catch (e) {
      console.error(e)
      if (e.errors) {
        return res.status(400).json({
          errors: e.errors.map((err) => err.message),
        })
      }

      return res.status(500).json({ error: 'Erro interno no servidor' })
    }
  }

  async index(req, res) {
    try {
      const AllMusic = await Music.findAll({ include: User })
      return res.json(AllMusic)
    } catch (e) {
      console.error(e)
      return res.status(500).json({ error: 'Erro interno no servidor' })
    }
  }

  async delete(req, res) {
    const user = await User.findByPk(req.userId)
    try {
      const { id } = req.body
      const music = await Music.findByPk(id)
      if (!user) {
        return res.status(400).json({ errors: ['Usuário não existe'] })
      }
      if (!music) {
        return res.status(400).json({ errors: ['Música não existe'] })
      }
      await music.removeUser(user)
      return res.json({ message: 'Música deletada com sucesso' })
    } catch (e) {
      console.error(e)
      return res.status(500).json({ error: 'Erro interno no servidor' })
    }
  }

  async syncWithUser(req, res) {
    try {
      const user = await User.findByPk(req.userId)
      const { musicId } = req.body
      const music = await Music.findByPk(musicId)
      if (!music) {
        return res.status(400).json({ errors: ['Música não existe'] })
      }
      await music.addUser(user)
      return res.json(music)
    } catch (e) {
      console.error(e)
      return res.status(500).json({ error: 'Erro interno no servidor' })
    }
  }
}
export default new MusicController()
