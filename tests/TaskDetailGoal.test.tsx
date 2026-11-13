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

let mockTasks: object[] = [];
jest.mock('../src/repositories', () => ({
    getConfigRepository: () => ({
        getTasks: () => mockTasks,
        onDataLoaded: (cb: () => void) => cb(),
        onAuthenticated: () => { },
        onUnauthorized: () => { },
        fetchData: () => { },
    }),
}));

// A goal set elsewhere, without minutes and cadence (as the detail page's type picker makes it),
// gets them here: the tracker can't measure it until then.
describe('TaskDetailPage goal', () => {
    beforeEach(() => {
        localStorage.setItem('simonegentili.com-access-token', 'tok');
        global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 });
    });

    afterEach(() => {
        localStorage.clear();
        jest.restoreAllMocks();
    });

    it('asks for what a goal still misses and saves the cadence picked', async () => {
        mockTasks = [{ id: 't', title: '[goal] Leggere', status: 0 }];
        render(<TaskDetailPage taskId="t" />);

        expect(screen.getByText(/Scegli minuti e cadenza/)).toBeInTheDocument();
        fireEvent.change(screen.getByLabelText('Cadenza'), { target: { value: 'week' } });

        await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
            'https://api.simonegentili.com/quadrato/task/t',
            expect.objectContaining({ method: 'PUT', body: JSON.stringify({ goal: { cadence: 'week', minutes: 10 } }) }),
        ));
        expect(screen.queryByText(/Scegli minuti e cadenza/)).toBeNull();
    });

    it('saves new minutes, keeping the cadence', async () => {
        mockTasks = [{ id: 't', title: '[goal] Leggere', status: 0, goal: { cadence: 'month', minutes: 300 } }];
        render(<TaskDetailPage taskId="t" />);

        const minutes = screen.getByLabelText('Minuti');
        fireEvent.change(minutes, { target: { value: '120' } });
        fireEvent.blur(minutes);

        await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
            'https://api.simonegentili.com/quadrato/task/t',
            expect.objectContaining({ body: JSON.stringify({ goal: { cadence: 'month', minutes: 120 } }) }),
        ));
    });
});
