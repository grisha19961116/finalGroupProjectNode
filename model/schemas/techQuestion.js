const { Schema, model } = require('mongoose')

const techQuestionSchema = new Schema(
  {
    question: String,
    questionId: Number,
    answers: [String],
    rightAnswer: String,
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

const TechQuestion = model('techQuestion', techQuestionSchema)

module.exports = TechQuestion
