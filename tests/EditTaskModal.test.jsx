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
    it('closes modal on ESC key press', () => {
        const onClose = jest.fn();
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
                onClose={onClose}
                onSave={() => { }}
                projectEditable={true}
                dateTimeEnabled={true}
            />
        );
        fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
        expect(onClose).toHaveBeenCalled();
    });

    it('closes modal on overlay click', () => {
        const onClose = jest.fn();
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
                onClose={onClose}
                onSave={() => { }}
                projectEditable={true}
                dateTimeEnabled={true}
            />
        );
        const overlay = document.querySelector('.modal-overlay');
        fireEvent.click(overlay);
        expect(onClose).toHaveBeenCalled();
    });

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

});
