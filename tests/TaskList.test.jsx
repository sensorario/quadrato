/* eslint-disable no-undef */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskList from '../src/components/TaskList';

// Mock dei repository
jest.mock('../src/repositories', () => ({
    getConfigRepository: () => ({
        getProjectColors: () => ({}),
        getAllProjects: () => ['test-project', 'another-project'],
        getActiveTab: () => 0,
        setActiveTab: jest.fn()
    })
}));

describe('TaskList', () => {
    const mockTasks = [
        {
            id: 1,
            title: 'Test Task',
            status: 0,
            project: 'test-project',
            timestamp: null,
            archived: false
        }
    ];

    it('should open edit modal when clicking on edit icon', () => {
        const mockUpdateTaskTitle = jest.fn();
        const mockOnTaskClick = jest.fn();

        render(
            <TaskList
                tasks={mockTasks}
                onTaskClick={mockOnTaskClick}
                updateTaskTitle={mockUpdateTaskTitle}
                editable={true}
                projectEditable={true}
                dateTimeEnabled={false}
                iconTheme="default"
            />
        );

        // Trova l'icona di modifica e cliccaci sopra
        const editIcon = screen.getByTitle('Modifica');
        fireEvent.click(editIcon);

        // Verifica che la modale di editing sia visibile
        // La modale contiene elementi specifici come il campo di input per il titolo
        const titleInput = screen.getByDisplayValue('Test Task');
        expect(titleInput).toBeInTheDocument();
    });

    it('should not show edit icon when editable is false', () => {
        const mockUpdateTaskTitle = jest.fn();
        const mockOnTaskClick = jest.fn();

        render(
            <TaskList
                tasks={mockTasks}
                onTaskClick={mockOnTaskClick}
                updateTaskTitle={mockUpdateTaskTitle}
                editable={false}
                projectEditable={true}
                dateTimeEnabled={false}
                iconTheme="default"
            />
        );

        // Verifica che l'icona di modifica NON sia presente
        const editIcon = screen.queryByTitle('Modifica');
        expect(editIcon).not.toBeInTheDocument();
    });
});
