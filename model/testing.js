const TechQuestion = require('./schemas/techQuestion')
const TheoryQuestion = require('./schemas/theoryQuestion')

const randomizeQuestions = (length) => {
  // const randomIdNumber = Math.floor(Math.random() * length)
  const arr = []
  while (arr.length < 12) {
    const randomNumber = Math.floor(Math.random() * length) + 1
    if (arr.indexOf(randomNumber) > -1) continue
    arr[arr.length] = randomNumber
  }

  return arr
}

const listTechQuestions = async () => {
  const randomizedQuestionsQueryArr = randomizeQuestions(25)
  // const questions = await TechQuestions.find({
  //   questionId: randomizedQuestionsQueryArr,
  // })

  const questions = await TechQuestion.find({})
  // .where('questionId')
  // .in(randomizedQuestionsQueryArr)
  return questions
}

const listTheoryQuestions = async ({
  // filter,
  limit = '12',
  offset = '0',
}) => {
  const result = await TheoryQuestion.paginate({
    limit,
    offset,
    // select: filter ? filter.split('|').join(' ') : '',
  })
  const { docs: contacts, totalDocs: total } = result
  return { total: total.toString(), limit, offset, contacts }
}

module.exports = { listTechQuestions, listTheoryQuestions }
