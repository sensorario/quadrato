require('@testing-library/jest-dom');

const i18n = require('./src/i18n').default;
i18n.changeLanguage('it');

if (process.env.NODE_ENV === 'test') {
    global.console = {
        ...console,
        log: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
    };
}