import Music from '../models/Music'
import ytdl from '@distube/ytdl-core'
import fs from 'fs'
import cloudinary from '../config/cloudinary'
import path from 'path'
export class MusicController {
  async download(req, res) {
    try {
      const { userId } = req.body
      const tempFilePath = path.resolve(__dirname, 'temp-audio.mp3')
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
            await Music.create({
              title: info.videoDetails.title,
              thumbnailUrl: `https://img.youtube.com/vi/${info.videoDetails.videoId}/sddefault.jpg`,
              cloudinaryUrl: uploadResult.secure_url,
              userId,
            })
            return res.json({
              title: info.videoDetails.title,
              thumbnailUrl: `https://img.youtube.com/vi/${info.videoDetails.videoId}/sddefault.jpg`,
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
      const AllMusic = await Music.findAll({})
      return res.json(AllMusic)
    } catch (e) {
      console.error(e)
      return res.status(500).json({ error: 'Erro interno no servidor' })
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.body
      const music = await Music.findByPk(id)

      if (!music) {
        return res.status(400).json({ errors: ['Música não existe'] })
      }

      await music.destroy()
      return res.json({ message: 'Música deletada com sucesso' })
    } catch (e) {
      console.error(e)
      return res.status(500).json({ error: 'Erro interno no servidor' })
    }
  }

  async syncWithUser(req, res) {
    try {
      const { id: userId, musicId } = req.body
      const music = await Music.findByPk(musicId)

      if (!music) {
        return res.status(400).json({ errors: ['Música não existe'] })
      }

      await music.update({ userId })
      return res.json(music)
    } catch (e) {
      console.error(e)
      return res.status(500).json({ error: 'Erro interno no servidor' })
    }
  }
}
export default new MusicController()
