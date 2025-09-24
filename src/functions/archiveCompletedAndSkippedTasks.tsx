import { STATUS_ENUM } from "../utils";

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
    }>;
}

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
                    let baseDate = t.timestamp;
                    // Calcola la nuova data in base alla periodicità
                    if (typeof baseDate === 'string' || typeof baseDate === 'number') {
                        const nextDate = new Date();
                        switch (unit) {
                            case 'minuti':
                                nextDate.setMinutes(nextDate.getMinutes() + n);
                                break;
                            case 'giorni':
                                nextDate.setDate(nextDate.getDate() + n);
                                break;
                            case 'settimane':
                                nextDate.setDate(nextDate.getDate() + n * 7);
                                break;
                            case 'mesi':
                                nextDate.setMonth(nextDate.getMonth() + n);
                                break;
                            case 'anni':
                                nextDate.setFullYear(nextDate.getFullYear() + n);
                                break;
                            default:
                                break;
                        }
                        newTasks.push({
                            ...t,
                            id: Date.now() + Math.floor(Math.random() * 1000000),
                            status: STATUS_ENUM.TODO,
                            archived: false,
                            timestamp: nextDate.getTime(),
                        });
                    }
                }
            }
            return { ...t, archived: true };
        }
        return t;
    });
    const allTasks = [...updatedTasks, ...newTasks];
    localStorage.setItem('simplanner-tasks', JSON.stringify(allTasks));
    return allTasks;
};