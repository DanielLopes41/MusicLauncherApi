import Music from '../models/Music.js'
import User from '../models/User.js'
import axios from 'axios'

export class MusicController {
  async download(req, res) {
    try {
      if (req.body.url) {
        const { data } = await axios.get('https://api.tikcdn.io/api/download', {
          params: { url: req.body.url },
        })

        if (!data || !data.downloadUrl) {
          return res
            .status(500)
            .json({ error: 'Não foi possível obter o vídeo do TikTok' })
        }

        return res.status(200).send({
          fileUrl: '',
          cloudinaryUrl: data.downloadUrl,
          thumbnailUrl:
            'https://media.istockphoto.com/id/1215540461/pt/vetorial/3d-headphones-on-sound-wave-background-colorful-abstract-visualization-of-digital-sound.jpg?s=612x612&w=0&k=20&c=22_trFnbPHR7OsBHgGa-spwJXedysy4etXcIKerJjsw=',
        })
      }

      return res.status(400).json({ error: 'URL ou arquivo não fornecido' })
    } catch (e) {
      console.log(e)
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
