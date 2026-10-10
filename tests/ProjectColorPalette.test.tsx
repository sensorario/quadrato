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

const openPalette = async () => {
    (AjaxRepository as any).data['simplanner-tasks'] = [{ id: 1, title: 'T', status: 0, project: 'casa' }];
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    render(<App />);
    await act(async () => { });
    fireEvent.click(screen.getByLabelText('settings'));
    fireEvent.click(await screen.findByText('Progetti'));
    fireEvent.click(screen.getByTitle('Scegli colore'));
};

describe('project colour palette', () => {
    it('opens as its own modal, outside the settings one', async () => {
        await openPalette();

        const palette = screen.getByText('Scegli un colore').closest('.modal-backdrop');
        const settings = screen.getByText('Configurazioni').closest('.modal-backdrop');
        expect(palette).not.toBeNull();
        expect(settings?.contains(palette as Node)).toBe(false);
    });

    it('closes with the close button', async () => {
        await openPalette();

        const palette = screen.getByText('Scegli un colore').closest('.modal') as HTMLElement;
        fireEvent.click(palette.querySelector('.modal-dismiss-btn') as HTMLElement);

        await waitFor(() => expect(screen.queryByText('Scegli un colore')).not.toBeInTheDocument());
    });
});
