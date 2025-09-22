import { describe, it, expect, jest } from '@jest/globals';
import { handleAddAnotherModal } from '../src/utils/handleAddAnotherModal.tsx';

describe('handleAddAnotherModal', () => {
    it('chiude il modal e resetta addAnother se addAnother è false', () => {
        const setShowPopup = jest.fn();
        const setAddAnother = jest.fn();
        const setNewTaskTitle = jest.fn();
        handleAddAnotherModal({ addAnother: false, setShowPopup, setAddAnother, setNewTaskTitle });
        expect(setNewTaskTitle).toHaveBeenCalledWith('');
        expect(setShowPopup).toHaveBeenCalledWith(false);
        expect(setAddAnother).toHaveBeenCalledWith(false);
    });

    it('apre il modal se addAnother è true', () => {
        const setShowPopup = jest.fn();
        const setAddAnother = jest.fn();
        const setNewTaskTitle = jest.fn();
        handleAddAnotherModal({ addAnother: true, setShowPopup, setAddAnother, setNewTaskTitle });
        expect(setNewTaskTitle).toHaveBeenCalledWith('');
        expect(setShowPopup).toHaveBeenCalledWith(true);
        expect(setAddAnother).not.toHaveBeenCalledWith(false);
    });
});
