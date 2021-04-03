const express = require('express')
const router = express.Router()
const authController = require('../../../controllers/auth')
const guard = require('../../../helpers/guard')
const { createAccountLimiter } = require('../../../helpers/rate-limit')
const validation = require('./validation')

router.post(
  '/register',
  createAccountLimiter,
  validation.Register,
  authController.register
)
router.post('/login', validation.Login, authController.login)
router.post('/logout', guard, authController.logout)

module.exports = router
