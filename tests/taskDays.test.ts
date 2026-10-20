import { dayKey, dueDay, isDueBetween, isOverdue, monthDays, tabDueDate, weekDays } from '../src/utils/taskDays';
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

    it('gives the week of a date, Monday to Sunday', () => {
        expect(weekDays(new Date(2026, 9, 14))).toEqual(['2026-10-12', '2026-10-18']);
        expect(weekDays(new Date(2026, 9, 12))).toEqual(['2026-10-12', '2026-10-18']);
        expect(weekDays(new Date(2026, 9, 18, 23, 59))).toEqual(['2026-10-12', '2026-10-18']);
        expect(weekDays(new Date(2026, 11, 31))).toEqual(['2026-12-28', '2027-01-03']);
    });

    it('gives the month of a date', () => {
        expect(monthDays(new Date(2026, 9, 14))).toEqual(['2026-10-01', '2026-10-31']);
        expect(monthDays(new Date(2028, 1, 10))).toEqual(['2028-02-01', '2028-02-29']);
    });

    it('is due between two days, both included', () => {
        expect(isDueBetween(task({ timestamp: '2026-10-12 00:00:00' }), '2026-10-12', '2026-10-18')).toBe(true);
        expect(isDueBetween(task({ timestamp: '2026-10-18 23:59:00' }), '2026-10-12', '2026-10-18')).toBe(true);
        expect(isDueBetween(task({ timestamp: '2026-10-19 08:00:00' }), '2026-10-12', '2026-10-18')).toBe(false);
        expect(isDueBetween(task({}), '2026-10-12', '2026-10-18')).toBe(false);
    });

    it('gives a task added from a tab its due date: 18:00 of the day shown, of Sunday, of the last day of the month', () => {
        const now = new Date(2026, 9, 21, 20, 0);

        expect(tabDueDate('day', '2026-10-21', now)).toBe(new Date(2026, 9, 21, 18, 0).getTime());
        expect(tabDueDate('day', '2026-10-23', now)).toBe(new Date(2026, 9, 23, 18, 0).getTime());
        expect(tabDueDate('week', '2026-10-21', now)).toBe(new Date(2026, 9, 25, 18, 0).getTime());
        expect(tabDueDate('month', '2026-10-21', now)).toBe(new Date(2026, 9, 31, 18, 0).getTime());
        expect(tabDueDate('all', '2026-10-21', now)).toBe('');
        expect(tabDueDate('expired', '2026-10-21', now)).toBe('');
    });
});
