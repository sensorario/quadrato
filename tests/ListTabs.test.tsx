/* eslint-disable no-undef */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';

jest.mock('@sensorario/sg-components', () => ({
    QuadratoHeader: () => <div />,
    SGFooter: () => <div />,
    LanguageSwitcher: () => <div />,
    Tabs: ({ items, onChange }: any) => (
        <div>
            {items.map((item: any) => (
                <button key={item.value} onClick={() => onChange(item.value)}>
                    {item.label}
                </button>
            ))}
        </div>
    ),
    Icon: (props: any) => <span aria-label={props['aria-label'] ?? props.name} />,
}));
jest.mock('../src/components/InfoPanel', () => () => null);
jest.mock('../src/components/TaskProjectSelector', () => () => null);

import App from '../src/App';
import AjaxRepository from '../src/repositories/AjaxRepository';

const pad = (n: number) => String(n).padStart(2, '0');
// "YYYY-MM-DD HH:MM:SS" `days` from today, as the API sends due dates.
const due = (days: number, hour: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(hour)}:00:00`;
};

const renderApp = async () => {
    localStorage.setItem('simonegentili.com-access-token', 'tok');
    (AjaxRepository as any).data['simplanner-tasks'] = [
        { id: 1, title: 'Due today', status: 0, timestamp: due(0, 23) },
        { id: 2, title: 'Due tomorrow', status: 0, timestamp: due(1, 9) },
        { id: 3, title: 'No due date', status: 0 },
        { id: 4, title: 'Late since yesterday', status: 1, timestamp: due(-1, 10) },
        { id: 5, title: 'Done yesterday', status: 2, timestamp: due(-1, 11) },
    ];
    global.fetch = jest.fn().mockImplementation(async (url: string) => ({
        ok: true,
        status: 200,
        json: async () => url.endsWith('/quadrato/workspaces')
            ? {
                workspaces: [{ name: 'default', current: true }],
                expired_tasks: [
                    { workspace: 'default', description: 'Late since yesterday', uuid: '4' },
                    { workspace: 'lavoro', description: 'Offerta da mandare', uuid: 'w-1' },
                ],
            }
            : {},
    }));
    render(<App />);
    await act(async () => { });
};

describe('list tabs', () => {
    afterEach(() => localStorage.clear());

    it('opens on the tasks due today, and moves from day to day', async () => {
        await renderApp();

        expect(screen.getByText('Due today')).toBeTruthy();
        expect(screen.queryByText('Due tomorrow')).toBeNull();
        expect(screen.queryByText('No due date')).toBeNull();
        expect(screen.queryByText('Late since yesterday')).toBeNull();

        fireEvent.click(screen.getByLabelText('Giorno successivo'));
        expect(screen.getByText('Due tomorrow')).toBeTruthy();
        expect(screen.queryByText('Due today')).toBeNull();

        fireEvent.click(screen.getByLabelText('Giorno precedente'));
        fireEvent.click(screen.getByLabelText('Giorno precedente'));
        expect(screen.getByText('Late since yesterday')).toBeTruthy();
        expect(screen.getByText('Done yesterday')).toBeTruthy();
    });

    it('shows every task in "Tutti"', async () => {
        await renderApp();

        fireEvent.click(screen.getByText('Tutti'));

        for (const title of ['Due today', 'Due tomorrow', 'No due date', 'Late since yesterday']) {
            expect(screen.getByText(title)).toBeTruthy();
        }
    });

    it('counts the overdue ones, here and in the other workspaces', async () => {
        await renderApp();

        expect(screen.getByLabelText('2 task scaduti').textContent).toBe('2');
        fireEvent.click(screen.getByText('Scaduti'));

        expect(screen.getByText('Late since yesterday')).toBeTruthy();
        expect(screen.queryByText('Done yesterday')).toBeNull();
        expect(screen.queryByText('Due today')).toBeNull();
        expect(screen.getByText('lavoro')).toBeTruthy();
        expect(screen.getByText(/Offerta da mandare/)).toBeTruthy();
    });
});
