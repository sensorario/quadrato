/* eslint-disable no-undef */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LogoutConfirmModal from '../src/components/LogoutConfirmModal';

describe('LogoutConfirmModal', () => {
    it('calls onClick when cancel is pressed', async () => {
        const onClick = jest.fn();
        const onConfirm = jest.fn();
        render(<LogoutConfirmModal onClick={onClick} onConfirm={onConfirm} />);

        fireEvent.click(screen.getByText('Annulla'));
        // La chiusura è animata (Modal ritarda la callback finché l'animazione non finisce)
        await waitFor(() => expect(onClick).toHaveBeenCalled());
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it('calls onConfirm when confirm is pressed', async () => {
        const onClick = jest.fn();
        const onConfirm = jest.fn();
        render(<LogoutConfirmModal onClick={onClick} onConfirm={onConfirm} />);

        fireEvent.click(screen.getByText('Conferma'));
        await waitFor(() => expect(onConfirm).toHaveBeenCalled());
    });

    it('closes on ESC key press', async () => {
        const onClick = jest.fn();
        render(<LogoutConfirmModal onClick={onClick} onConfirm={() => { }} />);

        fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
        await waitFor(() => expect(onClick).toHaveBeenCalled());
    });
});
