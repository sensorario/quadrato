/* eslint-disable no-undef */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';

jest.mock('@sensorario/sg-components', () => ({
    QuadratoHeader: () => <div />,
    SGFooter: () => <div />,
    LanguageSwitcher: () => <div />,
    DateNav: jest.requireActual('@sensorario/sg-components').DateNav,
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
import { dayKey, monthDays, weekDays } from '../src/utils/taskDays';

const pad = (n: number) => String(n).padStart(2, '0');
// "YYYY-MM-DD HH:MM:SS" `days` from today, as the API sends due dates.
const due = (days: number, hour: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(hour)}:00:00`;
};
// The day after a "YYYY-MM-DD" one.
const dayAfter = (day: string) => {
    const [y, m, d] = day.split('-').map(Number);
    return dayKey(new Date(y, m - 1, d + 1));
};

const renderApp = async (tasks: any[] = [
    { id: 1, title: 'Due today', status: 0, timestamp: due(0, 23) },
    { id: 2, title: 'Due tomorrow', status: 0, timestamp: due(1, 9) },
    { id: 3, title: 'No due date', status: 0 },
    { id: 4, title: 'Late since yesterday', status: 1, timestamp: due(-1, 10) },
    { id: 5, title: 'Done yesterday', status: 2, timestamp: due(-1, 11) },
], projectFilter: string | null = 'ALL') => {
    localStorage.setItem('simonegentili.com-access-token', 'tok');
    (AjaxRepository as any).data['simplanner-tasks'] = tasks;
    (AjaxRepository as any).data['simplanner-project-filter'] = projectFilter;
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

    it('shows every overdue task in "Scaduti", whatever project is picked', async () => {
        await renderApp([
            { id: 1, title: 'Late at home', project: 'casa', status: 0, timestamp: due(-1, 10) },
            { id: 2, title: 'Late at work', project: 'lavoro', status: 0, timestamp: due(-2, 10) },
            { id: 3, title: 'Late, no project', status: 0, timestamp: due(-3, 10) },
        ], 'casa');

        fireEvent.click(screen.getByText('Tutti'));
        expect(screen.queryByText('Late at work')).toBeNull();

        fireEvent.click(screen.getByText('Scaduti'));
        for (const title of ['Late at home', 'Late at work', 'Late, no project']) {
            expect(screen.getByText(title)).toBeTruthy();
        }
        expect(screen.getByLabelText('4 task scaduti').textContent).toBe('4');
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

    it('shows the tasks due this week, Monday to Sunday, in "Settimana"', async () => {
        const [monday, sunday] = weekDays(new Date());
        await renderApp([
            { id: 1, title: 'Due on Monday', status: 2, timestamp: `${monday} 09:00:00` },
            { id: 2, title: 'Due on Sunday', status: 0, timestamp: `${sunday} 23:00:00` },
            { id: 3, title: 'Due next Monday', status: 0, timestamp: `${dayAfter(sunday)} 09:00:00` },
            { id: 4, title: 'No due date', status: 0 },
        ]);

        fireEvent.click(screen.getByText('Settimana'));

        expect(screen.getByText('Due on Monday')).toBeTruthy();
        expect(screen.getByText('Due on Sunday')).toBeTruthy();
        expect(screen.queryByText('Due next Monday')).toBeNull();
        expect(screen.queryByText('No due date')).toBeNull();
    });

    it('shows the tasks due this month in "Mese", following the project picked', async () => {
        const [first, last] = monthDays(new Date());
        await renderApp([
            { id: 1, title: 'Due on the first', project: 'casa', status: 0, timestamp: `${first} 09:00:00` },
            { id: 2, title: 'Due on the last', project: 'casa', status: 0, timestamp: `${last} 23:00:00` },
            { id: 3, title: 'Due next month', project: 'casa', status: 0, timestamp: `${dayAfter(last)} 09:00:00` },
            { id: 4, title: 'Due at work', project: 'lavoro', status: 0, timestamp: `${last} 10:00:00` },
        ], 'casa');

        fireEvent.click(screen.getByText('Mese'));

        expect(screen.getByText('Due on the first')).toBeTruthy();
        expect(screen.getByText('Due on the last')).toBeTruthy();
        expect(screen.queryByText('Due next month')).toBeNull();
        expect(screen.queryByText('Due at work')).toBeNull();
    });

    it('says when nothing is due this week', async () => {
        await renderApp([{ id: 1, title: 'No due date', status: 0 }]);

        fireEvent.click(screen.getByText('Settimana'));

        expect(screen.getByText('Nessun task da concludere questa settimana')).toBeTruthy();
    });
});

describe('a task added from a tab', () => {
    afterEach(() => localStorage.clear());

    // Adds a task from the new-task modal and gives back the due date sent to the API.
    const addTask = (title: string) => {
        fireEvent.click(screen.getByLabelText('Aggiungi nuovo task'));
        fireEvent.change(screen.getByPlaceholderText('Titolo del task'), { target: { value: title } });
        fireEvent.click(screen.getByText('Salva'));
        const post = (global.fetch as jest.Mock).mock.calls
            .find(([url, options]) => url.endsWith('/quadrato/task') && options?.method === 'POST');
        return JSON.parse(post[1].body).timestamp;
    };
    const at18 = (day: string) => new Date(`${day}T18:00`).getTime();

    it('is due at 18:00 of the day shown in "Per data"', async () => {
        await renderApp([]);
        fireEvent.click(screen.getByLabelText('Giorno successivo'));

        expect(addTask('Domani')).toBe(at18(dayAfter(dayKey(new Date()))));
    });

    it('is due at 18:00 of this week\'s Sunday in "Settimana"', async () => {
        await renderApp([]);
        fireEvent.click(screen.getByText('Settimana'));

        expect(addTask('In settimana')).toBe(at18(weekDays(new Date())[1]));
    });

    it('is due at 18:00 of the last day of the month in "Mese"', async () => {
        await renderApp([]);
        fireEvent.click(screen.getByText('Mese'));

        expect(addTask('Entro il mese')).toBe(at18(monthDays(new Date())[1]));
    });

    it('shows that due date in the form, under the title, while the task is typed', async () => {
        await renderApp([]);
        fireEvent.click(screen.getByText('Settimana'));
        fireEvent.click(screen.getByLabelText('Aggiungi nuovo task'));

        const [field] = screen.getAllByLabelText('Scadenza') as HTMLInputElement[];
        expect(field.closest('.tab-content')?.classList.contains('active')).toBe(true);
        expect(field.value).toBe(`${weekDays(new Date())[1]}T18:00`);
    });

    it('has no due date in "Tutti"', async () => {
        await renderApp([]);
        fireEvent.click(screen.getByText('Tutti'));

        expect(addTask('Quando capita')).toBe('');
    });
});
