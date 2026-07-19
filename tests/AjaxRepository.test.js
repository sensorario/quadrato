/* eslint-disable no-undef */

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

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
        expect(options.headers.Authorization).toBe('Bearer abc123');
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

describe('AjaxRepository construction', () => {
    beforeEach(() => {
        jest.resetModules();
        window.localStorage.clear();
    });

    it('does not fetch data on construction when no token is stored', () => {
        global.fetch = jest.fn();
        require('../src/repositories/AjaxRepository');
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('fetches data automatically when a token is already stored', async () => {
        window.localStorage.setItem('simonegentili.com-access-token', 'saved-token');
        global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

        require('../src/repositories/AjaxRepository');
        await flush();

        expect(global.fetch).toHaveBeenCalledWith(
            'https://api.simonegentili.com/quadrato/data',
            expect.objectContaining({
                method: 'GET',
                headers: expect.objectContaining({ Authorization: 'Bearer saved-token' }),
            })
        );
    });

    it('requireAuthentication is always true', () => {
        global.fetch = jest.fn();
        const repository = require('../src/repositories/AjaxRepository').default;
        expect(repository.requireAuthentication()).toBe(true);
    });
});

describe('AjaxRepository fetchData', () => {
    let repository;

    beforeEach(() => {
        jest.resetModules();
        window.localStorage.clear();
        repository = require('../src/repositories/AjaxRepository').default;
    });

    it('merges alias keys from the API response and persists each value to localStorage', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                tasks: [{ id: 1, project: 'work' }],
                projectColors: { work: '#fff' },
                showText: true,
                iconTheme: 'dark',
                showExpired: true,
                dateTimeEnabled: false,
                zenMode: true,
                projectFilter: 'work',
                projectGroupable: false,
                activeTab: { settings: '2' },
            }),
        });

        await new Promise((resolve) => repository.fetchData(resolve));

        expect(repository.getTasks()).toEqual([{ id: 1, project: 'work' }]);
        expect(repository.getProjectColors()).toEqual({ work: '#fff' });
        expect(repository.getShowText()).toBe(true);
        expect(repository.getIconTheme()).toBe('dark');
        expect(repository.getShowExpired()).toBe(true);
        expect(repository.getDateTimeEnabled()).toBe(false);
        expect(repository.getZenMode()).toBe(true);
        expect(repository.getProjectFilter()).toBe('work');
        expect(repository.getProjectGroupable()).toBe(false);
        expect(repository.getActiveTab('settings')).toBe('2');

        expect(JSON.parse(window.localStorage.getItem('simplanner-tasks'))).toEqual([{ id: 1, project: 'work' }]);
        expect(window.localStorage.getItem('simplanner-show-text')).toBe('true');
    });

    it('invokes onDataLoaded immediately once data has already been loaded', async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
        await new Promise((resolve) => repository.fetchData(resolve));

        const onLoaded = jest.fn();
        repository.onDataLoaded(onLoaded);

        expect(onLoaded).toHaveBeenCalledTimes(1);
    });

    it('invokes a previously registered onDataLoaded callback once fetchData succeeds', async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
        const onLoaded = jest.fn();
        repository.onDataLoaded(onLoaded);

        await new Promise((resolve) => repository.fetchData(resolve));

        expect(onLoaded).toHaveBeenCalledTimes(1);
    });

    it('notifies onUnauthorized and stops on a 401 response', async () => {
        global.fetch = jest.fn().mockResolvedValue({ status: 401, ok: false, json: () => Promise.resolve({}) });
        const onUnauthorized = jest.fn();
        repository.onUnauthorized(onUnauthorized);

        repository.fetchData();
        await flush();

        expect(onUnauthorized).toHaveBeenCalledTimes(1);
    });

    it('logs an error and stops when the response is not ok', async () => {
        global.fetch = jest.fn().mockResolvedValue({ status: 500, ok: false, json: () => Promise.resolve({}) });
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        repository.fetchData();
        await flush();

        expect(errorSpy).toHaveBeenCalledWith('Error fetching from api.simonegentili.com:', expect.any(Error));
        errorSpy.mockRestore();
    });

    it('logs an error and stops when the network request rejects', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('network down'));
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        repository.fetchData();
        await flush();

        expect(errorSpy).toHaveBeenCalledWith('Error fetching from api.simonegentili.com:', expect.any(Error));
        errorSpy.mockRestore();
    });
});

