/* eslint-disable no-undef */
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { TaskDetailPage } from '../src/pages/TaskDetailPage';

jest.mock('@sensorario/sg-components', () => ({
    QuadratoHeader: () => <div data-testid="header" />,
    Logo: () => <span />,
    Icon: (props: any) => <span aria-label={props['aria-label']} />,
}));

const mockNavigate = jest.fn();
jest.mock('../src/Router', () => ({
    navigate: (...args: any[]) => mockNavigate(...args),
}));

let mockTasks: any[] = [];
const mockFetchData = jest.fn();
jest.mock('../src/repositories', () => ({
    getConfigRepository: () => ({
        getTasks: () => mockTasks,
        onDataLoaded: (cb: () => void) => cb(),
        onAuthenticated: () => { },
        onUnauthorized: () => { },
        fetchData: mockFetchData,
    }),
}));

describe('TaskDetailPage subtasks', () => {
    beforeEach(() => {
        localStorage.setItem('simonegentili.com-access-token', 'tok');
        mockTasks = [
            { id: 'p', title: 'Parent', status: 2, project: 'casa' },
            { id: 'c1', title: 'Child one', status: 2, parentId: 'p' },
            { id: 'g1', title: 'Grandchild', status: 3, parentId: 'c1' },
            { id: 'c2', title: 'Archived child', status: 2, parentId: 'p', archived: true },
            { id: 'x', title: 'Unrelated', status: 0 },
        ];
        mockFetchData.mockClear();
    });

    afterEach(() => {
        localStorage.clear();
        jest.restoreAllMocks();
    });

    it('lists every subtask at any depth, not archived ones nor unrelated tasks', () => {
        render(<TaskDetailPage taskId="p" />);

        const list = screen.getByRole('list', { name: 'Sotto-task' });
        expect(within(list).getByText('Child one')).toBeInTheDocument();
        expect(within(list).getByText('Grandchild')).toBeInTheDocument();
        expect(within(list).getByText('Grandchild').closest('li')).toHaveStyle({ paddingLeft: '20px' });
        expect(within(list).queryByText('Archived child')).not.toBeInTheDocument();
        expect(within(list).queryByText('Unrelated')).not.toBeInTheDocument();
    });

    it('opens a subtask detail when clicked', () => {
        render(<TaskDetailPage taskId="p" />);

        fireEvent.click(screen.getByText('Grandchild'));

        expect(mockNavigate).toHaveBeenCalledWith('/task/g1');
    });

    it('creates a subtask under the task and reopens it, since it was closed', async () => {
        global.fetch = jest.fn().mockImplementation((url: string, options: any) =>
            Promise.resolve({
                ok: true,
                status: 201,
                json: async () => options.method === 'POST'
                    ? { task: { id: 'new', title: 'Nuovo', status: 0, parentId: 'p', project: 'casa' } }
                    : {},
            })
        );
        render(<TaskDetailPage taskId="p" />);

        fireEvent.change(screen.getByRole('textbox', { name: 'Titolo del nuovo sotto-task' }), { target: { value: ' <b>Nuovo</b> ' } });
        fireEvent.click(screen.getByText('Aggiungi sotto-task'));

        await waitFor(() => expect(mockFetchData).toHaveBeenCalled());
        const calls = (global.fetch as jest.Mock).mock.calls;
        const post = calls.find(([, o]) => o.method === 'POST');
        expect(JSON.parse(post[1].body)).toMatchObject({ title: 'Nuovo', parentId: 'p', project: 'casa', status: 0 });
        const put = calls.find(([url, o]) => o.method === 'PUT' && url.endsWith('/task/p'));
        expect(JSON.parse(put[1].body)).toEqual({ status: 0 });
    });

    it('puts the focus in the new-subtask field when the task opens', () => {
        render(<TaskDetailPage taskId="p" />);

        expect(screen.getByRole('textbox', { name: 'Titolo del nuovo sotto-task' })).toHaveFocus();
    });

    it('empties the field on Enter and keeps the focus there, to type the next one at once', async () => {
        global.fetch = jest.fn().mockImplementation((url: string, options: any) =>
            Promise.resolve({
                ok: true,
                status: 201,
                json: async () => options.method === 'POST'
                    ? { task: { id: `new-${JSON.parse(options.body).title}`, title: JSON.parse(options.body).title, status: 0, parentId: 'p' } }
                    : {},
            })
        );
        render(<TaskDetailPage taskId="p" />);
        const input = screen.getByRole('textbox', { name: 'Titolo del nuovo sotto-task' });

        fireEvent.change(input, { target: { value: 'Primo' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(input).toHaveValue('');
        expect(input).toHaveFocus();

        fireEvent.change(input, { target: { value: 'Secondo' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        await waitFor(() => expect(mockFetchData).toHaveBeenCalledTimes(2));
        const titles = (global.fetch as jest.Mock).mock.calls
            .filter(([, o]) => o.method === 'POST')
            .map(([, o]) => JSON.parse(o.body).title);
        expect(titles).toEqual(['Primo', 'Secondo']);
        expect(input).toHaveFocus();
    });

    it('brings the focus back to the field after adding with the button', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 201,
            json: async () => ({ task: { id: 'new', title: 'Primo', status: 0, parentId: 'p' } }),
        });
        render(<TaskDetailPage taskId="p" />);
        const input = screen.getByRole('textbox', { name: 'Titolo del nuovo sotto-task' });

        fireEvent.change(input, { target: { value: 'Primo' } });
        const button = screen.getByText('Aggiungi sotto-task');
        button.focus();
        fireEvent.click(button);

        expect(input).toHaveFocus();
        await waitFor(() => expect(mockFetchData).toHaveBeenCalled());
    });

    it('puts the title back when the subtask cannot be added', async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
        const alert = jest.spyOn(window, 'alert').mockImplementation(() => { });
        render(<TaskDetailPage taskId="p" />);
        const input = screen.getByRole('textbox', { name: 'Titolo del nuovo sotto-task' });

        fireEvent.change(input, { target: { value: 'Primo' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        await waitFor(() => expect(alert).toHaveBeenCalled());
        expect(input).toHaveValue('Primo');
    });

    it('shows the parent and opens it when clicked', () => {
        render(<TaskDetailPage taskId="g1" />);

        expect(screen.getByText('Task padre')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Child one' }));

        expect(mockNavigate).toHaveBeenCalledWith('/task/c1');
    });

    it('shows no parent field for a top-level task', () => {
        render(<TaskDetailPage taskId="p" />);

        expect(screen.queryByText('Task padre')).not.toBeInTheDocument();
    });

    it('shows a placeholder when there are no subtasks', () => {
        render(<TaskDetailPage taskId="x" />);

        expect(screen.getByText('Nessun sotto-task')).toBeInTheDocument();
    });

    it('links to the Gantt\'s route of the task\'s project, or of the tasks without one', () => {
        mockTasks.push({ id: 'w', title: 'Ufficio', status: 0, project: "Lavoro d'ufficio" });
        const { unmount } = render(<TaskDetailPage taskId="p" />);
        expect(screen.getByRole('link', { name: 'Apri nel Gantt' })).toHaveAttribute('href', 'https://gantt.simonegentili.com/progetto/casa');
        unmount();

        const { unmount: unmountOffice } = render(<TaskDetailPage taskId="w" />);
        expect(screen.getByRole('link', { name: 'Apri nel Gantt' })).toHaveAttribute('href', "https://gantt.simonegentili.com/progetto/Lavoro%20d'ufficio");
        unmountOffice();

        render(<TaskDetailPage taskId="x" />);
        expect(screen.getByRole('link', { name: 'Apri nel Gantt' })).toHaveAttribute('href', 'https://gantt.simonegentili.com/senza-progetto');
    });
});

describe('TaskDetailPage subtasks reordering', () => {
    // jsdom has no PointerEvent: without it fireEvent drops clientY and button. Nor DOMMatrix,
    // which reads how far a sliding row is drawn from its place: here never mid-slide.
    beforeAll(() => {
        (window as unknown as { PointerEvent: unknown }).PointerEvent ??= class extends MouseEvent { };
        (window as unknown as { DOMMatrixReadOnly: unknown }).DOMMatrixReadOnly ??= class { m42 = 0; };
    });

    beforeEach(() => {
        localStorage.setItem('simonegentili.com-access-token', 'tok');
        mockTasks = [
            { id: 'p', title: 'Parent', status: 0 },
            { id: 'a', title: 'First', status: 0, parentId: 'p' },
            { id: 'a1', title: 'Under first', status: 0, parentId: 'a' },
            { id: 'b', title: 'Second', status: 0, parentId: 'p' },
            { id: 'c', title: 'Third', status: 0, parentId: 'p' },
        ];
        mockFetchData.mockClear();
        global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    });

    afterEach(() => {
        localStorage.clear();
        jest.restoreAllMocks();
    });

    // jsdom has no layout: each row is 20px high, laid out in DOM order, so a reordered row moves.
    const stackRows = () => {
        within(screen.getByRole('list', { name: 'Sotto-task' })).getAllByRole('listitem').forEach(li => {
            Object.defineProperty(li, 'offsetTop', { configurable: true, get: () => Array.from(li.parentElement?.children ?? []).indexOf(li) * 20 });
            Object.defineProperty(li, 'offsetHeight', { configurable: true, value: 20 });
        });
    };
    const row = (title: string) => screen.getByText(title).closest('li') as HTMLLIElement;
    const grip = (title: string) => within(row(title)).getByLabelText('Trascina per riordinare');
    // Each row's button: the status label, then the title.
    const titles = () => within(screen.getByRole('list', { name: 'Sotto-task' })).getAllByRole('listitem')
        .map(li => li.querySelector('button') as HTMLButtonElement)
        .map(button => button.textContent?.replace(button.querySelector('span')?.textContent ?? '', ''));
    const putBodies = () => Object.fromEntries((global.fetch as jest.Mock).mock.calls
        .filter(([, o]) => o.method === 'PUT')
        .map(([url, o]) => [url.split('/').pop(), JSON.parse(o.body)]));

    it('moves a subtask, with its own subtasks, below the next one and saves the positions', async () => {
        render(<TaskDetailPage taskId="p" />);
        stackRows();

        // Rows: First 0-20, Under first 20-40, Second 40-60, Third 60-80.
        fireEvent.pointerDown(grip('First'), { button: 0, clientY: 10 });
        fireEvent.pointerMove(window, { clientY: 65 });
        expect(titles()).toEqual(['Second', 'First', 'Under first', 'Third']);
        fireEvent.pointerUp(window);

        await waitFor(() => expect(mockFetchData).toHaveBeenCalled());
        expect(putBodies()).toEqual({ b: { position: 0 }, a: { position: 1 }, c: { position: 2 } });
        expect(titles()).toEqual(['Second', 'First', 'Under first', 'Third']);
    });

    it('keeps the dragged rows under the pointer, slides the others, and slides them into place on release', () => {
        render(<TaskDetailPage taskId="p" />);
        stackRows();

        fireEvent.pointerDown(grip('First'), { button: 0, clientY: 10 });
        fireEvent.pointerMove(window, { clientY: 65 });

        // Pointer 55px down, First and its subtask laid out 20px lower: drawn 35px further.
        expect(row('First').style.transform).toBe('translateY(35px)');
        expect(row('Under first').style.transform).toBe('translateY(35px)');
        expect(row('Second').style.transition).toBe('transform 200ms ease');

        fireEvent.pointerUp(window);

        expect(row('First').style.transform).toBe('');
        expect(row('First').style.transition).toBe('transform 200ms ease');
    });

    it('keeps a subtask among its siblings, never under another task', async () => {
        mockTasks.push({ id: 'a2', title: 'Second under first', status: 0, parentId: 'a' });
        render(<TaskDetailPage taskId="p" />);
        stackRows();

        // Rows: First, Under first, Second under first, Second, Third: dragged to the very bottom.
        fireEvent.pointerDown(grip('Under first'), { button: 0, clientY: 30 });
        fireEvent.pointerMove(window, { clientY: 95 });
        fireEvent.pointerUp(window);

        await waitFor(() => expect(mockFetchData).toHaveBeenCalled());
        expect(titles()).toEqual(['First', 'Second under first', 'Under first', 'Second', 'Third']);
        expect(putBodies()).toEqual({ a2: { position: 0 }, a1: { position: 1 } });
    });

    it('saves nothing when the grip is released where it was', () => {
        render(<TaskDetailPage taskId="p" />);
        stackRows();

        fireEvent.pointerDown(grip('Second'), { button: 0, clientY: 50 });
        fireEvent.pointerUp(window);

        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('moves subtasks with a due date too, and keeps them where they were dropped', async () => {
        mockTasks.push({ id: 'd', title: 'Dated', status: 0, parentId: 'p', timestamp: '2026-11-01 09:00:00' });
        render(<TaskDetailPage taskId="p" />);
        expect(titles()).toEqual(['Dated', 'First', 'Under first', 'Second', 'Third']);
        stackRows();

        fireEvent.pointerDown(grip('Dated'), { button: 0, clientY: 10 });
        fireEvent.pointerMove(window, { clientY: 105 });
        fireEvent.pointerUp(window);

        await waitFor(() => expect(mockFetchData).toHaveBeenCalled());
        expect(titles()).toEqual(['First', 'Under first', 'Second', 'Third', 'Dated']);
        expect(putBodies()).toEqual({ a: { position: 0 }, b: { position: 1 }, c: { position: 2 }, d: { position: 3 } });
    });

    it('shows the order picked here before date and status, and the subtasks never placed after', () => {
        mockTasks = mockTasks.map(t =>
            t.id === 'a' ? { ...t, status: 2, position: 1 }
                : t.id === 'b' ? { ...t, timestamp: '2026-11-01 09:00:00', position: 0 }
                    : t
        );
        render(<TaskDetailPage taskId="p" />);

        expect(titles()).toEqual(['Second', 'First', 'Under first', 'Third']);
    });

    it('puts the order back when it cannot be saved', async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
        const alert = jest.spyOn(window, 'alert').mockImplementation(() => { });
        render(<TaskDetailPage taskId="p" />);
        stackRows();

        fireEvent.pointerDown(grip('Third'), { button: 0, clientY: 70 });
        fireEvent.pointerMove(window, { clientY: 5 });
        fireEvent.pointerUp(window);

        await waitFor(() => expect(alert).toHaveBeenCalledWith('Non è stato possibile salvare il nuovo ordine dei sotto-task.'));
        expect(titles()).toEqual(['First', 'Under first', 'Second', 'Third']);
    });
});

describe('TaskDetailPage status', () => {
    beforeEach(() => {
        localStorage.setItem('simonegentili.com-access-token', 'tok');
        mockTasks = [
            { id: 'p', title: 'Parent', status: 0 },
            { id: 'c1', title: 'Done child', status: 2, parentId: 'p' },
            { id: 'c2', title: 'Open child', status: 0, parentId: 'p' },
        ];
        mockFetchData.mockClear();
        global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    });

    afterEach(() => {
        localStorage.clear();
        jest.restoreAllMocks();
    });

    const statusButton = (label: string) =>
        within(screen.getByRole('group', { name: 'Stato' })).getByRole('button', { name: label });
    const putBodies = () => Object.fromEntries((global.fetch as jest.Mock).mock.calls
        .filter(([, o]) => o.method === 'PUT')
        .map(([url, o]) => [url.split('/').pop(), JSON.parse(o.body)]));

    it('changes the status, and closes the parent with its last open subtask', async () => {
        render(<TaskDetailPage taskId="c2" />);
        expect(statusButton('Da fare')).toHaveAttribute('aria-pressed', 'true');

        fireEvent.click(statusButton('Completato'));

        expect(statusButton('Completato')).toHaveAttribute('aria-pressed', 'true');
        await waitFor(() => expect(mockFetchData).toHaveBeenCalled());
        expect(putBodies()).toEqual({ c2: { status: 2 }, p: { status: 2 } });
    });

    it('cannot close a task while a subtask is open', () => {
        render(<TaskDetailPage taskId="p" />);

        expect(statusButton('Completato')).toBeDisabled();
        expect(statusButton('Saltato')).toBeDisabled();
        expect(statusButton('In corso')).toBeEnabled();
    });

    it('puts the status back when it cannot be saved', async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
        const alert = jest.spyOn(window, 'alert').mockImplementation(() => { });
        render(<TaskDetailPage taskId="c2" />);

        fireEvent.click(statusButton('In corso'));

        await waitFor(() => expect(alert).toHaveBeenCalledWith('Non è stato possibile cambiare lo stato del task.'));
        expect(statusButton('Da fare')).toHaveAttribute('aria-pressed', 'true');
    });
});
