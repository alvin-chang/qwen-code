// BMAD™ Orchestrator - Jest Configuration
// Copyright © 2025 BMAD™. All rights reserved.

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Root directory for tests
  rootDir: '.',
  
  // Test file patterns
  testMatch: [
    '**/?(*.)+(spec|test).{js,jsx,ts,tsx}',
    '**/*.test.{js,jsx,ts,tsx}'
  ],
  
  // File extensions to consider
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  
  // Setup files
  setupFilesAfterEnv: [],
  
  // Coverage settings
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/test/**',
    '!**/tests/**',
    '!jest.config.js',
    '!cli.js',
    '!example.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks
  clearMocks: true,
  
  // Reset modules
  resetModules: false,
  
  // Transform settings (if needed for future TypeScript support)
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  
  // Module name mapper (for aliasing)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  
  // Test path ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // Reporters
  reporters: [
    'default'
  ]
};