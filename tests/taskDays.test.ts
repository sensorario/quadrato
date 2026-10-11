import { dayKey, dueDay, isOverdue } from '../src/utils/taskDays';
import { STATUS_ENUM } from '../src/utils';
import { Task } from '../src/types/commonTypes';

const task = (fields: Partial<Task>): Task => ({ id: 1, title: 'Task', status: STATUS_ENUM.TODO, ...fields });

describe('taskDays', () => {
    it('gives a task the day it is due, whatever the format of its due date', () => {
        expect(dueDay(task({ timestamp: '2026-10-13 18:00:00' }))).toBe('2026-10-13');
        expect(dueDay(task({ timestamp: new Date(2026, 9, 13, 23, 30).getTime() }))).toBe('2026-10-13');
        expect(dueDay(task({}))).toBeNull();
    });

    it('gives the local day of a date', () => {
        expect(dayKey(new Date(2026, 9, 1, 0, 5))).toBe('2026-10-01');
    });

    it('is overdue only when due before now and still to do or in progress', () => {
        const now = new Date(2026, 9, 11, 9, 0);
        const due = '2026-10-11 08:00:00';

        expect(isOverdue(task({ timestamp: due }), now)).toBe(true);
        expect(isOverdue(task({ timestamp: due, status: STATUS_ENUM.IN_PROGRESS }), now)).toBe(true);
        expect(isOverdue(task({ timestamp: due, status: STATUS_ENUM.DONE }), now)).toBe(false);
        expect(isOverdue(task({ timestamp: due, status: STATUS_ENUM.SKIPPED }), now)).toBe(false);
        expect(isOverdue(task({ timestamp: due, archived: true }), now)).toBe(false);
        expect(isOverdue(task({ timestamp: '2026-10-11 10:00:00' }), now)).toBe(false);
        expect(isOverdue(task({}), now)).toBe(false);
    });
});
