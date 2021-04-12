const jwt = require('jsonwebtoken')
const { nanoid } = require('nanoid')
const queryString = require('query-string')
const axios = require('axios')
require('dotenv').config()
const {
  create,
  findUserByField,
  // updateUserByField,
  createSession,
  deleteSession,
} = require('../model/users')
const {
  HttpCode,
  JWT_ACCESS_EXPIRE_TIME,
  JWT_REFRESH_EXPIRE_TIME,
} = require('../helpers/constants')
const EmailService = require('../services/email')
const SECRET_KEY = process.env.JWT_SECRET_KEY

const register = async (req, res, next) => {
  try {
    const { email } = req.body
    const user = await findUserByField({ email })
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
    const user = await findUserByField({ email })
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
    const newSession = await createSession(id)
    const payload = { uid: id, sid: newSession._id }
    const accessToken = jwt.sign(payload, SECRET_KEY, {
      expiresIn: JWT_ACCESS_EXPIRE_TIME,
    })
    const refreshToken = jwt.sign(payload, SECRET_KEY, {
      expiresIn: JWT_REFRESH_EXPIRE_TIME,
    })
    // await updateUserByField({ _id: id }, { token })
    return res.status(HttpCode.OK).json({
      status: 'success',
      code: HttpCode.OK,
      data: {
        accessToken,
        refreshToken,
        user: {
          name: user.name,
          email: user.email,
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
    // делает Access token не валидным! А refreshToken тоже?
    await deleteSession(req.user.sid)
    // await updateUserByField({ _id: req.user.id }, { token: null })
    return res.status(HttpCode.NO_CONTENT).json({})
  } catch (e) {
    next(e)
  }
}

const googleAuth = async (req, res) => {
  const stringifiedParams = queryString.stringify({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.BASE_URL}/auth/google-redirect`,
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' '),
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
  })
  return res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`
  )
}

const googleRedirect = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
  const urlObj = new URL(fullUrl)
  const urlParams = queryString.parse(urlObj.search)
  const code = urlParams.code
  const tokenData = await axios({
    url: `https://oauth2.googleapis.com/token`,
    method: 'post',
    data: {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.BASE_URL}/auth/google-redirect`,
      grant_type: 'authorization_code',
      code,
    },
  })
  const userData = await axios({
    url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    method: 'get',
    headers: {
      Authorization: `Bearer ${tokenData.data.access_token}`,
    },
  })
  const email = userData.data.email
  const user = await findUserByField({ email })

  if (!user) {
    return res.status(403).send({
      message: 'You should register from front-end first',
    })
  }

  const newSession = await createSession(user._id)
  const payload = { uid: user._id, sid: newSession._id }
  const accessToken = jwt.sign(payload, SECRET_KEY, {
    expiresIn: JWT_ACCESS_EXPIRE_TIME,
  })
  const refreshToken = jwt.sign(payload, SECRET_KEY, {
    expiresIn: JWT_REFRESH_EXPIRE_TIME,
  })
  // await updateUserByField({ _id: user._id }, { token: accessToken })

  return res
    .redirect(
      200,
      `${process.env.BASE_URL}?accessToken=${accessToken}&refreshToken=${refreshToken}`
    )
    .send({ email })
}

const refreshToken = async (req, res) => {
  // Получили рефреш токен проверили валидный ли он
  // в прослойке validate-refresh-token в рауте
  // и теперь по нему выдаём пару новых
  await deleteSession(req.user.sid)
  const user = req.user
  const newSession = await createSession(user._id)
  const payload = { uid: user._id, sid: newSession._id }
  const accessToken = jwt.sign(payload, SECRET_KEY, {
    expiresIn: JWT_ACCESS_EXPIRE_TIME,
  })
  const refreshToken = jwt.sign(payload, SECRET_KEY, {
    expiresIn: JWT_REFRESH_EXPIRE_TIME,
  })

  return res.status(HttpCode.OK).json({
    status: 'success',
    code: HttpCode.OK,
    data: {
      accessToken,
      refreshToken,
      user: {
        name: user.name,
        email: user.email,
        avatarURL: user.avatarURL,
      },
    },
  })
}

module.exports = {
  refreshToken,
  googleRedirect,
  googleAuth,
  register,
  login,
  logout,
}
