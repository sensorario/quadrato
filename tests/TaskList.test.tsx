/* eslint-disable no-undef */
import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { TaskList } from '../src/components/TaskList';

const tasks = [
    { id: 1, title: 'Task one', status: 0, project: 'Alpha' },
    { id: 2, title: 'Task two', status: 0, project: 'Alpha' },
];

describe('TaskList project label', () => {
    it('hides the project label when it matches the active project filter', () => {
        render(
            <TaskList
                tasks={tasks}
                onTaskClick={() => { }}
                updateTaskTitle={() => { }}
                editable={false}
                projectEditable={true}
                dateTimeEnabled={false}
                iconTheme="default"
                projectFilter="Alpha"
            />
        );
        expect(screen.queryByText('(Alpha)')).not.toBeInTheDocument();
    });

    it('shows the project label when no project filter is active', () => {
        render(
            <TaskList
                tasks={tasks}
                onTaskClick={() => { }}
                updateTaskTitle={() => { }}
                editable={false}
                projectEditable={true}
                dateTimeEnabled={false}
                iconTheme="default"
                projectFilter="ALL"
            />
        );
        expect(screen.getAllByText('(Alpha)')).toHaveLength(2);
    });
});

describe('TaskList task type icon', () => {
    const renderList = (title: string) => render(
        <TaskList
            tasks={[{ id: 1, title, status: 0 }]}
            onTaskClick={() => { }}
            updateTaskTitle={() => { }}
            editable={false}
            projectEditable={false}
            dateTimeEnabled={false}
            iconTheme="default"
        />
    );

    it('renders the bug icon and strips the [BUG] prefix from the title', () => {
        renderList('[BUG] Fix login crash');
        expect(screen.getByLabelText('bug')).toBeInTheDocument();
        expect(screen.queryByLabelText('feature')).not.toBeInTheDocument();
        expect(screen.getByText('Fix login crash')).toBeInTheDocument();
        expect(screen.queryByText(/\[BUG\]/)).not.toBeInTheDocument();
    });

    it('renders the feature icon and strips the [FEATURE] prefix from the title, case-insensitively', () => {
        renderList('[feature] Add CSV export');
        expect(screen.getByLabelText('feature')).toBeInTheDocument();
        expect(screen.queryByLabelText('bug')).not.toBeInTheDocument();
        expect(screen.getByText('Add CSV export')).toBeInTheDocument();
    });

    it('renders the pay icon and strips the [PAY] prefix from the title', () => {
        renderList('[PAY] Electricity bill');
        expect(screen.getByLabelText('pay')).toBeInTheDocument();
        expect(screen.queryByLabelText('bug')).not.toBeInTheDocument();
        expect(screen.getByText('Electricity bill')).toBeInTheDocument();
        expect(screen.queryByText(/\[PAY\]/)).not.toBeInTheDocument();
    });

    it('renders the spike icon and strips the [SPIKE] prefix from the title', () => {
        renderList('[SPIKE] Compare chart libraries');
        expect(screen.getByLabelText('spike')).toBeInTheDocument();
        expect(screen.queryByLabelText('bug')).not.toBeInTheDocument();
        expect(screen.getByText('Compare chart libraries')).toBeInTheDocument();
        expect(screen.queryByText(/\[SPIKE\]/)).not.toBeInTheDocument();
    });

    it('renders no type icon when the title has no prefix', () => {
        renderList('Plain task');
        expect(screen.queryByLabelText('bug')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('feature')).not.toBeInTheDocument();
    });
});

// jsdom has no PointerEvent: without it fireEvent drops clientY, button and pointerType.
beforeAll(() => {
    class PointerEventPolyfill extends MouseEvent {
        pointerType: string;
        constructor(type: string, init: PointerEventInit = {}) {
            super(type, init);
            this.pointerType = init.pointerType ?? '';
        }
    }
    (window as unknown as { PointerEvent: unknown }).PointerEvent ??= PointerEventPolyfill;
});

// jsdom has no layout: give each row a 100x20 box stacked by DOM order.
const stackRows = (container: HTMLElement) => {
    container.querySelectorAll('li').forEach((li, i) => {
        li.getBoundingClientRect = () => ({ top: i * 20, height: 20, bottom: i * 20 + 20, left: 0, right: 100, width: 100, x: 0, y: i * 20, toJSON: () => ({}) });
    });
};

