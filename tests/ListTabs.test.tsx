/* eslint-disable no-undef */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';

jest.mock('@sensorario/sg-components', () => ({
    QuadratoHeader: () => <div />,
    SGFooter: () => <div />,
    LanguageSwitcher: () => <div />,
    StepRange: ({ items, onChange }: any) => (
        <div>
            {items.map((item: any) => (
                <button key={item.value} data-testid={`level-${item.value}`} data-count={item.count} onClick={() => onChange(item.value)}>
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
import { dayKey } from '../src/utils/taskDays';

const pad = (n: number) => String(n).padStart(2, '0');
// "YYYY-MM-DD HH:MM:SS" `days` from today, as the API sends due dates.
const due = (days: number, hour: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(hour)}:00:00`;
};
// "YYYY-MM-DD" `days` from today.
const inDays = (days: number) => {
    const date = new Date();
    return dayKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() + days));
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

// The tasks on screen, among those named.
const shown = (...titles: string[]) => titles.filter((title) => screen.queryByText(title) !== null);
const pick = (level: string) => fireEvent.click(screen.getByTestId(`level-${level}`));

describe('list levels', () => {
    afterEach(() => localStorage.clear());

    it('goes from the overdue tasks to all of them, and opens on today', async () => {
        await renderApp();

        expect(['expired', 'day', 'week', 'month', 'all'].map((level) => screen.getByTestId(`level-${level}`).textContent))
            .toEqual(['Scaduti', 'Oggi', '7 giorni', '4 settimane', 'Tutti']);
        expect(screen.getByText('Gli scaduti e quelli in scadenza oggi')).toBeTruthy();
    });

    it('holds only the overdue tasks in "Scaduti", with those of the other workspaces', async () => {
        await renderApp();
        pick('expired');

        expect(shown('Due today', 'Due tomorrow', 'No due date', 'Late since yesterday', 'Done yesterday'))
            .toEqual(['Late since yesterday']);
        expect(screen.getByText('lavoro')).toBeTruthy();
        expect(screen.getByText(/Offerta da mandare/)).toBeTruthy();
    });

    it('adds the tasks due today in "Oggi", done ones included', async () => {
        await renderApp([
            { id: 1, title: 'Due today', status: 0, timestamp: due(0, 23) },
            { id: 2, title: 'Done today', status: 2, timestamp: due(0, 9) },
            { id: 3, title: 'Due tomorrow', status: 0, timestamp: due(1, 9) },
            { id: 4, title: 'Late since yesterday', status: 1, timestamp: due(-1, 10) },
            { id: 5, title: 'Done yesterday', status: 2, timestamp: due(-1, 11) },
        ]);

        expect(shown('Due today', 'Done today', 'Due tomorrow', 'Late since yesterday', 'Done yesterday'))
            .toEqual(['Due today', 'Done today', 'Late since yesterday']);
        expect(screen.getByText(/Offerta da mandare/)).toBeTruthy();
    });

    it('reaches 6 days from today in "7 giorni"', async () => {
        await renderApp([
            { id: 1, title: 'Late since yesterday', status: 0, timestamp: due(-1, 10) },
            { id: 2, title: 'Done today', status: 2, timestamp: due(0, 9) },
            { id: 3, title: 'Due in 6 days', status: 0, timestamp: due(6, 23) },
            { id: 4, title: 'Due in 7 days', status: 0, timestamp: due(7, 9) },
            { id: 5, title: 'No due date', status: 0 },
        ]);
        pick('week');

        expect(shown('Late since yesterday', 'Done today', 'Due in 6 days', 'Due in 7 days', 'No due date'))
            .toEqual(['Late since yesterday', 'Done today', 'Due in 6 days']);
        expect(screen.getByText(`Gli scaduti e quelli in scadenza fino al ${new Intl.DateTimeFormat('it', { day: 'numeric', month: 'long' }).format(new Date(`${inDays(6)}T00:00`))}`)).toBeTruthy();
    });

    it('reaches 27 days from today in "4 settimane"', async () => {
        await renderApp([
            { id: 1, title: 'Late since yesterday', status: 0, timestamp: due(-1, 10) },
            { id: 2, title: 'Due in 27 days', status: 0, timestamp: due(27, 23) },
            { id: 3, title: 'Due in 28 days', status: 0, timestamp: due(28, 9) },
        ]);
        pick('month');

        expect(shown('Late since yesterday', 'Due in 27 days', 'Due in 28 days')).toEqual(['Late since yesterday', 'Due in 27 days']);
    });

    it('holds every task in "Tutti", those with no due date too', async () => {
        await renderApp();
        pick('all');

        expect(shown('Due today', 'Due tomorrow', 'No due date', 'Late since yesterday', 'Done yesterday'))
            .toEqual(['Due today', 'Due tomorrow', 'No due date', 'Late since yesterday', 'Done yesterday']);
    });

    it('keeps the overdue tasks of every project, and the others only of the project picked', async () => {
        await renderApp([
            { id: 1, title: 'Late at work', project: 'lavoro', status: 0, timestamp: due(-1, 10) },
            { id: 2, title: 'Today at home', project: 'casa', status: 0, timestamp: due(0, 23) },
            { id: 3, title: 'Today at work', project: 'lavoro', status: 0, timestamp: due(0, 23) },
            { id: 4, title: 'Someday at work', project: 'lavoro', status: 0 },
        ], 'casa');

        expect(shown('Late at work', 'Today at home', 'Today at work')).toEqual(['Late at work', 'Today at home']);
        pick('all');
        expect(shown('Late at work', 'Today at home', 'Today at work', 'Someday at work')).toEqual(['Late at work', 'Today at home']);
    });

    it('counts on each level its tasks and those of the levels before, the other workspaces\' overdue ones included', async () => {
        await renderApp();

        expect(['expired', 'day', 'week', 'month', 'all'].map((level) => screen.getByTestId(`level-${level}`).dataset.count))
            .toEqual(['2', '3', '4', '4', '6']);
    });

    it('says when a level has no task', async () => {
        await renderApp([{ id: 1, title: 'No due date', status: 0 }]);

        expect(screen.getByText('Nessun task')).toBeTruthy();
    });
});

describe('a task added from a level', () => {
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

    it('is due at 18:00 of today in "Oggi"', async () => {
        await renderApp([]);

        expect(addTask('Oggi')).toBe(at18(inDays(0)));
    });

    it('is due at 18:00 of 6 days from today in "7 giorni"', async () => {
        await renderApp([]);
        pick('week');

        expect(addTask('In settimana')).toBe(at18(inDays(6)));
    });

    it('is due at 18:00 of 27 days from today in "4 settimane"', async () => {
        await renderApp([]);
        pick('month');

        expect(addTask('Entro il mese')).toBe(at18(inDays(27)));
    });

    it('shows that due date in the form, under the title, while the task is typed', async () => {
        await renderApp([]);
        pick('week');
        fireEvent.click(screen.getByLabelText('Aggiungi nuovo task'));

        const [field] = screen.getAllByLabelText('Scadenza') as HTMLInputElement[];
        expect(field.closest('.tab-content')?.classList.contains('active')).toBe(true);
        expect(field.value).toBe(`${inDays(6)}T18:00`);
    });

    it('has no due date in "Scaduti" and in "Tutti"', async () => {
        await renderApp([]);
        pick('expired');
        expect(addTask('Senza data')).toBe('');

        (global.fetch as jest.Mock).mockClear();
        pick('all');
        expect(addTask('Quando capita')).toBe('');
    });
});
