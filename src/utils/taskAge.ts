export type TaskAgeUnit = 'justNow' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

// Both in Unix seconds: createdAt comes from the API that way.
export const taskAge = (createdAt: number, now: number): { unit: TaskAgeUnit; count: number } => {
    const elapsed = Math.max(0, now - createdAt);
    if (elapsed < MINUTE) return { unit: 'justNow', count: 0 };
    if (elapsed < HOUR) return { unit: 'minutes', count: Math.floor(elapsed / MINUTE) };
    if (elapsed < DAY) return { unit: 'hours', count: Math.floor(elapsed / HOUR) };
    if (elapsed < WEEK) return { unit: 'days', count: Math.floor(elapsed / DAY) };
    if (elapsed < MONTH) return { unit: 'weeks', count: Math.floor(elapsed / WEEK) };
    if (elapsed < YEAR) return { unit: 'months', count: Math.floor(elapsed / MONTH) };
    return { unit: 'years', count: Math.floor(elapsed / YEAR) };
};
