import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { act } from 'react';
import App from '../src/App.jsx';

describe('Home page', () => {

    it('should show 4 tabs in config modal', async () => {
        render(<App />);
        const configButton = screen.getByText(/config/i);
        act(() => {
            fireEvent.click(configButton);
        });
        expect(await screen.findByText(/Generale/i)).toBeInTheDocument();
        expect(await screen.findByText(/Temi/i)).toBeInTheDocument();
        expect(await screen.findByText(/Progetti/i)).toBeInTheDocument();
    });
    it('should contain some strings', () => {
        render(<App />);
        expect(screen.getByText(/config/i)).toBeInTheDocument();
        expect(screen.getByText(/zen mode/i)).toBeInTheDocument();
        expect(screen.getByText(/help/i)).toBeInTheDocument();
        expect(screen.getByText(/aggiungi/i)).toBeInTheDocument();
        expect(screen.getByText(/archivia/i)).toBeInTheDocument();
    });

    it('should show modal with title "Conferma pulizia" when clicking on archivia', () => {
        render(<App />);
        const archiviaButton = screen.getByText(/archivia/i);
        act(() => {
            fireEvent.click(archiviaButton);
        });
        expect(screen.getByText(/conferma pulizia/i)).toBeInTheDocument();
    });

    it('should close modal and remove completed tasks when confirming archive', () => {
        // Popola il localStorage con un task completato
        window.localStorage.setItem('simplanner-tasks', JSON.stringify([
            { id: 1, title: 'Task completato', status: 2, archived: false }
        ]));

        render(<App />);
        // Conta i task prima della conferma
        const initialTasks = screen.getAllByRole('listitem');
        expect(initialTasks.length).toBe(1);

        const archiviaButton = screen.getByText(/archivia/i);
        act(() => {
            fireEvent.click(archiviaButton);
        });
        const confermaButtons = screen.getAllByText(/conferma/i);
        const confermaButton = confermaButtons.find(btn => btn.tagName === 'BUTTON');
        act(() => {
            fireEvent.click(confermaButton);
        });
        expect(screen.queryByText(/conferma pulizia/i)).not.toBeInTheDocument();
        // Conta i task dopo la conferma
        const finalTasks = screen.queryAllByRole('listitem');
        expect(finalTasks.length).toBe(0);
    });
});
