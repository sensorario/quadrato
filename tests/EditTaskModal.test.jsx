/* eslint-disable no-undef */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EditTaskModal from '../src/components/EditTaskModal';

function mockLocalStorage(tasksByKey) {
    // Reset localStorage
    Object.keys(window.localStorage).forEach(key => window.localStorage.removeItem(key));
    // Set test data
    Object.keys(tasksByKey).forEach(key => {
        window.localStorage.setItem(key, JSON.stringify(tasksByKey[key]));
    });
}

describe('EditTaskModal project list', () => {
    beforeEach(() => {
        localStorage.setItem('simplanner-show-text', 'true');
        mockLocalStorage({
            'simplanner-tasks-1': [
                { id: 1, project: 'Alpha' },
                { id: 2, project: 'Beta' }
            ],
            'simplanner-tasks-2': [
                { id: 3, project: 'Gamma' },
                { id: 4, project: 'Alpha' }
            ]
        });
    });

    it('shows all distinct projects in the modal', () => {
        render(
            <EditTaskModal
                value=""
                setValue={() => { }}
                longValue=""
                setLongValue={() => { }}
                projectValue=""
                setProjectValue={() => { }}
                timestampValue={''}
                setTimestampValue={() => { }}
                periodicityValue={{ number: '', unit: 'giorni' }}
                setPeriodicityValue={() => { }}
                onClose={() => { }}
                onSave={() => { }}
                projectEditable={true}
                dateTimeEnabled={true}
            />
        );
        // Simula click sul tab "Progetto" (primo span con quel testo)
        const progettoTab = screen.getAllByText('Progetto').find(el => el.tagName === 'SPAN');
        fireEvent.click(progettoTab);
        expect(screen.getByText('Alpha')).toBeInTheDocument();
        expect(screen.getByText('Beta')).toBeInTheDocument();
        expect(screen.getByText('Gamma')).toBeInTheDocument();
    });
});
