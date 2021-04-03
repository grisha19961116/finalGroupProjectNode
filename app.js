const express = require('express')
const path = require('path')
const helmet = require('helmet')
const cors = require('cors')
const logger = require('morgan')
const rateLimit = require('express-rate-limit')
// const cookieParser = require("cookie-parser");
const { apiLimit, jsonLimit } = require('./config/rate-limit.json')
const { HttpCode } = require('./helpers/constants')
require('dotenv').config()

const authRouter = require('./routes/api/auth/index')
// const usersRouter = require("./routes/users");

const app = express()

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'
app.get('env') !== 'test' && app.use(logger(formatsLogger))

app.use(cors())
app.use(helmet())
app.use(express.json({ limit: jsonLimit }))

// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "public")));

app.use('/auth', authRouter)
// app.use("/users", usersRouter);

app.use(
  '/',
  rateLimit({
    windowMs: apiLimit.windowMs, // 15 minutes
    max: apiLimit.max,
    handler: (req, res, next) => {
      return res.status(HttpCode.BAD_REQUEST).json({
        status: 'error',
        code: HttpCode.BAD_REQUEST,
        data: 'Bad request',
        message: 'Too many requests, please try again later.',
      })
    },
  })
)

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.use((err, _req, res, _next) => {
  res.status(err.status || 500).json({ message: err.message })
})

module.exports = app
