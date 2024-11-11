/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  // Enable ESM support
  extensionsToTreatAsEsm: ['.ts'],
  
  // Handle .js extensions in import statements
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',  // Removed extra forward slash at start
  },
  
  // Transform TypeScript files with ESM support
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  
  // Test environment
  testEnvironment: 'node',
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'js'],
  
  // Root directory and test patterns
  roots: ['<rootDir>/src/', '<rootDir>/tests/'],
  testMatch: ['**/tests/**/*.test.ts'],
  
  // Clear mocks between tests
  clearMocks: true,

  // Optional: Collect coverage
  // collectCoverage: true,
  // coverageDirectory: 'coverage',
  // coverageReporters: ['text', 'lcov'],

  // Optional: Handle path aliases if you have any in tsconfig
  modulePaths: ['<rootDir>'],
}