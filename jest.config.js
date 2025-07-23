export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/tests/api/**/*.test.ts',
    '**/tests/security/**/*.test.ts',
    '**/tests/performance/**/*.test.ts',
    '**/tests/components/**/*.test.tsx',
    '**/tests/components/**/*.test.ts'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  verbose: true,
  collectCoverageFrom: [
    'server/**/*.{ts,tsx}',
    'client/src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 30000,
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(nanoid)/)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@server/(.*)$': '<rootDir>/server/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx']
}; 