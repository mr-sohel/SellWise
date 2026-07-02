module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  clearMocks: true,
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(@sellwise)/)',
  ],
  transform: {
    '^.+\\.js$': ['ts-jest', { useESM: false }],
  },
  moduleNameMapper: {
    '^@sellwise/shared$': '<rootDir>/../shared/src',
  },
  forceExit: true,
};