import User from '../models/User.js'
import Music from '../models/Music.js'
export class UserController {
  async store(req, res) {
    try {
      const newUser = await User.create(req.body)
      const { id, email } = newUser
      return res.json({ id, email })
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

  async show(req, res) {
    try {
      const user = await User.findByPk(req.userId, {
        include: {
          model: Music,
        },
        attributes: ['id', 'email'],
      })

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      return res.json(user)
    } catch (e) {
      console.error(e)
      return res.status(500).json({ error: 'Erro interno no servidor' })
    }
  }

  async delete(req, res) {
    try {
      const user = await User.findByPk(req.userId)

      if (!user) {
        return res.status(400).json({ errors: ['Usuário não existe'] })
      }

      await user.destroy()
      return res.json({ message: 'Usuário deletado com sucesso' })
    } catch (e) {
      console.error(e)
      return res.status(500).json({ error: 'Erro interno no servidor' })
    }
  }

  async update(req, res) {
    try {
      const user = await User.findByPk(req.userId)

      if (!user) {
        return res.status(400).json({ errors: ['Usuário não existe'] })
      }

      await user.update(req.body)
      const { id, nome, email } = user
      return res.json({ id, nome, email })
    } catch (e) {
      console.error(e)
      return res.status(500).json({ error: 'Erro interno no servidor' })
    }
  }
}
export default new UserController()
