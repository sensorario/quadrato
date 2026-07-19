/* eslint-disable no-undef */
import React from 'react';
import { render, screen } from '@testing-library/react';
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

    it('renders no type icon when the title has no prefix', () => {
        renderList('Plain task');
        expect(screen.queryByLabelText('bug')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('feature')).not.toBeInTheDocument();
    });
});
