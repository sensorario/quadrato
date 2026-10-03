import { Task } from "../types/commonTypes";
import { STATUS_ENUM } from "../utils";

const STATUS_RANK: Record<number, number> = {
    [STATUS_ENUM.IN_PROGRESS]: 0,
    [STATUS_ENUM.TODO]: 1,
    [STATUS_ENUM.DONE]: 2,
    [STATUS_ENUM.SKIPPED]: 3,
};

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

    return [...withDate, ...withoutDate]
        .sort((a: Task, b: Task) => (STATUS_RANK[a.status] ?? 1) - (STATUS_RANK[b.status] ?? 1));
}

export default sortByDate;