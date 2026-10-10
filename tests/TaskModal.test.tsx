/* eslint-disable no-undef */
import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import TaskModal from '../src/components/TaskModal';

const mockGetAllFullProjects = jest.fn(() => [{ project: 'Alpha' }, { project: 'Beta' }]);
const mockGetTasks = jest.fn(() => [
    { id: 1, project: 'Alpha' },
    { id: 2, project: 'Alpha' },
    { id: 3, project: 'Alpha', archived: true },
    { id: 4, project: 'Beta' },
]);
const mockGetActiveTab = jest.fn(() => 0);
const mockSetActiveTab = jest.fn();

jest.mock('../src/repositories', () => ({
    getConfigRepository: () => ({
        getAllFullProjects: mockGetAllFullProjects,
        getTasks: mockGetTasks,
        getActiveTab: mockGetActiveTab,
        setActiveTab: mockSetActiveTab,
    }),
}));

const baseProps = {
    projectEditable: true,
    dateTimeEnabled: true,
    onSave: () => { },
    onClose: () => { },
};

describe('TaskModal closing', () => {
    it('closes on ESC key press', async () => {
        const onClose = jest.fn();
        render(<TaskModal {...baseProps} mode="create" onClose={onClose} />);
        fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
        await waitFor(() => expect(onClose).toHaveBeenCalled());
    });

    it('closes on overlay click', async () => {
        const onClose = jest.fn();
        render(<TaskModal {...baseProps} mode="edit" onClose={onClose} />);
        const overlay = document.querySelector('.modal-backdrop');
        fireEvent.click(overlay as Element);
        await waitFor(() => expect(onClose).toHaveBeenCalled());
    });
});

describe('TaskModal add-another toggle', () => {
    it('shows the toggle in create mode', () => {
        render(<TaskModal {...baseProps} mode="create" />);
        expect(screen.getByText('Aggiungi un altro task')).toBeInTheDocument();
    });

    it('hides the toggle in edit mode', () => {
        render(<TaskModal {...baseProps} mode="edit" />);
        expect(screen.queryByText('Aggiungi un altro task')).not.toBeInTheDocument();
    });
});

describe('TaskModal tabs', () => {
    it('persists the active tab via the repository', () => {
        render(<TaskModal {...baseProps} mode="create" />);
        fireEvent.click(screen.getByText('Quando'));
        expect(mockSetActiveTab).toHaveBeenCalledWith('taskModal', 1);
    });
});

describe('TaskModal save', () => {
    it('blocks save when the title is empty', () => {
        const onSave = jest.fn();
        render(<TaskModal {...baseProps} mode="create" onSave={onSave} />);
        fireEvent.click(screen.getByText('Salva'));
        expect(onSave).not.toHaveBeenCalled();
    });

    it('calls onSave with title, description and project in both modes', () => {
        const onSave = jest.fn();
        render(<TaskModal {...baseProps} mode="create" onSave={onSave} />);
        fireEvent.change(screen.getByPlaceholderText('Titolo del task'), { target: { value: 'My task' } });
        fireEvent.change(screen.getByPlaceholderText('Descrizione del task'), { target: { value: 'Details' } });
        fireEvent.click(screen.getByText('Salva'));
        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
            title: 'My task',
            longDescription: 'Details',
            project: '',
            periodicity: null,
        }));
    });

    it('round-trips periodicity when a number is set', () => {
        const onSave = jest.fn();
        const { container } = render(<TaskModal {...baseProps} mode="create" onSave={onSave} />);
        fireEvent.change(screen.getByPlaceholderText('Titolo del task'), { target: { value: 'Recurring task' } });
        const periodicityInput = container.querySelector('.periodo-number') as Element;
        fireEvent.change(periodicityInput, { target: { value: '3' } });
        fireEvent.click(screen.getByText('Salva'));
        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
            periodicity: { number: '3', unit: 'giorni' },
        }));
    });

    it('sets the deadline via a quick-date shortcut button', () => {
        const onSave = jest.fn();
        render(<TaskModal {...baseProps} mode="create" onSave={onSave} />);
        fireEvent.change(screen.getByPlaceholderText('Titolo del task'), { target: { value: 'Task with deadline' } });
        fireEvent.click(screen.getByText('domani'));
        fireEvent.click(screen.getByText('Salva'));

        const expected = new Date();
        expected.setUTCDate(expected.getUTCDate() + 1);
        expected.setUTCHours(8, 0, 0, 0);

        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
            timestamp: expected.getTime(),
        }));
    });

    it('filters the project suggestions while typing, ignoring case', () => {
        render(<TaskModal {...baseProps} mode="create" />);
        fireEvent.change(screen.getByPlaceholderText('Progetto (opzionale)'), { target: { value: 'AL' } });
        expect(screen.getByText('Alpha')).toBeInTheDocument();
        expect(screen.queryByText('Beta')).not.toBeInTheDocument();
    });

    it('shows every project until the one the task already has is changed', () => {
        render(<TaskModal {...baseProps} mode="edit" initialValues={{ title: 'Task', project: 'Beta' }} />);
        expect(screen.getByText('Alpha')).toBeInTheDocument();
        expect(screen.getAllByText('Beta').length).toBeGreaterThan(0);

        fireEvent.change(screen.getByPlaceholderText('Progetto (opzionale)'), { target: { value: 'alp' } });
        expect(screen.getByText('Alpha')).toBeInTheDocument();
        expect(screen.queryByText('Beta')).not.toBeInTheDocument();
    });

    it('shows how many tasks each project holds, archived ones left out', () => {
        render(<TaskModal {...baseProps} mode="create" />);
        expect(screen.getByText('Alpha').closest('.project-suggestion-item')).toHaveTextContent('2 task');
        expect(screen.getByText('Beta').closest('.project-suggestion-item')).toHaveTextContent('1 task');
    });

    it('says so when no project matches what was typed', () => {
        render(<TaskModal {...baseProps} mode="create" />);
        fireEvent.change(screen.getByPlaceholderText('Progetto (opzionale)'), { target: { value: 'zzz' } });
        expect(screen.getByText('Nessun progetto trovato')).toBeInTheDocument();
    });

    it('fills the project field from a suggestion click', () => {
        const onSave = jest.fn();
        render(<TaskModal {...baseProps} mode="edit" onSave={onSave} />);
        fireEvent.change(screen.getByPlaceholderText('Titolo del task'), { target: { value: 'Task with project' } });
        fireEvent.click(screen.getByText('Alpha'));
        fireEvent.click(screen.getByText('Salva'));
        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
            project: 'Alpha',
        }));
    });
});
