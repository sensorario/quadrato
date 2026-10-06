import { taskAge } from '../src/utils/taskAge';

const now = 1_800_000_000;
const ago = (seconds: number) => taskAge(now - seconds, now);

describe('taskAge', () => {
    it('picks the largest unit that fits', () => {
        expect(ago(30)).toEqual({ unit: 'justNow', count: 0 });
        expect(ago(5 * 60)).toEqual({ unit: 'minutes', count: 5 });
        expect(ago(3 * 3600)).toEqual({ unit: 'hours', count: 3 });
        expect(ago(2 * 86400)).toEqual({ unit: 'days', count: 2 });
        expect(ago(15 * 86400)).toEqual({ unit: 'weeks', count: 2 });
        expect(ago(90 * 86400)).toEqual({ unit: 'months', count: 3 });
        expect(ago(800 * 86400)).toEqual({ unit: 'years', count: 2 });
    });

    it('never goes negative when the clock is behind the server', () => {
        expect(taskAge(now + 100, now)).toEqual({ unit: 'justNow', count: 0 });
    });
});
