const crypto = require('crypto')
const { createId } = require('../../../src/utils/ids')

describe('createId', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('monta um id legível com prefixo, timestamp e hex aleatório', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1710000000000)
    jest.spyOn(crypto, 'randomBytes').mockReturnValue(Buffer.from([1, 2, 3, 4, 5, 6]))

    const id = createId('rev')

    expect(id).toBe(`rev_${(1710000000000).toString(36)}_010203040506`)
    expect(crypto.randomBytes).toHaveBeenCalledWith(6)
  })
})
