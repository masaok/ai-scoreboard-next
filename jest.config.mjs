import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Load next.config and .env files in the test environment
  dir: './',
})

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
}

export default createJestConfig(config)
