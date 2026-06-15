import { test as base, expect } from '@playwright/test'

const expectedFetchStatusErrors = [
  'Failed to load resource: the server responded with a status of 401',
  'Failed to load resource: the server responded with a status of 409',
]

export const test = base.extend({
  page: async ({ page }, use) => {
    const browserErrors = []

    page.on('console', (message) => {
      const text = message.text()

      if (message.type() === 'error' && !expectedFetchStatusErrors.some((expected) => text.includes(expected))) {
        browserErrors.push(text)
      }
    })

    page.on('pageerror', (error) => {
      browserErrors.push(error.message)
    })

    await use(page)

    expect(browserErrors, `Console/page errors:\n${browserErrors.join('\n')}`).toEqual([])
  },
})

export { expect }
