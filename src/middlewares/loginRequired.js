import jwt from 'jsonwebtoken'
import User from '../models/User.js'
export default async (req, res, next) => {
  const { authorization } = req.headers

  if (!authorization) {
    return res.status(401).json({
      errors: ['Login required'],
    })
  }
  const [, token] = authorization.split(' ')
  try {
    const data = jwt.verify(token, process.env.TOKEN_SECRET)
    const { id, email } = data

    const user = await User.findOne({
      where: {
        id,
        email,
      },
    })
    if (!user) {
      return res.json(401).json({
        errors: ['Usuário inválido'],
      })
    }
    req.userId = id
    req.userEmail = email
    next()
  } catch (e) {
    return res.status(401).json({
      errors: ['Token expired or invalid'],
    })
  }
}
