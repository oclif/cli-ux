module.exports = {
  setupTestFrameworkScriptFile: "<rootDir>/src/__test__/init.ts",
  mapCoverage: true,
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/*.test.ts'],
  globalSetup: '<rootDir>/src/__test__/setup.js',
  transform: {
    '^.+\\.ts$': '<rootDir>/node_modules/ts-jest/preprocessor.js',
  },
  globals: {
    'ts-jest': {
      skipBabel: true
    }
  },
}
