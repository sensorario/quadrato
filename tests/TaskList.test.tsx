/* eslint-disable no-undef */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
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

describe('TaskList drag and drop', () => {
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
        // jsdom has no layout: give each row a 20px-high box stacked by DOM order.
        utils.container.querySelectorAll('li').forEach((li, i) => {
            li.getBoundingClientRect = () => ({ top: i * 20, height: 20, bottom: i * 20 + 20, left: 0, right: 100, width: 100, x: 0, y: i * 20, toJSON: () => ({}) });
        });
        return utils;
    };

    const row = (title: string) => screen.getByText(title).closest('li') as HTMLLIElement;

    it('moves a task after dragging it below another one with the mouse', () => {
        const onReorder = jest.fn();
        renderList(undated, onReorder);

        fireEvent.pointerDown(row('First'), { button: 0, clientX: 10, clientY: 10, pointerType: 'mouse' });
        fireEvent.pointerMove(window, { clientX: 10, clientY: 35, pointerType: 'mouse' });
        fireEvent.pointerUp(window, { pointerType: 'mouse' });

        expect(onReorder).toHaveBeenCalledWith([2, 1, 3]);
    });

    it('does not reorder on a plain click, which still toggles the status', () => {
        const onReorder = jest.fn();
        const onTaskClick = jest.fn();
        renderList(undated, onReorder, onTaskClick);

        const status = row('First').querySelector('span > span') as HTMLElement;
        fireEvent.pointerDown(status, { button: 0, clientX: 10, clientY: 10, pointerType: 'mouse' });
        fireEvent.pointerUp(window, { pointerType: 'mouse' });
        fireEvent.click(status);

        expect(onReorder).not.toHaveBeenCalled();
        expect(onTaskClick).toHaveBeenCalledWith(1);
    });

    it('does not let tasks with a due date be dragged', () => {
        const onReorder = jest.fn();
        renderList([{ id: 9, title: 'Dated', status: 0, timestamp: 1000 }, ...undated], onReorder);

        fireEvent.pointerDown(row('Dated'), { button: 0, clientX: 10, clientY: 10, pointerType: 'mouse' });
        fireEvent.pointerMove(window, { clientX: 10, clientY: 75, pointerType: 'mouse' });
        fireEvent.pointerUp(window, { pointerType: 'mouse' });

        expect(onReorder).not.toHaveBeenCalled();
    });
});
