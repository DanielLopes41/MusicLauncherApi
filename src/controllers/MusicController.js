import Music from '../models/Music.js'
import User from '../models/User.js'
import { getVideoMeta } from 'tiktok-scraper-ts'
import axios from 'axios'
import cloudinary from '../config/cloudinary.js'
export class MusicController {
  async download(req, res) {
    try {
      const rawUrl = req.body.url
      const cleanedUrl = rawUrl.replace(/\?.*$/, '')
      const user = await User.findByPk(req.userId)
      if (!user) {
        return res.status(401).json({})
      }
      if (cleanedUrl) {
        const response = await axios.get('https://www.tikwm.com/api/', {
          params: { url: cleanedUrl },
        })
        const videoUrl = response?.data?.data?.play

        if (!videoUrl) {
          return res
            .status(500)
            .json({ error: 'Não foi possível obter o vídeo do TikTok' })
        }

        const videoMeta = await getVideoMeta(cleanedUrl)
        const newMusic = await Music.create({
          title:
            videoMeta.text || `music_${Math.floor(Math.random() * 1000000)}`,
          fileUrl: videoUrl,
          cloudinaryUrl: videoUrl,
          thumbnailUrl:
            videoMeta.covers.default ||
            'https://media.istockphoto.com/id/1215540461/pt/vetorial/3d-headphones-on-sound-wave-background-colorful-abstract-visualization-of-digital-sound.jpg?s=612x612&w=0&k=20&c=22_trFnbPHR7OsBHgGa-spwJXedysy4etXcIKerJjsw=',
        })
        await newMusic.addUser(user)
        return res.status(200).send({
          fileUrl: videoUrl,
          cloudinaryUrl: videoUrl,
          thumbnailUrl:
            'https://media.istockphoto.com/id/1215540461/pt/vetorial/3d-headphones-on-sound-wave-background-colorful-abstract-visualization-of-digital-sound.jpg?s=612x612',
        })
      } else if (req.file) {
        cloudinary.uploader
          .upload_stream({ resource_type: 'auto' }, async (error, result) => {
            if (error) {
              console.error(error)
              return res.status(500).json({
                error: 'Falha ao enviar para o Cloudinary',
                details: error,
              })
            }

            const newMusic = await Music.create({
              title: `music_${Math.floor(Math.random() * 1000000)}`,
              fileUrl: result.secure_url,
              cloudinaryUrl: result.secure_url,
              thumbnailUrl:
                'https://media.istockphoto.com/id/1215540461/pt/vetorial/3d-headphones-on-sound-wave-background-colorful-abstract-visualization-of-digital-sound.jpg?s=612x612',
            })

            await newMusic.addUser(user)

            return res.status(200).json({
              fileUrl: result.secure_url,
              cloudinaryUrl: result.secure_url,
              thumbnailUrl:
                'https://media.istockphoto.com/id/1215540461/pt/vetorial/3d-headphones-on-sound-wave-background-colorful-abstract-visualization-of-digital-sound.jpg?s=612x612',
            })
          })
          .end(req.file.buffer)

        return
      }

      return res.status(400).json({ error: 'URL ou arquivo não fornecido' })
    } catch (e) {
      console.error(
        '[ERRO AO FAZER DOWNLOAD]:',
        e.response?.data || e.message || e,
      )
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
      return res.status(500).json({
        error: 'Erro interno no servidor',
        message: e.message,
        details: e.response?.data || null,
      })
    }
  }
}
export default new MusicController()
