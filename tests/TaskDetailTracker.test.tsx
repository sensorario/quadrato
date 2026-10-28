/* eslint-disable no-undef */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskDetailPage } from '../src/pages/TaskDetailPage';

jest.mock('@sensorario/sg-components', () => ({
    QuadratoHeader: () => <div data-testid="header" />,
    Logo: () => <span />,
    Icon: (props: any) => <span aria-label={props['aria-label']} />,
}));

jest.mock('../src/Router', () => ({
    navigate: jest.fn(),
}));

jest.mock('../src/repositories', () => ({
    getConfigRepository: () => ({
        getTasks: () => [{ id: 't', title: '[bug] Crash al login', status: 0 }, { id: 'e', title: '[epic] Rilascio 2.0', status: 0 }],
        onDataLoaded: (cb: () => void) => cb(),
        onAuthenticated: () => { },
        onUnauthorized: () => { },
        fetchData: jest.fn(),
    }),
}));

const posted = (url: string) => expect(global.fetch).toHaveBeenCalledWith(url, expect.objectContaining({
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer tok' },
}));

describe('TaskDetailPage tracker', () => {
    beforeEach(() => {
        localStorage.setItem('simonegentili.com-access-token', 'tok');
        global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({}) });
        jest.spyOn(window, 'alert').mockImplementation(() => { });
    });

    afterEach(() => {
        localStorage.clear();
        jest.restoreAllMocks();
    });

    it('offers no tracker for an epic: its tasks are tracked instead', () => {
        render(<TaskDetailPage taskId="e" />);

        expect(screen.getAllByText('Rilascio 2.0').length).toBeGreaterThan(0);
        expect(screen.queryByRole('button', { name: 'Avvia' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Metti in coda' })).toBeNull();
    });

    it('starts a timebox described by the task title', async () => {
        render(<TaskDetailPage taskId="t" />);

        fireEvent.click(screen.getByRole('button', { name: 'Avvia' }));

        expect(await screen.findByRole('status')).toHaveTextContent('Avviato nel tracker.');
        posted('https://api.simonegentili.com/tome/timeboxes');
        expect((global.fetch as jest.Mock).mock.calls[0][1].body).toBe(JSON.stringify({ description: '[bug] Crash al login' }));
        expect(screen.getByRole('link', { name: 'Apri il tracker' })).toHaveAttribute('href', 'https://tome.simonegentili.com');
    });

    it('queues it, and asks the tracker to start it if it is free', async () => {
        render(<TaskDetailPage taskId="t" />);

        fireEvent.click(screen.getByRole('button', { name: 'Metti in coda' }));

        expect(await screen.findByRole('status')).toHaveTextContent('Messo in coda nel tracker.');
        posted('https://api.simonegentili.com/tome/queue');
        expect((global.fetch as jest.Mock).mock.calls[0][1].body).toBe(JSON.stringify({ description: '[bug] Crash al login' }));
        posted('https://api.simonegentili.com/tome/queue/advance');
    });

    it('says when another timebox is running, starting nothing', async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({ minutesSinceLastTimebox: 7 }) });
        render(<TaskDetailPage taskId="t" />);

        fireEvent.click(screen.getByRole('button', { name: 'Avvia' }));

        await waitFor(() => expect(window.alert).toHaveBeenCalledWith(
            "Nel tracker c'è già un timebox in corso, iniziato 7 minuti fa: mettilo in coda.",
        ));
        expect(screen.queryByRole('status')).toBeNull();
    });

    it('says when the task could not be queued', async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
        render(<TaskDetailPage taskId="t" />);

        fireEvent.click(screen.getByRole('button', { name: 'Metti in coda' }));

        await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Non è stato possibile mettere il task in coda nel tracker.'));
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });
});
