/* eslint-disable no-undef */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskDetailPage } from '../src/pages/TaskDetailPage';

jest.mock('@sensorario/sg-components', () => ({
    QuadratoHeader: () => <div data-testid="header" />,
    Logo: () => <span />,
    Icon: (props: any) => <span aria-label={props['aria-label']} />,
}));

jest.mock('../src/Router', () => ({
    navigate: jest.fn(),
}));

const mockFetchData = jest.fn();
jest.mock('../src/repositories', () => ({
    getConfigRepository: () => ({
        getTasks: () => [{ id: 't', title: '[bug] Old title', status: 0 }],
        onDataLoaded: (cb: () => void) => cb(),
        onAuthenticated: () => { },
        onUnauthorized: () => { },
        fetchData: mockFetchData,
    }),
}));

const startEditing = () => {
    fireEvent.doubleClick(screen.getByTitle('Doppio click per modificare il titolo'));
    return screen.getByRole('textbox', { name: 'Titolo del task' });
};

describe('TaskDetailPage title', () => {
    beforeEach(() => {
        localStorage.setItem('simonegentili.com-access-token', 'tok');
        global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 });
        mockFetchData.mockClear();
    });

    afterEach(() => {
        localStorage.clear();
        jest.restoreAllMocks();
    });

    it('makes the title itself editable on double click, type prefix included', () => {
        render(<TaskDetailPage taskId="t" />);

        const title = startEditing();

        expect(title.getAttribute('contenteditable')).toBe('plaintext-only');
        expect(title.textContent).toBe('[bug] Old title');
    });

    it('saves it with Enter', async () => {
        render(<TaskDetailPage taskId="t" />);
        const title = startEditing();

        title.textContent = '[bug] New title ';
        fireEvent.keyDown(title, { key: 'Enter' });

        expect(screen.queryByRole('textbox', { name: 'Titolo del task' })).toBeNull();
        expect(screen.getByText('New title')).toBeInTheDocument();
        await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
            'https://api.simonegentili.com/quadrato/task/t',
            expect.objectContaining({ method: 'PUT', body: JSON.stringify({ title: '[bug] New title' }) }),
        ));
        await waitFor(() => expect(mockFetchData).toHaveBeenCalled());
    });

    it('puts it back with Esc or a click elsewhere, saving nothing', () => {
        render(<TaskDetailPage taskId="t" />);

        let title = startEditing();
        title.textContent = 'Changed';
        fireEvent.keyDown(title, { key: 'Escape' });
        expect(screen.getByText('Old title')).toBeInTheDocument();

        title = startEditing();
        title.textContent = 'Changed';
        fireEvent.blur(title);
        expect(screen.getByText('Old title')).toBeInTheDocument();

        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('shows the type on its icon and changes it, or takes it away, from there', async () => {
        render(<TaskDetailPage taskId="t" />);

        expect(screen.getByRole('button', { name: 'Bug' })).toHaveAttribute('aria-pressed', 'true');

        fireEvent.click(screen.getByRole('button', { name: 'Feature' }));
        expect(screen.getByRole('button', { name: 'Feature' })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: 'Bug' })).toHaveAttribute('aria-pressed', 'false');
        await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
            'https://api.simonegentili.com/quadrato/task/t',
            expect.objectContaining({ method: 'PUT', body: JSON.stringify({ title: '[feature] Old title' }) }),
        ));

        fireEvent.click(screen.getByRole('button', { name: 'Feature' }));
        expect(screen.getByRole('button', { name: 'Feature' })).toHaveAttribute('aria-pressed', 'false');
        await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
            'https://api.simonegentili.com/quadrato/task/t',
            expect.objectContaining({ method: 'PUT', body: JSON.stringify({ title: 'Old title' }) }),
        ));
    });

    it('puts the old type back when the API refuses the new one', async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
        jest.spyOn(window, 'alert').mockImplementation(() => { });
        render(<TaskDetailPage taskId="t" />);

        fireEvent.click(screen.getByRole('button', { name: 'Pagamento' }));

        await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Non è stato possibile cambiare il tipo del task.'));
        expect(screen.getByRole('button', { name: 'Bug' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('puts the old title back when the API refuses the new one', async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
        jest.spyOn(window, 'alert').mockImplementation(() => { });
        render(<TaskDetailPage taskId="t" />);
        const title = startEditing();

        title.textContent = 'New title';
        fireEvent.keyDown(title, { key: 'Enter' });

        await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Non è stato possibile salvare il titolo.'));
        expect(screen.getByText('Old title')).toBeInTheDocument();
    });
});
