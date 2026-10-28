import { dayKey, dueDay, inLevel, isDueBetween, isOverdue, levelLastDay, nextDays, tabDueDate } from '../src/utils/taskDays';
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

    it('never takes a note for overdue: its date is when it was written', () => {
        const now = new Date(2026, 9, 11, 9, 0);

        expect(isOverdue(task({ title: '[note] Chiamato il fornitore', timestamp: '2026-10-10 15:00:00' }), now)).toBe(false);
    });

    it('gives the days from a date on, the date included', () => {
        expect(nextDays(new Date(2026, 9, 21), 7)).toEqual(['2026-10-21', '2026-10-27']);
        expect(nextDays(new Date(2026, 9, 21, 23, 59), 7)).toEqual(['2026-10-21', '2026-10-27']);
        expect(nextDays(new Date(2026, 9, 21), 28)).toEqual(['2026-10-21', '2026-11-17']);
        expect(nextDays(new Date(2026, 11, 28), 7)).toEqual(['2026-12-28', '2027-01-03']);
        expect(nextDays(new Date(2028, 1, 25), 7)).toEqual(['2028-02-25', '2028-03-02']);
    });

    it('is due between two days, both included', () => {
        expect(isDueBetween(task({ timestamp: '2026-10-12 00:00:00' }), '2026-10-12', '2026-10-18')).toBe(true);
        expect(isDueBetween(task({ timestamp: '2026-10-18 23:59:00' }), '2026-10-12', '2026-10-18')).toBe(true);
        expect(isDueBetween(task({ timestamp: '2026-10-19 08:00:00' }), '2026-10-12', '2026-10-18')).toBe(false);
        expect(isDueBetween(task({}), '2026-10-12', '2026-10-18')).toBe(false);
    });

    it('gives the last day each level reaches', () => {
        const now = new Date(2026, 9, 21, 20, 0);

        expect(levelLastDay('day', now)).toBe('2026-10-21');
        expect(levelLastDay('week', now)).toBe('2026-10-27');
        expect(levelLastDay('month', now)).toBe('2026-11-17');
        expect(levelLastDay('expired', now)).toBeNull();
        expect(levelLastDay('all', now)).toBeNull();
    });

    it('puts in a level the tasks due from today to its last day, and every task in "all"', () => {
        const now = new Date(2026, 9, 21, 20, 0);
        const dueOn = (day: string) => task({ timestamp: `${day} 18:00:00` });

        expect(inLevel(dueOn('2026-10-21'), 'day', now)).toBe(true);
        expect(inLevel(dueOn('2026-10-22'), 'day', now)).toBe(false);
        expect(inLevel(dueOn('2026-10-20'), 'week', now)).toBe(false);
        expect(inLevel(dueOn('2026-10-27'), 'week', now)).toBe(true);
        expect(inLevel(dueOn('2026-10-28'), 'week', now)).toBe(false);
        expect(inLevel(dueOn('2026-11-17'), 'month', now)).toBe(true);
        expect(inLevel(dueOn('2026-11-18'), 'month', now)).toBe(false);
        expect(inLevel(dueOn('2026-10-21'), 'expired', now)).toBe(false);
        expect(inLevel(task({}), 'all', now)).toBe(true);
        expect(inLevel(task({}), 'month', now)).toBe(false);
    });

    it('gives a task added from a level its due date: 18:00 of the last day the level reaches', () => {
        const now = new Date(2026, 9, 21, 20, 0);

        expect(tabDueDate('day', now)).toBe(new Date(2026, 9, 21, 18, 0).getTime());
        expect(tabDueDate('week', now)).toBe(new Date(2026, 9, 27, 18, 0).getTime());
        expect(tabDueDate('month', now)).toBe(new Date(2026, 10, 17, 18, 0).getTime());
        expect(tabDueDate('all', now)).toBe('');
        expect(tabDueDate('expired', now)).toBe('');
    });
});
