/* eslint-disable no-undef */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';

jest.mock('@sensorario/sg-components', () => ({
    QuadratoHeader: () => <div />,
    SGFooter: () => <div />,
    LanguageSwitcher: () => <div />,
    Icon: (props: any) => <span aria-label={props['aria-label'] ?? props.name} />,
}));

import App from '../src/App';

it('opens the palette from the projects panel', async () => {
    localStorage.setItem('simplanner-tasks', JSON.stringify([{ id: 1, title: 'T', status: 0, project: 'casa' }]));
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    render(<App />);
    await act(async () => {});
    fireEvent.click(screen.getByLabelText('settings'));
    fireEvent.click(await screen.findByText('Progetti'));
    fireEvent.click(screen.getByTitle('Scegli colore'));
    await act(async () => {});
    screen.debug(undefined, 0);
    expect(screen.getByText('Scegli un colore')).toBeInTheDocument();
});
