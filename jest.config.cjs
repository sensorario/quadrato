module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  setupFilesAfterEnv: ['./setupTests.cjs', './jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    // sg-components' package.json "exports" has only an "import" condition, which jest's CommonJS resolver never matches.
    '^@sensorario/sg-components$': '<rootDir>/node_modules/@sensorario/sg-components/dist/index.es.js',
  },
  // ...and its dist is ESM only, so Babel has to turn it into CommonJS like the app's own code.
  // .babelrc is file-relative and never applies inside node_modules, hence the explicit extends.
  transform: {
    '\\.[jt]sx?$': ['babel-jest', { babelrc: false, extends: require('path').join(__dirname, '.babelrc') }],
  },
  transformIgnorePatterns: ['/node_modules/(?!@sensorario/sg-components/)'],
  testMatch: ['<rootDir>/tests/**/*.(test|spec).[jt]s?(x)'],
};
