class AppError extends Error {
  constructor(message, statusCode = 400, details = null) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.details = details
  }
}

function isUniqueViolation(error, constraintName) {
  return error?.code === '23505' && (!constraintName || error.constraint === constraintName)
}

module.exports = {
  AppError,
  isUniqueViolation,
}
