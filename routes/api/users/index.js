const express = require('express')
const router = express.Router()
const guard = require('../../../helpers/guard')
const upload = require('../../../helpers/upload')
const usersController = require('../../../controllers/users')
const validation = require('./validation')

// router.patch(
//   '/',
//   guard,
// validation.UpdateUser,
// usersController.updateUser
// )

router.patch(
  '/avatars',
  guard,
  upload.single('avatar'),
  validation.UploadAvatar,
  usersController.avatars
)
router.get('/current', guard, usersController.getCurrent)

router.get('/verify/:verificationToken', usersController.verify)

router.post('/test/technic', guard, usersController.postTechnic)
router.post('/test/practice', guard, usersController.postPractice)

router.get('/test/technic/result', guard, usersController.getTechnicResult)
router.get('/test/practice/result', guard, usersController.getPracticeResult)
module.exports = router