describe('AjaxRepository syncToServer (triggered via setters)', () => {
    let repository;

    beforeEach(async () => {
        jest.resetModules();
        window.localStorage.clear();
        repository = require('../src/repositories/AjaxRepository').default;
        global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
        await new Promise((resolve) => repository.fetchData(resolve));
        global.fetch.mockClear();
    });

    it('does not sync when the setter does not change the data', async () => {
        repository.setShowText(true); // already true by default
        await flush();
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('PUTs the config to the server when data changes after loading', async () => {
        repository.setShowText(false);
        await flush();

        expect(global.fetch).toHaveBeenCalledWith(
            'https://api.simonegentili.com/quadrato/config',
            expect.objectContaining({ method: 'PUT' })
        );
        const [, options] = global.fetch.mock.calls[0];
        expect(JSON.parse(options.body)['simplanner-show-text']).toBe(false);
    });

    it('notifies onUnauthorized on a 401 response while syncing', async () => {
        global.fetch = jest.fn().mockResolvedValue({ status: 401, ok: false, json: () => Promise.resolve({}) });
        const onUnauthorized = jest.fn();
        repository.onUnauthorized(onUnauthorized);

        repository.setShowExpired(true);
        await flush();

        expect(onUnauthorized).toHaveBeenCalledTimes(1);
    });

    it('logs an error when the sync response is not ok', async () => {
        global.fetch = jest.fn().mockResolvedValue({ status: 500, ok: false, json: () => Promise.resolve({}) });
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        repository.setZenMode(true);
        await flush();

        expect(errorSpy).toHaveBeenCalledWith('Error syncing data to server:', expect.any(Error));
        errorSpy.mockRestore();
    });

    it('logs an error when the sync request rejects', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('network down'));
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        repository.setProjectGroupable(false);
        await flush();

        expect(errorSpy).toHaveBeenCalledWith('Error syncing data to server:', expect.any(Error));
        errorSpy.mockRestore();
    });

    it('logs the response on a successful sync', async () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        repository.setDateTimeEnabled(false);
        await flush();

        expect(logSpy).toHaveBeenCalledWith('Data synced successfully:', {});
        logSpy.mockRestore();
    });
});

describe('AjaxRepository syncToServer skips when data has not loaded yet', () => {
    it('does not call fetch when a setter runs before fetchData resolves', async () => {
        jest.resetModules();
        window.localStorage.clear();
        const repository = require('../src/repositories/AjaxRepository').default;
        global.fetch = jest.fn();

        repository.setShowText(false);
        await flush();

        expect(global.fetch).not.toHaveBeenCalled();
    });
});

describe('AjaxRepository setAccessToken', () => {
    let repository;

    beforeEach(() => {
        jest.resetModules();
        window.localStorage.clear();
        repository = require('../src/repositories/AjaxRepository').default;
    });

    it('stores the token in localStorage and reloads data', async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

        repository.setAccessToken('new-token');
        await flush();

        expect(window.localStorage.getItem('simonegentili.com-access-token')).toBe('new-token');
        expect(global.fetch).toHaveBeenCalledWith(
            'https://api.simonegentili.com/quadrato/data',
            expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer new-token' }) })
        );
    });

    it('clears the token from localStorage when set to null', async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
        repository.setAccessToken('new-token');
        await flush();

        repository.setAccessToken(null);
        await flush();

        expect(window.localStorage.getItem('simonegentili.com-access-token')).toBeNull();
    });
});

describe('AjaxRepository authenticate additional branches', () => {
    let repository;

    beforeEach(() => {
        jest.resetModules();
        window.localStorage.clear();
        repository = require('../src/repositories/AjaxRepository').default;
    });

    it('rejects when the server responds with a non-200 status', async () => {
        global.fetch = jest.fn().mockResolvedValue({ status: 403, ok: false });
        await expect(repository.authenticate('john', 'wrong')).rejects.toThrow('Authentication failed: 403');
    });

    it('rejects when the response has no token', async () => {
        global.fetch = jest.fn().mockResolvedValue({ status: 200, ok: true, json: () => Promise.resolve({}) });
        await expect(repository.authenticate('john', 'pw')).rejects.toThrow('No token in response');
    });

    it('falls back to access_token and reports isTemporaryPassword=false when absent', async () => {
        global.fetch = jest.fn()
            .mockResolvedValueOnce({ status: 200, ok: true, json: () => Promise.resolve({ access_token: 'tok-2' }) })
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

        const result = await repository.authenticate('john', 'pw');

        expect(result).toEqual({ isTemporaryPassword: false });
        expect(window.localStorage.getItem('simonegentili.com-access-token')).toBe('tok-2');
    });

    it('notifies the onAuthenticated callback with the new token', async () => {
        global.fetch = jest.fn()
            .mockResolvedValueOnce({ status: 200, ok: true, json: () => Promise.resolve({ token: 'tok-3' }) })
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

        const onAuthenticated = jest.fn();
        repository.onAuthenticated(onAuthenticated);

        await repository.authenticate('john', 'pw');

        expect(onAuthenticated).toHaveBeenCalledWith('tok-3');
    });
});