describe('TaskList drag and drop', () => {
    const undated = [
        { id: 1, title: 'First', status: 0 },
        { id: 2, title: 'Second', status: 0 },
        { id: 3, title: 'Third', status: 0 },
    ];

    const renderList = (list: object[], onReorder: jest.Mock, onTaskClick = jest.fn()) => {
        const utils = render(
            <TaskList
                tasks={list as never}
                onTaskClick={onTaskClick}
                updateTaskTitle={() => { }}
                onReorder={onReorder}
                editable={false}
                projectEditable={false}
                dateTimeEnabled={false}
                iconTheme="default"
            />
        );
        stackRows(utils.container);
        return utils;
    };

    const row = (title: string) => screen.getByText(title).closest('li') as HTMLLIElement;
    const grip = (title: string) => within(row(title)).getByLabelText('Trascina per riordinare');

    it('moves a task after dragging its grip below another one', () => {
        const onReorder = jest.fn();
        renderList(undated, onReorder);

        fireEvent.pointerDown(grip('First'), { button: 0, clientX: 10, clientY: 10 });
        fireEvent.pointerMove(window, { clientX: 10, clientY: 35 });
        fireEvent.pointerUp(window);

        expect(onReorder).toHaveBeenCalledWith(1, null, [2, 1, 3]);
    });

    it('does not reorder when the grip is released where it was', () => {
        const onReorder = jest.fn();
        renderList(undated, onReorder);

        fireEvent.pointerDown(grip('First'), { button: 0, clientX: 10, clientY: 10 });
        fireEvent.pointerUp(window);

        expect(onReorder).not.toHaveBeenCalled();
    });

    it('does not start a drag from the rest of the row', () => {
        const onReorder = jest.fn();
        renderList(undated, onReorder);

        fireEvent.pointerDown(screen.getByText('First'), { button: 0, clientX: 10, clientY: 10 });
        fireEvent.pointerMove(window, { clientX: 10, clientY: 35 });
        fireEvent.pointerUp(window);

        expect(onReorder).not.toHaveBeenCalled();
    });

    it('shows the grip on tasks with a due date too, so they can be nested', () => {
        renderList([{ id: 9, title: 'Dated', status: 0, timestamp: 1000 }, ...undated], jest.fn());

        expect(within(row('Dated')).getByLabelText('Trascina per riordinare')).toBeInTheDocument();
        expect(within(row('First')).getByLabelText('Trascina per riordinare')).toBeInTheDocument();
    });

    it('makes a task a subtask of the row above when dragged slightly to the right', () => {
        const onReorder = jest.fn();
        renderList(undated, onReorder);

        fireEvent.pointerDown(grip('Second'), { button: 0, clientX: 10, clientY: 30 });
        fireEvent.pointerMove(window, { clientX: 40, clientY: 30 });
        fireEvent.pointerUp(window);

        expect(onReorder).toHaveBeenCalledWith(2, 1, [2]);
    });

    it('brings a subtask back up a level when dragged to the left', () => {
        const onReorder = jest.fn();
        renderList([{ id: 1, title: 'First', status: 0 }, { id: 2, title: 'Second', status: 0, parentId: 1 }], onReorder);

        fireEvent.pointerDown(grip('Second'), { button: 0, clientX: 40, clientY: 30 });
        fireEvent.pointerMove(window, { clientX: 10, clientY: 30 });
        fireEvent.pointerUp(window);

        expect(onReorder).toHaveBeenCalledWith(2, null, [1, 2]);
    });

    it('cannot go above the top level', () => {
        const onReorder = jest.fn();
        renderList(undated, onReorder);

        fireEvent.pointerDown(grip('Second'), { button: 0, clientX: 40, clientY: 30 });
        fireEvent.pointerMove(window, { clientX: 0, clientY: 30 });
        fireEvent.pointerUp(window);

        expect(onReorder).not.toHaveBeenCalled();
    });

    it('moves a task together with its subtasks', () => {
        const onReorder = jest.fn();
        renderList([
            { id: 1, title: 'First', status: 0, position: 0 },
            { id: 2, title: 'Second', status: 0, parentId: 1 },
            { id: 3, title: 'Third', status: 0, position: 1 },
        ], onReorder);

        fireEvent.pointerDown(grip('First'), { button: 0, clientX: 10, clientY: 10 });
        fireEvent.pointerMove(window, { clientX: 10, clientY: 55 });
        fireEvent.pointerUp(window);

        expect(onReorder).toHaveBeenCalledWith(1, null, [3, 1]);
    });

    it('indents subtasks by their depth', () => {
        renderList([
            { id: 1, title: 'First', status: 0 },
            { id: 2, title: 'Second', status: 0, parentId: 1 },
            { id: 3, title: 'Third', status: 0, parentId: 2 },
        ], jest.fn());

        expect(row('First').style.paddingLeft).toBe('4px');
        expect(row('Second').style.paddingLeft).toBe('28px');
        expect(row('Third').style.paddingLeft).toBe('52px');
    });
});

