module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
  setupFiles: ['<rootDir>/tests/setup/env.js'],
  clearMocks: true,
  restoreMocks: true,
  verbose: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.js'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}
