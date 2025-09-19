/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import EditTaskModal from '../src/components/EditTaskModal';

function mockLocalStorage(tasksByKey) {
    const store = {};
    Object.keys(tasksByKey).forEach(key => {
        store[key] = JSON.stringify(tasksByKey[key]);
    });
    window.localStorage = {
        getItem: key => store[key],
        setItem: (key, value) => { store[key] = value; },
        removeItem: key => { delete store[key]; },
        clear: () => { Object.keys(store).forEach(k => delete store[k]); },
        key: i => Object.keys(store)[i],
        length: Object.keys(store).length,
        ...store,
    };
    // Patch Object.keys to work on localStorage
    Object.keys = function (obj) {
        if (obj === window.localStorage) return Object.keys(store);
        return Object.keys(obj);
    };
}

describe('EditTaskModal project list', () => {
    beforeEach(() => {
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
        render(<EditTaskModal projectEditable={true} />);
        expect(screen.getByText('Alpha')).toBeInTheDocument();
        expect(screen.getByText('Beta')).toBeInTheDocument();
        expect(screen.getByText('Gamma')).toBeInTheDocument();
    });
});