describe('TaskList area selection', () => {
    const list = [
        { id: 1, title: 'First', status: 0, timestamp: 1000 },
        { id: 2, title: 'Second', status: 0, timestamp: 2000 },
        { id: 3, title: 'Third', status: 0 },
    ];

    const renderList = (onClearDueDates: jest.Mock, onTaskClick = jest.fn()) => {
        const utils = render(
            <TaskList
                tasks={list as never}
                onTaskClick={onTaskClick}
                updateTaskTitle={() => { }}
                onClearDueDates={onClearDueDates}
                editable={false}
                projectEditable={false}
                dateTimeEnabled={false}
                iconTheme="default"
            />
        );
        stackRows(utils.container);
        return utils;
    };

    const dragArea = (from: { x: number; y: number }, to: { x: number; y: number }, pointerType = 'mouse') => {
        fireEvent.pointerDown(screen.getByText('First'), { button: 0, clientX: from.x, clientY: from.y, pointerType });
        fireEvent.pointerMove(window, { clientX: to.x, clientY: to.y, pointerType });
        fireEvent.pointerUp(window, { pointerType });
    };

    it('selects the tasks inside the area and opens the modal', () => {
        renderList(jest.fn());

        dragArea({ x: 10, y: 5 }, { x: 50, y: 25 });

        expect(screen.getByText('Task selezionati: 2. Cosa vuoi fare?')).toBeInTheDocument();
    });

    it('removes the due date from all the selected tasks', async () => {
        const onClearDueDates = jest.fn();
        renderList(onClearDueDates);

        dragArea({ x: 10, y: 5 }, { x: 50, y: 25 });
        fireEvent.click(screen.getByText('Rimuovi scadenza'));

        await waitFor(() => expect(onClearDueDates).toHaveBeenCalledWith([1, 2]));
    });

    it('does not open the modal on a plain click, which still toggles the status', () => {
        const onTaskClick = jest.fn();
        renderList(jest.fn(), onTaskClick);

        const status = screen.getByText('First').closest('li')!.querySelector('span > span') as HTMLElement;
        fireEvent.pointerDown(status, { button: 0, clientX: 10, clientY: 5, pointerType: 'mouse' });
        fireEvent.pointerUp(window, { pointerType: 'mouse' });
        fireEvent.click(status);

        expect(screen.queryByText('Rimuovi scadenza')).not.toBeInTheDocument();
        expect(onTaskClick).toHaveBeenCalledWith(1);
    });

    it('does not start a selection with touch', () => {
        renderList(jest.fn());

        dragArea({ x: 10, y: 5 }, { x: 50, y: 25 }, 'touch');

        expect(screen.queryByText('Rimuovi scadenza')).not.toBeInTheDocument();
    });
});

