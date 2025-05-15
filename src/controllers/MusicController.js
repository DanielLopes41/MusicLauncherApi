import Music from '../models/Music.js'
import User from '../models/User.js'
import axios from 'axios'

export class MusicController {
  async download(req, res) {
    const { url } = req.body

    if (url) {
      const response = await axios.get('https://www.tikwm.com/api/', {
        params: { url },
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      })

      const videoUrl = response?.data?.data?.play

      if (!videoUrl) {
        return res
          .status(500)
          .json({ error: 'Não foi possível obter o vídeo do TikTok' })
      }

      return res.status(200).send({
        fileUrl: '',
        cloudinaryUrl: videoUrl,
        thumbnailUrl:
          'https://media.istockphoto.com/id/1215540461/pt/vetorial/3d-headphones-on-sound-wave-background-colorful-abstract-visualization-of-digital-sound.jpg?s=612x612',
      })
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
