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

        expect(onReorder).toHaveBeenCalledWith([2, 1, 3]);
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

    it('shows no grip on tasks with a due date', () => {
        renderList([{ id: 9, title: 'Dated', status: 0, timestamp: 1000 }, ...undated], jest.fn());

        expect(within(row('Dated')).queryByLabelText('Trascina per riordinare')).not.toBeInTheDocument();
        expect(within(row('First')).getByLabelText('Trascina per riordinare')).toBeInTheDocument();
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

        expect(screen.getByText('Task selezionati: 2. Puoi rimuovere la data di scadenza da tutti.')).toBeInTheDocument();
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
