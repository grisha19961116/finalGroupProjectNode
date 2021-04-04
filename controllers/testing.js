const {
  listTechQuestions,
  listTheoryQuestions,
} = require('../model/testing.js')

const getTechQuestions = async (req, res, next) => {
  try {
    const data = await listTechQuestions(req.query)
    return res.json({ status: 'success', code: 200, data })
  } catch (e) {
    next(e)
  }
}

const getTheoryQuestions = async (req, res, next) => {
  try {
    const data = await listTheoryQuestions(req.query)
    return res.json({ status: 'success', code: 200, data })
  } catch (e) {
    next(e)
  }
}

module.exports = {
  getTechQuestions,
  getTheoryQuestions,
}
