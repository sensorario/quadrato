module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  setupFilesAfterEnv: ['./setupTests.cjs', './jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
  },
  testMatch: ['<rootDir>/tests/**/*.(test|spec).[jt]s?(x)'],
};
