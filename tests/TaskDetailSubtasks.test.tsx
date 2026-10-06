/* eslint-disable no-undef */
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { TaskDetailPage } from '../src/pages/TaskDetailPage';

jest.mock('@sensorario/sg-components', () => ({
    QuadratoHeader: () => <div data-testid="header" />,
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

    it('shows a placeholder when there are no subtasks', () => {
        render(<TaskDetailPage taskId="x" />);

        expect(screen.getByText('Nessun sotto-task')).toBeInTheDocument();
    });
});
