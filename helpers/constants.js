const HttpCode = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
}

const questionsAmount = 12

const JWT_ACCESS_EXPIRE_TIME = '1h'
const JWT_REFRESH_EXPIRE_TIME = '30d'

module.exports = {
  HttpCode,
  JWT_ACCESS_EXPIRE_TIME,
  JWT_REFRESH_EXPIRE_TIME,
  questionsAmount,
}
