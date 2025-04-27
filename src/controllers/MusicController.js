import Music from '../models/Music.js'
import User from '../models/User.js'
import ytdl from '@distube/ytdl-core'
import fs from 'fs'
import cloudinary from '../config/cloudinary.js'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()
export class MusicController {
  async download(req, res) {
    try {
      const rawCookies = process.env.YOUTUBE_COOKIES

      if (!rawCookies) {
        throw new Error('Cookies do YouTube não encontrados no .env')
      }

      const cookies = JSON.parse(rawCookies)
      const agent = ytdl.createAgent(cookies, {
        headers: {
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        },
      })

      const user = await User.findByPk(req.userId)
      const music = Music
      if (!user) {
        throw new Error('BAD REQUEST')
      }
      if (!req.body.url) {
        throw new Error('The Url is required')
      }
      const tempFilePath = path.resolve(__dirname, '..', 'temp.mp4')
      ytdl(req.body.url, {
        filter: 'audioandvideo',
        quality: 'highest',
        agent,
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
            return res.status(201).json({
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
