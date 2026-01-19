require('@testing-library/jest-dom');

if (process.env.NODE_ENV === 'test') {
    global.console = {
        ...console,
        log: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
    };
}