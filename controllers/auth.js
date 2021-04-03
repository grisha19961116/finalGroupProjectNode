const jwt = require('jsonwebtoken')
const fs = require('fs').promises
const { promisify } = require('util')
const cloudinary = require('cloudinary').v2
const { nanoid } = require('nanoid')
// const path = require('path')
// const Jimp = require('jimp')
// const createFolderIsNotExist = require('../helpers/create-dir')
require('dotenv').config()
const {
  create,
  updateAvatar,
  findByField,
  updateByField,
} = require('../model/users')
const { HttpCode } = require('../helpers/constants')
const EmailService = require('../services/email')
const SECRET_KEY = process.env.JWT_SECRET_KEY

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadCloud = promisify(cloudinary.uploader.upload)

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

// const updateUser = async (req, res, next) => {
//   try {
//     const { id } = req.user
//     const user = await updateByField({ _id: id }, { subscription })
//     return res.status(HttpCode.OK).json({
//       status: 'success',
//       code: HttpCode.OK,
//       data: {
//         user: {
//           email: user.email,
//         },
//       },
//     })
//   } catch (e) {
//     next(e)
//   }
// }

const getCurrent = async (req, res, next) => {
  try {
    const token = req.get('Authorization')?.split(' ')[1]
    const user = await findByField({ token })
    // const userId = req.user.id
    // const user = await findByField({ _id: userId })
    if (user) {
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        data: {
          user: {
            email: user.email,
            subscription: user.subscription,
            avatarURL: user.avatarURL,
          },
        },
      })
    } else {
      return next({
        status: HttpCode.UNAUTHORIZED,
        message: 'Invalid credentials',
      })
    }
  } catch (e) {
    next(e)
  }
}

const avatars = async (req, res, next) => {
  try {
    const id = req.user.id
    // const avatarURL = await saveAvatarToStatic(req)
    // await updateByField((_id: id}, {avatarURL})
    const {
      public_id: avatarIdCloud,
      secure_url: avatarUrl,
    } = await saveAvatarToCloud(req)
    await updateAvatar(id, avatarUrl, avatarIdCloud)
    return res.json({
      status: 'success',
      code: HttpCode.OK,
      data: {
        avatarUrl,
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

const verify = async (req, res, next) => {
  try {
    const { verificationToken } = req.params
    const user = await findByField({ verificationToken })
    if (user) {
      await updateByField({ _id: user.id }, { verificationToken: null })
      return res.json({
        status: 'success',
        code: HttpCode.OK,
        message: 'Verification successful!',
      })
    }
    next(
      res.status(HttpCode.BAD_REQUEST).json({
        status: 'error',
        code: HttpCode.BAD_REQUEST,
        data: 'Bad request',
        message: 'Your verification token is not valid',
      })
    )
  } catch (e) {
    next(e)
  }
}
// const saveAvatarToStatic = async (req) => {
//   const id = req.user.id
//   const IMG_DIR = path.join(
//     process.env.PUBLIC_DIR_NAME,
//     process.env.IMG_DIR_NAME
//   )
//   const pathFile = req.file.path
//   const newNameAvatar = `${Date.now()}-${req.file.originalname}`
//   const img = await Jimp.read(pathFile)
//   await img
//     .autocrop()
//     .cover(250, 250, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE)
//     .writeAsync(pathFile)
//   await createFolderIsNotExist(path.join(IMG_DIR, id))
//   await fs.rename(pathFile, path.join(IMG_DIR, id, newNameAvatar))
//   const avatarUrl = path.normalize(path.join(id, newNameAvatar))
//   try {
//     await fs.unlink(req.user.avatarURL)
//   } catch (e) {
//     console.log(e.message)
//   }
//   return path.join('http:\\localhost:3000', process.env.IMG_DIR_NAME, avatarUrl)
// }

const saveAvatarToCloud = async (req) => {
  const pathFile = req.file.path
  const result = await uploadCloud(pathFile, {
    folder: 'Photo',
    transformation: { width: 250, height: 250, crop: 'fill' },
  })
  cloudinary.uploader.destroy(req.user.avatarIdCloud, (err, result) => {
    console.log(err, result)
  })
  try {
    await fs.unlink(pathFile)
  } catch (e) {
    console.log(e.message)
  }
  return result
}

module.exports = {
  register,
  login,
  // updateUser,
  logout,
  getCurrent,
  avatars,
  verify,
}
