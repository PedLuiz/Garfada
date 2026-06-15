import { execFileSync } from 'node:child_process'

export default async function globalTeardown() {
  if (process.env.E2E_SKIP_WEB_SERVER) {
    return
  }

  execFileSync('npm', ['run', 'e2e:stack:down'], {
    cwd: process.cwd(),
    stdio: 'inherit',
  })
}
