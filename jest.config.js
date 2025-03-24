module.exports = {
  projects: [
    {
      displayName: 'unit',
      testMatch: ['**/__tests__/unit/**/*.spec.ts'],
      testPathIgnorePatterns: ['/node_modules/', '/dist/'],
      preset: 'ts-jest',
      testEnvironment: 'node',
      moduleNameMapper: {
        '^@libs/(.*)$': '<rootDir>/libs/$1/src',
        '^@app/(.*)$': '<rootDir>/apps/calenconnect-api/src/$1',
      },
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
      },
      maxWorkers: 1,
    },
    {
      displayName: 'integration',
      testMatch: ['**/__tests__/integration/**/*.spec.ts'],
      testPathIgnorePatterns: ['/node_modules/', '/dist/'],
      preset: 'ts-jest',
      testEnvironment: 'node',
      moduleNameMapper: {
        '^@libs/(.*)$': '<rootDir>/libs/$1/src',
        '^@app/(.*)$': '<rootDir>/apps/calenconnect-api/src/$1',
      },
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
      },
      maxWorkers: 1,
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
    {
      displayName: 'e2e',
      testMatch: ['**/test/e2e/**/*.e2e-spec.ts'],
      testPathIgnorePatterns: ['/node_modules/', '/dist/'],
      preset: 'ts-jest',
      testEnvironment: 'node',
      moduleNameMapper: {
        '^@libs/(.*)$': '<rootDir>/libs/$1/src',
        '^@app/(.*)$': '<rootDir>/apps/calenconnect-api/src/$1',
      },
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
      },
      maxWorkers: 1,
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
  ],
  maxWorkers: 1,
  testTimeout: 60000,
  collectCoverageFrom: [
    'apps/calenconnect-api/src/**/*.ts',
    '!apps/calenconnect-api/src/**/*.module.ts',
    '!apps/calenconnect-api/src/main.ts',
    '!libs/database/src/prisma.service.ts',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  coverageDirectory: './coverage',
}; 