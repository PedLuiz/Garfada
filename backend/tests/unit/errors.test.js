const { AppError, isUniqueViolation } = require('../../src/errors')

describe('AppError', () => {
  test('armazena status HTTP e detalhes opcionais', () => {
    const details = { field: 'email' }
    const error = new AppError('Falha esperada.', 409, details)

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('AppError')
    expect(error.message).toBe('Falha esperada.')
    expect(error.statusCode).toBe(409)
    expect(error.details).toBe(details)
  })

  test('usa requisição inválida como padrão sem detalhes', () => {
    const error = new AppError('Payload inválido.')

    expect(error.statusCode).toBe(400)
    expect(error.details).toBeNull()
  })
})

describe('isUniqueViolation', () => {
  test('detecta qualquer violação de unicidade do Postgres sem constraint informada', () => {
    expect(isUniqueViolation({ code: '23505', constraint: 'users_email_key' })).toBe(true)
  })

  test('compara com a constraint esperada quando informada', () => {
    const error = { code: '23505', constraint: 'users_username_key' }

    expect(isUniqueViolation(error, 'users_username_key')).toBe(true)
    expect(isUniqueViolation(error, 'users_email_key')).toBe(false)
  })

  test('rejeita erros ausentes ou que não são de unicidade', () => {
    expect(isUniqueViolation({ code: '23503' })).toBe(false)
    expect(isUniqueViolation(null)).toBe(false)
  })
})
