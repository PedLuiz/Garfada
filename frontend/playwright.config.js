import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:5174'
const isLocalBrowserRun =
  process.env.E2E_LOCAL_BROWSER === '1' ||
  process.argv.includes('--ui') ||
  process.argv.includes('--headed')

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  globalTeardown: './e2e/support/global-teardown.js',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL,
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  webServer: process.env.E2E_SKIP_WEB_SERVER
    ? undefined
    : {
        command: isLocalBrowserRun ? 'npm run e2e:stack:serve:local-browser' : 'npm run e2e:stack:serve',
        url: baseURL,
        timeout: 180_000,
        reuseExistingServer: false,
        stdout: 'pipe',
        stderr: 'pipe',
      },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      testMatch: /mobile\.spec\.js/,
      use: { ...devices['Pixel 5'] },
    },
  ],
})
