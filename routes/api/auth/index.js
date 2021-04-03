const express = require('express')
const router = express.Router()
const authController = require('../../../controllers/auth')
// const guard = require('../../../helpers/guard')
// const upload = require('../../../helpers/upload')
// const { createAccountLimiter } = require('../../../helpers/rate-limit')
// const validation = require('./validation')

/* GET home page. */
// router.get('/', function (req, res, next) {
//   res.render('index', { title: 'Express' })
// })

router.post(
  '/register',
  // createAccountLimiter,
  // validation.Register,
  authController.register
)
router.post(
  '/login',
  // validation.Login,
  authController.login
)
router.post(
  '/logout',
  // guard,
  authController.logout
)

module.exports = router
