import { Task } from "../types/commonTypes";

export const sortByDate = (tasks: Task[]) => {
    const withDate = tasks.filter(t => t.timestamp);
    const withoutDate = tasks.filter(t => !t.timestamp);

    withDate.sort((a: Task, b: Task) => {
        const aTime = typeof a.timestamp === 'number' ? a.timestamp : new Date(a.timestamp || '').getTime();
        const bTime = typeof b.timestamp === 'number' ? b.timestamp : new Date(b.timestamp || '').getTime();
        return aTime - bTime;
    });

    // Tasks never dragged have no position yet and keep their original order, after the ordered ones.
    withoutDate.sort((a: Task, b: Task) => (a.position ?? Number.MAX_SAFE_INTEGER) - (b.position ?? Number.MAX_SAFE_INTEGER));

    return [...withDate, ...withoutDate];
}

export default sortByDate;