describe('TaskList selection actions', () => {
    const list = [
        { id: 1, title: 'First', status: 2, timestamp: 1000, project: 'casa' },
        { id: 2, title: 'Second', status: 0, timestamp: 2000 },
        { id: 3, title: 'Third', status: 3 },
    ];

    const renderList = (props: Partial<React.ComponentProps<typeof TaskList>> = {}) => {
        const utils = render(
            <TaskList
                tasks={list as never}
                onTaskClick={jest.fn()}
                updateTaskTitle={() => { }}
                onClearDueDates={jest.fn()}
                editable={false}
                projectEditable={false}
                dateTimeEnabled={false}
                iconTheme="default"
                {...props}
            />
        );
        stackRows(utils.container);
        return utils;
    };

    const selectFirstTwo = () => {
        fireEvent.pointerDown(screen.getByText('First'), { button: 0, clientX: 10, clientY: 5, pointerType: 'mouse' });
        fireEvent.pointerMove(window, { clientX: 50, clientY: 25, pointerType: 'mouse' });
        fireEvent.pointerUp(window, { pointerType: 'mouse' });
    };

    it('archives only the completed or skipped tasks of the selection', async () => {
        const onArchive = jest.fn();
        renderList({ onArchive });

        selectFirstTwo();
        fireEvent.click(screen.getByText('Archivia completati e saltati (1)'));

        await waitFor(() => expect(onArchive).toHaveBeenCalledWith([1]));
    });

    it('offers no archiving when nothing selected is completed or skipped', () => {
        renderList({ onArchive: jest.fn(), tasks: list.map(t => ({ ...t, status: 0 })) as never });

        selectFirstTwo();

        expect(screen.queryByText(/Archivia/)).not.toBeInTheDocument();
    });

    it('deletes only after a second confirmation', async () => {
        const onDelete = jest.fn();
        renderList({ onDelete });

        selectFirstTwo();
        fireEvent.click(screen.getByText('Elimina'));
        expect(onDelete).not.toHaveBeenCalled();

        fireEvent.click(await screen.findByText('Elimina (2)'));
        await waitFor(() => expect(onDelete).toHaveBeenCalledTimes(1));
        expect([...onDelete.mock.calls[0][0]].sort()).toEqual([1, 2]);
    });

    it('moves the selected tasks to a new project typed in the search field', () => {
        const onChangeProject = jest.fn();
        renderList({ onChangeProject });

        selectFirstTwo();
        fireEvent.change(screen.getByRole('textbox', { name: 'Progetto' }), { target: { value: ' spesa ' } });
        fireEvent.click(screen.getByText('Nuovo progetto: spesa'));
        fireEvent.click(screen.getByText('Sposta nel progetto'));

        expect([...onChangeProject.mock.calls[0][0]].sort()).toEqual([1, 2]);
        expect(onChangeProject.mock.calls[0][1]).toBe('spesa');
        expect(onChangeProject.mock.calls[0][2]).toBeUndefined();
    });

    it('does nothing until a project is chosen', () => {
        const onChangeProject = jest.fn();
        renderList({ onChangeProject });

        selectFirstTwo();
        fireEvent.click(screen.getByText('Sposta nel progetto'));

        expect(onChangeProject).not.toHaveBeenCalled();
    });

    it('offers every project of the workspace, not only those of the tasks on screen', () => {
        renderList({ onChangeProject: jest.fn(), workspaceProjects: ['casa', 'INCANTESIMI'] });

        selectFirstTwo();
        const picker = screen.getByRole('list', { name: 'Progetto' });

        expect(within(picker).getByText('INCANTESIMI')).toBeInTheDocument();
    });

    const ownProjects = [
        { id: 'p-1', name: 'casa', workspace: 'default', workspaceUuid: 'ws-default' },
        { id: 'p-2', name: 'Cantiere', workspace: 'lavoro', workspaceUuid: 'ws-lavoro' },
        { id: 'p-3', name: 'Blog', workspace: 'lavoro', workspaceUuid: 'ws-lavoro' },
    ];

    const workspaces = [
        { id: 'ws-default', name: 'default' },
        { id: 'ws-lavoro', name: 'lavoro' },
    ];

    it('lists only the projects of the chosen workspace, filtered by the search field', async () => {
        renderList({ onChangeProject: jest.fn(), loadProjects: () => Promise.resolve(ownProjects), currentWorkspace: 'default', workspaces });

        selectFirstTwo();
        expect(await screen.findByText('casa')).toBeInTheDocument();
        expect(screen.queryByText('Blog')).not.toBeInTheDocument();

        fireEvent.change(screen.getByRole('combobox', { name: 'Workspace' }), { target: { value: 'ws-lavoro' } });
        fireEvent.change(screen.getByRole('textbox', { name: 'Progetto' }), { target: { value: 'ca' } });

        expect(screen.getByText('Cantiere')).toBeInTheDocument();
        expect(screen.queryByText('Blog')).not.toBeInTheDocument();
        expect(screen.queryByText('casa')).not.toBeInTheDocument();
    });

    it('passes the target workspace when the project lives in another one', async () => {
        const onChangeProject = jest.fn();
        renderList({ onChangeProject, loadProjects: () => Promise.resolve(ownProjects), currentWorkspace: 'default', workspaces });

        selectFirstTwo();
        await screen.findByText('casa');
        fireEvent.change(screen.getByRole('combobox', { name: 'Workspace' }), { target: { value: 'ws-lavoro' } });
        fireEvent.click(screen.getByText('Cantiere'));
        fireEvent.click(screen.getByText('Sposta nel progetto'));

        expect(onChangeProject.mock.calls[0][1]).toBe('Cantiere');
        expect(onChangeProject.mock.calls[0][2]).toBe('ws-lavoro');
    });

    it('creates a new parent for the selection in the chosen workspace and project', async () => {
        const onCreateParent = jest.fn();
        renderList({ onChangeProject: jest.fn(), onCreateParent, loadProjects: () => Promise.resolve(ownProjects), currentWorkspace: 'default', workspaces });

        selectFirstTwo();
        fireEvent.click(screen.getByRole('tab', { name: 'Task padre' }));
        await screen.findByText('casa');
        fireEvent.change(screen.getByRole('combobox', { name: 'Workspace' }), { target: { value: 'ws-lavoro' } });
        fireEvent.click(screen.getByText('Blog'));
        fireEvent.change(screen.getByRole('textbox', { name: 'Titolo del nuovo task padre' }), { target: { value: ' Rifare il blog ' } });
        fireEvent.click(screen.getByText('Crea task padre'));

        expect([...onCreateParent.mock.calls[0][0]].sort()).toEqual([1, 2]);
        expect(onCreateParent.mock.calls[0].slice(1)).toEqual(['Rifare il blog', 'Blog', 'ws-lavoro']);
    });

    it('does not create a parent without a title', () => {
        const onCreateParent = jest.fn();
        renderList({ onChangeProject: jest.fn(), onCreateParent });

        selectFirstTwo();
        fireEvent.click(screen.getByRole('tab', { name: 'Task padre' }));
        fireEvent.click(screen.getByText('Nessun progetto'));
        fireEvent.click(screen.getByText('Crea task padre'));

        expect(onCreateParent).not.toHaveBeenCalled();
    });

    it('creates the parent without a chosen project, in the project the selection shares', () => {
        const onCreateParent = jest.fn();
        renderList({ onChangeProject: jest.fn(), onCreateParent, tasks: list.map(t => ({ ...t, project: 'casa' })) as never });

        selectFirstTwo();
        fireEvent.click(screen.getByRole('tab', { name: 'Task padre' }));
        fireEvent.change(screen.getByRole('textbox', { name: 'Titolo del nuovo task padre' }), { target: { value: 'Padre' } });
        fireEvent.click(screen.getByText('Crea task padre'));

        expect(onCreateParent.mock.calls[0].slice(1)).toEqual(['Padre', 'casa', undefined]);
    });

    it('creates the parent with no project when the selection mixes projects', () => {
        const onCreateParent = jest.fn();
        renderList({ onChangeProject: jest.fn(), onCreateParent });

        selectFirstTwo();
        fireEvent.click(screen.getByRole('tab', { name: 'Task padre' }));
        fireEvent.change(screen.getByRole('textbox', { name: 'Titolo del nuovo task padre' }), { target: { value: 'Padre' } });
        fireEvent.click(screen.getByText('Crea task padre'));

        expect(onCreateParent.mock.calls[0].slice(1)).toEqual(['Padre', '', undefined]);
    });

    it('shows one action per tab, the move one first', () => {
        renderList({ onChangeProject: jest.fn(), onCreateParent: jest.fn(), onMoveToNewWorkspace: jest.fn() });

        selectFirstTwo();

        expect(screen.getAllByRole('tab').map(tab => tab.textContent)).toEqual(['Sposta', 'Task padre', 'Nuovo workspace']);
        expect(screen.getByText('Sposta nel progetto')).toBeInTheDocument();
        expect(screen.queryByText('Crea task padre')).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('tab', { name: 'Nuovo workspace' }));
        expect(screen.queryByText('Sposta nel progetto')).not.toBeInTheDocument();
        expect(screen.queryByRole('list', { name: 'Progetto' })).not.toBeInTheDocument();
    });

    it('moves the selection to a new workspace', async () => {
        const onMoveToNewWorkspace = jest.fn().mockResolvedValue('ok');
        renderList({ onChangeProject: jest.fn(), onMoveToNewWorkspace });

        selectFirstTwo();
        fireEvent.click(screen.getByRole('tab', { name: 'Nuovo workspace' }));
        fireEvent.change(screen.getByRole('textbox', { name: 'Nome del nuovo workspace' }), { target: { value: ' Cantina ' } });
        fireEvent.click(screen.getByText('Sposta nel nuovo workspace'));

        await waitFor(() => expect(screen.queryByText('Task selezionati')).not.toBeInTheDocument());
        expect([...onMoveToNewWorkspace.mock.calls[0][0]].sort()).toEqual([1, 2]);
        expect(onMoveToNewWorkspace.mock.calls[0][1]).toBe('Cantina');
    });

    it('keeps the modal open and says so when the workspace name is taken', async () => {
        renderList({ onChangeProject: jest.fn(), onMoveToNewWorkspace: jest.fn().mockResolvedValue('exists') });

        selectFirstTwo();
        fireEvent.click(screen.getByRole('tab', { name: 'Nuovo workspace' }));
        fireEvent.change(screen.getByRole('textbox', { name: 'Nome del nuovo workspace' }), { target: { value: 'lavoro' } });
        fireEvent.click(screen.getByText('Sposta nel nuovo workspace'));

        expect(await screen.findByRole('alert')).toHaveTextContent('Esiste già un workspace con questo nome.');
        expect(screen.getByText('Task selezionati')).toBeInTheDocument();
    });

    it('hides "Rimuovi scadenza" when no selected task has a due date', () => {
        renderList({ tasks: list.map(t => ({ ...t, timestamp: undefined })) as never });

        selectFirstTwo();

        expect(screen.getByText('Task selezionati')).toBeInTheDocument();
        expect(screen.queryByText('Rimuovi scadenza')).not.toBeInTheDocument();
    });

    it('keeps a project of the current workspace inside it', async () => {
        const onChangeProject = jest.fn();
        renderList({ onChangeProject, loadProjects: () => Promise.resolve(ownProjects), currentWorkspace: 'default' });

        selectFirstTwo();
        const picker = await screen.findByRole('list', { name: 'Progetto' });
        fireEvent.click(await within(picker).findByRole('button', { name: /^casa/ }));
        fireEvent.click(screen.getByText('Sposta nel progetto'));

        expect(onChangeProject.mock.calls[0][1]).toBe('casa');
        expect(onChangeProject.mock.calls[0][2]).toBeUndefined();
    });
});

