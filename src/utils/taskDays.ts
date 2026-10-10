import { Task } from "../types/commonTypes";
import { STATUS_ENUM } from "../utils";

const pad = (n: number) => String(n).padStart(2, "0");

// "YYYY-MM-DD" of a date, where the browser is.
export const dayKey = (date: Date): string =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// The day `days` after `day`, before it when negative. Read at noon so no DST change moves it.
export const offsetDay = (day: string, days: number): string => {
    const date = new Date(`${day}T12:00:00`);
    date.setDate(date.getDate() + days);
    return dayKey(date);
};

// The day a task has to be done by, null without a due date: one from the 10th to the 13th is the 13th's.
export const dueDay = (task: Task): string | null => (task.timestamp ? dayKey(new Date(task.timestamp)) : null);

// Due before `now` and still to do or in progress.
export const isOverdue = (task: Task, now: Date): boolean =>
    !task.archived &&
    (task.status === STATUS_ENUM.TODO || task.status === STATUS_ENUM.IN_PROGRESS) &&
    !!task.timestamp &&
    new Date(task.timestamp) < now;
