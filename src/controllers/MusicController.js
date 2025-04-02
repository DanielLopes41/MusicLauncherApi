import Music from '../models/Music.js'
import User from '../models/User.js'
import ytdl from '@distube/ytdl-core'
import cloudinary from '../config/cloudinary.js'

export class MusicController {
  async download(req, res) {
    try {
      const user = await User.findByPk(req.userId)
      const music = Music

      if (!user) {
        throw new Error('BAD REQUEST')
      }

      if (!req.body.url) {
        throw new Error('The Url is required')
      }

      // Baixar o áudio do YouTube e enviar diretamente para o Cloudinary
      const audioStream = ytdl(req.body.url, {
        filter: 'audioonly',
        quality: 'highestaudio',
        playerClients: ['WEB'],
      })

      // Fazer o upload diretamente para o Cloudinary
      const uploadResult = await cloudinary.uploader.upload_stream(
        {
          resource_type: 'audio',
          public_id: `music_${Math.floor(Math.random() * 1000000)}`,
        },
        async (error, result) => {
          if (error) {
            console.error('Erro no upload:', error)
            return res
              .status(500)
              .json({ error: 'Erro ao fazer upload para o Cloudinary' })
          }

          try {
            // Obter informações do vídeo
            const info = await ytdl.getInfo(req.body.url, {
              playerClients: ['WEB'],
            })

            // Criar uma nova música no banco de dados
            const newMusic = await music.create({
              title: info.videoDetails.title,
              thumbnailUrl: `https://img.youtube.com/vi/${info.videoDetails.videoId}/maxresdefault.jpg`,
              cloudinaryUrl: result.secure_url,
            })

            // Associar a música ao usuário
            await newMusic.addUser(user)

            // Retornar a resposta com os dados da música
            return res.json({
              title: info.videoDetails.title,
              thumbnailUrl: `https://img.youtube.com/vi/${info.videoDetails.videoId}/maxresdefault.jpg`,
              cloudinaryUrl: result.secure_url,
            })
          } catch (e) {
            console.error(e)
            return res
              .status(500)
              .json({ error: 'Erro ao processar o arquivo.' })
          }
        },
      )

      // Passar o stream de áudio para o Cloudinary
      audioStream.pipe(uploadResult)
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
