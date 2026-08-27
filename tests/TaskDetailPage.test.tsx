/* eslint-disable no-undef */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { TaskDetailPage } from '../src/pages/TaskDetailPage';

jest.mock('@sensorario/sg-components', () => ({
    QuadratoHeader: () => <div data-testid="header" />,
}));

const mockNavigate = jest.fn();
jest.mock('../src/Router', () => ({
    navigate: (...args: any[]) => mockNavigate(...args),
}));

const task = { id: 42, title: 'Task to delete', status: 0 };

const mockOnDataLoaded = jest.fn((cb: () => void) => cb());
const mockSetProjectFilter = jest.fn();

jest.mock('../src/repositories', () => ({
    getConfigRepository: () => ({
        getTasks: () => [task],
        onDataLoaded: (cb: () => void) => mockOnDataLoaded(cb),
        onAuthenticated: () => {},
        onUnauthorized: () => {},
        setProjectFilter: mockSetProjectFilter,
    }),
}));

describe('TaskDetailPage delete', () => {
    beforeEach(() => {
        localStorage.setItem('simonegentili.com-access-token', 'tok');
        localStorage.setItem('simplanner-tasks', JSON.stringify([task]));
        mockNavigate.mockClear();
        global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 });
        jest.spyOn(window, 'confirm').mockReturnValue(true);
    });

    afterEach(() => {
        localStorage.clear();
        jest.restoreAllMocks();
    });

    it('sends a DELETE request for the current task and navigates away on success', async () => {
        render(<TaskDetailPage taskId="42" />);

        const deleteButton = await screen.findByText('Delete task');
        fireEvent.click(deleteButton);

        await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
            'https://api.simonegentili.com/quadrato/task/42',
            expect.objectContaining({
                method: 'DELETE',
                headers: { Authorization: 'Bearer tok' },
            })
        ));

        await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
    });

    it('does not send a request when the confirmation is dismissed', async () => {
        (window.confirm as jest.Mock).mockReturnValue(false);

        render(<TaskDetailPage taskId="42" />);

        const deleteButton = await screen.findByText('Delete task');
        fireEvent.click(deleteButton);

        expect(global.fetch).not.toHaveBeenCalled();
    });
});
