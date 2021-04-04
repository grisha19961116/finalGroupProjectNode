const express = require('express')
const router = express.Router()
const testingController = require('../../../controllers/testing')
const guard = require('../../../helpers/guard')
// const validation = require('./validation')

router.get('/techquestions', guard, testingController.getTechQuestions)
router.get('/theoryquestions', guard, testingController.getTheoryQuestions)
// router.post('/logout', guard, authController.logout)

module.exports = router
