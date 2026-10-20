import { Task } from "../types/commonTypes";
import { STATUS_ENUM } from "../utils";

const pad = (n: number) => String(n).padStart(2, "0");

// "YYYY-MM-DD" of a date, where the browser is.
export const dayKey = (date: Date): string =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// The day a task has to be done by, null without a due date: one from the 10th to the 13th is the 13th's.
export const dueDay = (task: Task): string | null => (task.timestamp ? dayKey(new Date(task.timestamp)) : null);

// Due before `now` and still to do or in progress.
export const isOverdue = (task: Task, now: Date): boolean =>
    !task.archived &&
    (task.status === STATUS_ENUM.TODO || task.status === STATUS_ENUM.IN_PROGRESS) &&
    !!task.timestamp &&
    new Date(task.timestamp) < now;

// First and last day of the week `date` is in, Monday to Sunday.
export const weekDays = (date: Date): [string, string] => {
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - ((date.getDay() + 6) % 7));
    return [dayKey(monday), dayKey(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6))];
};

// First and last day of the month `date` is in.
export const monthDays = (date: Date): [string, string] => [
    dayKey(new Date(date.getFullYear(), date.getMonth(), 1)),
    dayKey(new Date(date.getFullYear(), date.getMonth() + 1, 0)),
];

// Due on a day from `from` to `to`, both included.
export const isDueBetween = (task: Task, from: string, to: string): boolean => {
    const day = dueDay(task);
    return day !== null && day >= from && day <= to;
};

// The due date (Unix ms) of a task added from a list tab, so it shows up there: 18:00 of the
// day shown in "Per data", of this week's Sunday in "Settimana", of this month's last day in
// "Mese"; none from the other tabs.
export const tabDueDate = (tab: string, day: string, now: Date): number | "" => {
    const last = tab === "day" ? day : tab === "week" ? weekDays(now)[1] : tab === "month" ? monthDays(now)[1] : null;
    return last ? new Date(`${last}T18:00`).getTime() : "";
};
