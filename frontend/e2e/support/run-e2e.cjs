const { spawnSync } = require('node:child_process')
const path = require('node:path')

const repoRoot = path.resolve(__dirname, '../../..')
const composeFile = path.join(repoRoot, 'docker-compose.e2e.yml')
const composeEnv = { ...process.env }

if (!composeEnv.E2E_UID && typeof process.getuid === 'function') {
  composeEnv.E2E_UID = String(process.getuid())
}

if (!composeEnv.E2E_GID && typeof process.getgid === 'function') {
  composeEnv.E2E_GID = String(process.getgid())
}

function runCompose(args) {
  const result = spawnSync('docker', ['compose', '-f', composeFile, ...args], {
    cwd: repoRoot,
    env: composeEnv,
    stdio: 'inherit',
  })

  if (result.error) {
    throw result.error
  }

  return result.status ?? 1
}

let exitCode = runCompose(['down', '-v', '--remove-orphans'])

if (exitCode === 0) {
  exitCode = runCompose(['build', 'backend', 'frontend'])
}

if (exitCode === 0) {
  try {
    exitCode = runCompose(['run', '--rm', 'e2e'])
  } finally {
    const cleanupCode = runCompose(['down', '-v', '--remove-orphans'])

    if (exitCode === 0) {
      exitCode = cleanupCode
    }
  }
}

process.exit(exitCode)
