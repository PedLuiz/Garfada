const { hashPassword, verifyPassword } = require('../../../src/utils/password')

describe('utilitários de senha', () => {
  test('gera hash e verifica uma senha usando os parâmetros codificados', () => {
    const hash = hashPassword('senha123')

    expect(hash).toMatch(/^pbkdf2_sha256\$\d+\$[A-Za-z0-9+/=]+\$[A-Za-z0-9_-]+$/)
    expect(verifyPassword('senha123', hash)).toBe(true)
    expect(verifyPassword('senha-errada', hash)).toBe(false)
  })

  test('usa um salt único para cada hash', () => {
    const first = hashPassword('senha123')
    const second = hashPassword('senha123')

    expect(first).not.toBe(second)
    expect(verifyPassword('senha123', first)).toBe(true)
    expect(verifyPassword('senha123', second)).toBe(true)
  })

  test('rejeita hashes malformados sem lançar erro', () => {
    expect(verifyPassword('senha123')).toBe(false)
    expect(verifyPassword('senha123', null)).toBe(false)
    expect(verifyPassword('senha123', 'bcrypt$10$salt$digest')).toBe(false)
    expect(verifyPassword('senha123', 'pbkdf2_sha256$abc$c2FsdA$digest')).toBe(false)
    expect(verifyPassword('senha123', 'pbkdf2_sha256$1000$c2FsdA$abc')).toBe(false)
  })
})
