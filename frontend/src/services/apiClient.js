import { delay } from '../utils/delay'

export async function mockRequest(handler, options = {}) {
  const { delayMs = 500, shouldFail = false, errorMessage = 'Falha ao carregar dados.' } = options

  await delay(delayMs)

  if (shouldFail) {
    throw new Error(errorMessage)
  }

  return handler()
}
