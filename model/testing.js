const TechQuestion = require('./schemas/techQuestion')
const TheoryQuestion = require('./schemas/theoryQuestion')
const { questionsAmount } = require('./../helpers/constants')

// const randomizeQuestions = async (model) => {
//   const length = await model.find().countDocuments()
//   const arr = []
//   while (arr.length < questionsAmount) {
//     const randomNumber = Math.floor(Math.random() * length) + 1
//     if (arr.indexOf(randomNumber) > -1) continue
//     arr[arr.length] = randomNumber
//   }
//   return arr
// }

const listTechQuestions = async () => {
  const questions = await TechQuestion.aggregate([
    { $sample: { size: questionsAmount } },
  ])
  // const randomizedQuestionsQueryArr = await randomizeQuestions(TechQuestion)
  // const questions = await TechQuestion.find()
  //   .where('questionId')
  //   .in(randomizedQuestionsQueryArr)
  //   .select('questionId question answers')
  return questions
}

const listTheoryQuestions = async () => {
  const questions = await TheoryQuestion.aggregate([
    { $sample: { size: questionsAmount } },
  ])
  // const randomizedQuestionsQueryArr = await randomizeQuestions(TheoryQuestion)
  // const questions = await TheoryQuestion.find()
  //   .where('questionId')
  //   .in(randomizedQuestionsQueryArr)
  //   .select('questionId question answers')
  return questions
}

const listAnswersTheoryQuestions = async () => {
  const questions = await TheoryQuestion.find()
  return questions
}
const listAnswersTechQuestions = async () => {
  const questions = await TechQuestion.find()
  return questions
}

module.exports = {
  listTechQuestions,
  listTheoryQuestions,
  listAnswersTechQuestions,
  listAnswersTheoryQuestions,
}
