const jwt = require('jsonwebtoken')
const { nanoid } = require('nanoid')
require('dotenv').config()
const { create, findByField, updateByField } = require('../model/users')
const { HttpCode } = require('../helpers/constants')
const EmailService = require('../services/email')
const SECRET_KEY = process.env.JWT_SECRET_KEY

const register = async (req, res, next) => {
  try {
    const { email } = req.body
    const user = await findByField({ email })
    if (user) {
      return res.status(HttpCode.CONFLICT).json({
        status: 'error',
        code: HttpCode.CONFLICT,
        data: 'Conflict',
        message: 'Email in use',
      })
    }
    const verificationToken = nanoid()
    const emailService = new EmailService(process.env.NODE_ENV)
    await emailService.sendEmail(verificationToken, email)
    const newUser = await create({
      ...req.body,
      verificationToken,
    })
    return res.status(HttpCode.CREATED).json({
      status: 'success',
      code: HttpCode.CREATED,
      data: {
        id: newUser.id,
        email: newUser.email,
        subscription: newUser.subscription,
        avatar: newUser.avatarURL,
      },
    })
  } catch (e) {
    next(e)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await findByField({ email })
    const isPasswordValid = await user?.validPassword(password)
    if (!user || !isPasswordValid || user.verificationToken) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        status: 'error',
        code: HttpCode.UNAUTHORIZED,
        data: 'UNAUTHORIZED',
        message: user?.verificationToken
          ? 'Please verify your email'
          : 'Email or password is wrong',
      })
    }
    const id = user._id
    const payload = { id }
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '24h' })
    await updateByField({ _id: id }, { token })
    return res.status(HttpCode.OK).json({
      status: 'success',
      code: HttpCode.OK,
      data: {
        token,
        user: {
          name: user.name,
          email: user.email,
          subscription: user.subscription,
          avatarURL: user.avatarURL,
        },
      },
    })
  } catch (e) {
    next(e)
  }
}

const logout = async (req, res, next) => {
  try {
    await updateByField({ _id: req.user.id }, { token: null })
    return res.status(HttpCode.NO_CONTENT).json({})
  } catch (e) {
    next(e)
  }
}

module.exports = {
  register,
  login,
  logout,
}
