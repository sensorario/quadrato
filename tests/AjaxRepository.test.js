/* eslint-disable no-undef */

describe('AjaxRepository temporary-password wiring', () => {
    let repository;

    beforeEach(() => {
        jest.resetModules();
        window.localStorage.clear();
        repository = require('../src/repositories/AjaxRepository').default;
    });

    it('authenticate() resolves isTemporaryPassword from the login response', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            status: 200,
            ok: true,
            json: () => Promise.resolve({ token: 'abc123', is_temporary_password: true }),
        });

        const result = await repository.authenticate('johndoe', 'temp-pass');

        expect(result).toEqual({ isTemporaryPassword: true });
        expect(window.localStorage.getItem('simonegentili.com-access-token')).toBe('abc123');
    });

    it('updatePassword() posts the new password with the stored auth token', async () => {
        global.fetch = jest.fn()
            .mockResolvedValueOnce({
                // authenticate() -> POST /authenticate
                status: 200,
                ok: true,
                json: () => Promise.resolve({ token: 'abc123', is_temporary_password: true }),
            })
            .mockResolvedValueOnce({
                // setAccessToken() triggers fetchData() -> GET /data
                ok: true,
                json: () => Promise.resolve({}),
            })
            .mockResolvedValueOnce({
                // updatePassword() -> POST /update-password
                ok: true,
                json: () => Promise.resolve({ status: 200 }),
            });

        await repository.authenticate('johndoe', 'temp-pass');
        await repository.updatePassword('brand-new-pass');

        const [url, options] = global.fetch.mock.calls[2];
        expect(url).toBe('https://api.simonegentili.com/quadrato/update-password');
        expect(options.method).toBe('POST');
        expect(options.headers.Authorization).toBe('abc123');
        expect(JSON.parse(options.body)).toEqual({ newPassword: 'brand-new-pass' });
    });
});

describe('AjaxRepository active tab is scoped per TabbedContent id', () => {
    let repository;

    beforeEach(() => {
        jest.resetModules();
        window.localStorage.clear();
        repository = require('../src/repositories/AjaxRepository').default;
    });

    it('stores the active tab separately for each id', () => {
        repository.setActiveTab('editTask', 2);
        repository.setActiveTab('settings', 0);

        expect(repository.getActiveTab('editTask')).toBe('2');
        expect(repository.getActiveTab('settings')).toBe('0');
    });

    it('does not let one id overwrite another when updated later', () => {
        repository.setActiveTab('settings', 1);
        repository.setActiveTab('editTask', 2);
        repository.setActiveTab('editTask', 0);

        expect(repository.getActiveTab('settings')).toBe('1');
        expect(repository.getActiveTab('editTask')).toBe('0');
    });

    it('returns null for an id that has never been set', () => {
        expect(repository.getActiveTab('settings')).toBeNull();
    });
});
