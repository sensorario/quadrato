/* eslint-disable no-undef */
import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';

jest.mock('@sensorario/sg-components', () => ({
    QuadratoHeader: () => <div />,
    SGFooter: () => <div />,
    LanguageSwitcher: () => <div />,
    Icon: (props: any) => <span aria-label={props['aria-label'] ?? props.name} />,
}));
jest.mock('../src/components/InfoPanel', () => () => null);
jest.mock('../src/components/TaskProjectSelector', () => () => null);
jest.mock('../src/components/ExpiredTasks', () => () => null);

import App from '../src/App';
import AjaxRepository from '../src/repositories/AjaxRepository';

const openRename = async () => {
    localStorage.setItem('simonegentili.com-access-token', 'tok');
    (AjaxRepository as any).data['simplanner-tasks'] = [{ id: 1, title: 'T', status: 0, project: 'casa' }];
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    render(<App />);
    await act(async () => { });
    fireEvent.click(screen.getByLabelText('settings'));
    fireEvent.click(await screen.findByText('Progetti'));
    fireEvent.click(screen.getByRole('button', { name: 'Rinomina progetto' }));
};

const patchCalls = () => (global.fetch as jest.Mock).mock.calls.filter(([, options]) => options?.method === 'PATCH');

describe('rename project', () => {
    afterEach(() => localStorage.clear());

    it('sends the old and new name to the API and renames the loaded tasks', async () => {
        await openRename();

        fireEvent.change(screen.getByRole('textbox', { name: 'Nuovo nome del progetto' }), { target: { value: ' casetta ' } });
        fireEvent.keyDown(screen.getByRole('textbox', { name: 'Nuovo nome del progetto' }), { key: 'Enter' });

        await waitFor(() => expect(patchCalls()).toHaveLength(1));
        const [url, options] = patchCalls()[0];
        expect(url).toBe('https://api.simonegentili.com/quadrato/projects');
        expect(JSON.parse(options.body)).toEqual({ from: 'casa', to: 'casetta' });
        await waitFor(() => expect((AjaxRepository as any).data['simplanner-tasks'][0].project).toBe('casetta'));
    });

    it('does not call the API when the name is unchanged', async () => {
        await openRename();

        fireEvent.keyDown(screen.getByRole('textbox', { name: 'Nuovo nome del progetto' }), { key: 'Enter' });

        expect(patchCalls()).toHaveLength(0);
    });
});