describe('TaskList title rendering', () => {
    const renderList = (title: string) => render(
        <TaskList
            tasks={[{ id: 1, title, status: 0 }]}
            onTaskClick={() => { }}
            updateTaskTitle={() => { }}
            editable={false}
            projectEditable={false}
            dateTimeEnabled={false}
            iconTheme="default"
        />
    );

    it('shows html in the title as text instead of rendering it', () => {
        const { container } = renderList('<img src=x onerror="alert(1)">');
        expect(container.querySelector('img')).toBeNull();
        expect(screen.getByText('<img src=x onerror="alert(1)">')).toBeInTheDocument();
    });

    it('still turns urls in the title into links', () => {
        renderList('leggi https://example.com/doc subito');
        const link = screen.getByRole('link', { name: 'https://example.com/doc' });
        expect(link).toHaveAttribute('href', 'https://example.com/doc');
        expect(link).toHaveAttribute('target', '_blank');
    });
});

describe('TaskList task age', () => {
    const renderTask = (task: object) => render(
        <TaskList
            tasks={[{ id: 1, title: 'Old task', status: 0, ...task }] as never}
            onTaskClick={() => { }}
            updateTaskTitle={() => { }}
            editable={false}
            projectEditable={false}
            dateTimeEnabled={false}
            iconTheme="default"
        />
    );

    it('shows how long ago the task was created', () => {
        renderTask({ createdAt: Math.floor(Date.now() / 1000) - 3 * 86400 });
        expect(screen.getByText('3 giorni')).toBeInTheDocument();
    });

    it('uses the singular for one unit', () => {
        renderTask({ createdAt: Math.floor(Date.now() / 1000) - 3600 });
        expect(screen.getByText('1 ora')).toBeInTheDocument();
    });

    it('shows nothing for tasks without a creation time', () => {
        renderTask({});
        expect(screen.queryByText(/giorn|ore|minut|adesso/)).not.toBeInTheDocument();
    });
});