describe('AjaxRepository updatePassword failure branches', () => {
    let repository;

    beforeEach(() => {
        jest.resetModules();
        window.localStorage.clear();
        repository = require('../src/repositories/AjaxRepository').default;
    });

    it('notifies onUnauthorized and rejects on a 401 response', async () => {
        global.fetch = jest.fn().mockResolvedValue({ status: 401, ok: false });
        const onUnauthorized = jest.fn();
        repository.onUnauthorized(onUnauthorized);

        await expect(repository.updatePassword('new-pass')).rejects.toThrow('Unauthorized');
        expect(onUnauthorized).toHaveBeenCalledTimes(1);
    });

    it('rejects when the response is not ok', async () => {
        global.fetch = jest.fn().mockResolvedValue({ status: 500, ok: false });
        await expect(repository.updatePassword('new-pass')).rejects.toThrow('Update password failed: 500');
    });
});

describe('AjaxRepository UI settings getters and setters', () => {
    let repository;

    beforeEach(() => {
        jest.resetModules();
        window.localStorage.clear();
        global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
        repository = require('../src/repositories/AjaxRepository').default;
    });

    it('exposes the default in-memory values', () => {
        expect(repository.getShowText()).toBe(true);
        expect(repository.getShowExpired()).toBe(false);
        expect(repository.getDateTimeEnabled()).toBe(true);
        expect(repository.getZenMode()).toBe(false);
        expect(repository.getProjectGroupable()).toBe(true);
        expect(repository.getIconTheme()).toBe('light');
        expect(repository.getProjectFilter()).toBeNull();
        expect(repository.getProjectColors()).toEqual({});
        expect(repository.getTasks()).toEqual([]);
    });

    it('round-trips values through the setters', () => {
        repository.setShowText(false);
        repository.setShowExpired(true);
        repository.setDateTimeEnabled(false);
        repository.setZenMode(true);
        repository.setProjectGroupable(false);
        repository.setIconTheme('panda');
        repository.setProjectFilter('work');

        expect(repository.getShowText()).toBe(false);
        expect(repository.getShowExpired()).toBe(true);
        expect(repository.getDateTimeEnabled()).toBe(false);
        expect(repository.getZenMode()).toBe(true);
        expect(repository.getProjectGroupable()).toBe(false);
        expect(repository.getIconTheme()).toBe('panda');
        expect(repository.getProjectFilter()).toBe('work');
    });
});

describe('AjaxRepository projects and project colors', () => {
    let repository;

    beforeEach(async () => {
        jest.resetModules();
        window.localStorage.clear();
        global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
        repository = require('../src/repositories/AjaxRepository').default;
        await new Promise((resolve) => repository.fetchData(resolve));
        await repository.setTasks([
            { id: 1, project: 'work' },
            { id: 2, project: 'home' },
            { id: 3, project: 'work' },
            { id: 4 },
        ]);
    });

    it('getAllProjects returns unique project names', () => {
        expect(repository.getAllProjects().sort()).toEqual(['home', 'work']);
    });

    it('getAllFullProjects returns unique project objects', () => {
        expect(repository.getAllFullProjects()).toEqual([{ project: 'work' }, { project: 'home' }]);
    });

    it('sets and removes a project color', () => {
        repository.setProjectColor('work', '#00ff00');
        expect(repository.getProjectColors()).toEqual({ work: '#00ff00' });

        repository.removeProjectColor('work');
        expect(repository.getProjectColors()).toEqual({});
    });
});

describe('AjaxRepository logout', () => {
    let repository;

    beforeEach(() => {
        jest.resetModules();
        window.localStorage.clear();
        global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
        repository = require('../src/repositories/AjaxRepository').default;
    });

    it('clears the token, simplanner-prefixed keys, and resets in-memory state', async () => {
        repository.setAccessToken('tok');
        await flush();
        window.localStorage.setItem('unrelated-key', 'keep-me');

        repository.logout();

        expect(window.localStorage.getItem('simonegentili.com-access-token')).toBeNull();
        expect(window.localStorage.getItem('simplanner-tasks')).toBeNull();
        expect(window.localStorage.getItem('unrelated-key')).toBe('keep-me');
        expect(repository.getShowText()).toBe(false);
        expect(repository.getTasks()).toEqual([]);
    });
});
