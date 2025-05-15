import Music from '../models/Music.js'
import User from '../models/User.js'
import cloudinary from '../config/cloudinary.js'
import axios from 'axios'

export class MusicController {
  async download(req, res) {
    try {
      // Caso TikTok
      if (req.body.url) {
        const { data } = await axios.get('https://api.tikcdn.io/api/download', {
          params: { url: req.body.url },
        })

        // Se não tiver o link de download, retorna erro
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

      // Caso upload de arquivo
      if (req.file) {
        const user = await User.findByPk(req.userId)

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
                'https://media.istockphoto.com/id/1215540461/pt/vetorial/3d-headphones-on-sound-wave-background-colorful-abstract-visualization-of-digital-sound.jpg?s=612x612&w=0&k=20&c=22_trFnbPHR7OsBHgGa-spwJXedysy4etXcIKerJjsw=',
            })

            await newMusic.addUser(user)

            return res.status(200).json({
              fileUrl: result.secure_url,
              cloudinaryUrl: result.secure_url,
              thumbnailUrl:
                'https://media.istockphoto.com/id/1215540461/pt/vetorial/3d-headphones-on-sound-wave-background-colorful-abstract-visualization-of-digital-sound.jpg?s=612x612&w=0&k=20&c=22_trFnbPHR7OsBHgGa-spwJXedysy4etXcIKerJjsw=',
            })
          })
          .end(req.file.buffer)

        return
      }

      return res.status(400).json({ error: 'URL ou arquivo não fornecido' })
    } catch (e) {
      console.error(e)
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
