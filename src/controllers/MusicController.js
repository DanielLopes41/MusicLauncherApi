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

      if (!user) {
        throw new Error('BAD REQUEST')
      }

      if (!req.body.url) {
        throw new Error('The Url is required')
      }

      const tempFilePath = path.resolve(__dirname, '..', 'temp', 'tempfile.mp3')

      // Baixar o áudio do YouTube
      await ytdl(req.body.url, {
        filter: 'audioonly',
        quality: 'highestaudio',
        playerClients: ['WEB'],
      })
        .pipe(fs.createWriteStream(tempFilePath)) // Salvar no arquivo temporário
        .on('finish', async () => {
          try {
            // Upload para o Cloudinary
            const uploadResult = await cloudinary.uploader.upload(
              tempFilePath,
              {
                resource_type: 'auto',
                public_id: `music_${Math.floor(Math.random() * 1000000)}`,
              },
            )

            // Remover o arquivo temporário após o upload
            await fs.promises.unlink(tempFilePath)

            // Obter informações do vídeo
            const info = await ytdl.getInfo(req.body.url, {
              playerClients: ['WEB'],
            })

            // Criar uma nova música no banco de dados
            const newMusic = await music.create({
              title: info.videoDetails.title,
              thumbnailUrl: `https://img.youtube.com/vi/${info.videoDetails.videoId}/maxresdefault.jpg`,
              cloudinaryUrl: uploadResult.secure_url,
            })

            // Associar a música ao usuário
            await newMusic.addUser(user)

            // Retornar a resposta com os dados da música
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
        .on('error', (err) => {
          console.error('Erro ao salvar o arquivo:', err)
          return res.status(500).json({ error: 'Erro ao processar o arquivo.' })
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
