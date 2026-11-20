import { STATUS_ENUM } from "../utils";
import { dayKey } from "../utils/taskDays";

type ComponentProps = {
    tasks: Array<{
        id: number;
        title: string;
        longDescription?: string;
        project?: string;
        timestamp?: string | number;
        status: number;
        archived?: boolean;
        periodicity?: { number: string; unit: string };
        deadline?: string | null;
        rolledOver?: number;
    }>;
}

// Moves a date `n` periods later; false for a unit it doesn't know, the date left as it was.
const addPeriods = (date: Date, unit: string, n: number): boolean => {
    switch (unit) {
        case 'minuti':
            date.setMinutes(date.getMinutes() + n);
            return true;
        case 'giorni':
            date.setDate(date.getDate() + n);
            return true;
        case 'settimane':
            date.setDate(date.getDate() + n * 7);
            return true;
        case 'mesi':
            date.setMonth(date.getMonth() + n);
            return true;
        case 'anni':
            date.setFullYear(date.getFullYear() + n);
            return true;
        default:
            return false;
    }
};

// Twin of the API's Domain\Service\Quadrato\CompletedTasksArchiver: keep the two in sync.
export const archiveCompletedAndSkippedTasks = ({ tasks }: ComponentProps) => {
    const newTasks: any[] = [];
    const updatedTasks = tasks.map(t => {
        if (t.status === STATUS_ENUM.SKIPPED) {
            return { ...t, archived: true };
        }

        if (t.status === STATUS_ENUM.DONE && !t.archived) {
            // Se il task è periodico, crea una copia con la nuova scadenza
            if (t.periodicity && t.timestamp) {
                const { number, unit } = t.periodicity;
                const n = parseInt(number, 10);
                if (n > 0 && unit) {
                    // One period after now; an unknown unit renews it now.
                    let nextDate = new Date();
                    addPeriods(nextDate, unit, n);
                    // Its deadline, a fixed day like a bill's, moves one period from the old one,
                    // and the new day to work on it is never after it.
                    let deadline: string | null = null;
                    if (t.deadline) {
                        const nextDeadline = new Date(`${t.deadline}T00:00`);
                        if (addPeriods(nextDeadline, unit, n)) {
                            deadline = dayKey(nextDeadline);
                            if (dayKey(nextDate) > deadline) {
                                const capped = new Date(`${deadline}T00:00`);
                                capped.setHours(nextDate.getHours(), nextDate.getMinutes(), nextDate.getSeconds(), 0);
                                nextDate = capped;
                            }
                        }
                    }
                    newTasks.push({
                        ...t,
                        id: Date.now() + Math.floor(Math.random() * 1000000),
                        status: STATUS_ENUM.TODO,
                        archived: false,
                        timestamp: nextDate.getTime(),
                        deadline,
                        rolledOver: 0,
                    });
                }
            }
            return { ...t, archived: true };
        }
        return t;
    });
    const allTasks = [...updatedTasks, ...newTasks];

    return allTasks;
};
