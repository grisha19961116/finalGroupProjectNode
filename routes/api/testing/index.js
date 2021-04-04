const express = require('express')
const router = express.Router()
const testingController = require('../../../controllers/testing')
const guard = require('../../../helpers/guard')
// const validation = require('./validation')

router.get('/tech-questions', guard, testingController.getTechQuestions)
router.get('/theory-questions', guard, testingController.getTheoryQuestions)
// router.post('/logout', guard, authController.logout)

module.exports = router
