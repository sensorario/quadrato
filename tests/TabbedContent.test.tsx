/* eslint-disable no-undef */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TabbedContent from '../src/components/TabbedContent';

describe('TabbedContent per-instance active tab', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it('keeps the active tab of one TabbedContent instance independent from another', () => {
        // Simula la modale "Modifica task" (3 tab: what/when/project) e seleziona
        // l'ultima tab (indice 2), come farebbe un utente prima di aprire le Impostazioni.
        render(
            <TabbedContent
                id="editTask"
                panels={[
                    { title: 'What', content: <div>What content</div> },
                    { title: 'When', content: <div>When content</div> },
                    { title: 'Project', content: <div>Project tab content</div> },
                ]}
            />
        );
        fireEvent.click(screen.getByText('Project'));
        expect(screen.getByText('Project tab content').closest('.tab-content')).toHaveClass('active');

        // Apre la modale "Impostazioni", che ha un set di tab diverso (Generale/Progetti/Temi).
        // Prima della fix, l'indice di tab persistito era condiviso tra tutte le TabbedContent,
        // quindi l'indice 2 ("Project" nella modale precedente) apriva erroneamente "Temi"
        // invece di mostrare la tab di default, nascondendo la tab "Progetti".
        render(
            <TabbedContent
                id="settings"
                panels={[
                    { title: 'Generale', content: <div>Generale content</div> },
                    { title: 'Progetti', content: <div>Progetti content</div> },
                    { title: 'Temi', content: <div>Temi content</div> },
                ]}
            />
        );

        expect(screen.getByText('Generale content').closest('.tab-content')).toHaveClass('active');
        expect(screen.getByText('Progetti content').closest('.tab-content')).not.toHaveClass('active');
        expect(screen.getByText('Temi content').closest('.tab-content')).not.toHaveClass('active');
    });

    it('restores the last active tab of a TabbedContent instance across remounts, scoped by id', () => {
        const panels = [
            { title: 'Generale', content: <div>Generale content</div> },
            { title: 'Progetti', content: <div>Progetti content</div> },
            { title: 'Temi', content: <div>Temi content</div> },
        ];

        const { unmount } = render(<TabbedContent id="settings" panels={panels} />);
        fireEvent.click(screen.getByText('Progetti'));
        expect(screen.getByText('Progetti content').closest('.tab-content')).toHaveClass('active');
        unmount();

        render(<TabbedContent id="settings" panels={panels} />);
        expect(screen.getByText('Progetti content').closest('.tab-content')).toHaveClass('active');
    });
});
