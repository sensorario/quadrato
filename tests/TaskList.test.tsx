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
