import { Task } from "../types/commonTypes";
import { STATUS_ENUM } from "../utils";
import { isNote } from "../components/TaskTitle";

const pad = (n: number) => String(n).padStart(2, "0");

// "YYYY-MM-DD" of a date, where the browser is.
export const dayKey = (date: Date): string =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// The day a task has to be done by, null without a due date: one from the 10th to the 13th is the 13th's.
export const dueDay = (task: Task): string | null => (task.timestamp ? dayKey(new Date(task.timestamp)) : null);

// Due before `now` and still to do or in progress. A note's date is when it was written: never overdue.
export const isOverdue = (task: Task, now: Date): boolean =>
    !task.archived &&
    !isNote(task) &&
    (task.status === STATUS_ENUM.TODO || task.status === STATUS_ENUM.IN_PROGRESS) &&
    !!task.timestamp &&
    new Date(task.timestamp) < now;

// The list's levels, left to right: each one holds the tasks of those before it too.
export const LEVELS = ["expired", "day", "week", "month", "all"] as const;
export type Level = (typeof LEVELS)[number];

// How many days, today included, "day" ("Oggi"), "week" ("7 giorni") and "month" ("4 settimane") reach.
const LEVEL_DAYS: Partial<Record<Level, number>> = { day: 1, week: 7, month: 28 };

// From the day of `date` to `count - 1` days later, both included.
export const nextDays = (date: Date, count: number): [string, string] => [
    dayKey(date),
    dayKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() + count - 1)),
];

// Due on a day from `from` to `to`, both included.
export const isDueBetween = (task: Task, from: string, to: string): boolean => {
    const day = dueDay(task);
    return day !== null && day >= from && day <= to;
};

// The last day a level reaches; null for "expired", which holds only the overdue tasks, and for "all", which has no end.
export const levelLastDay = (level: Level, now: Date): string | null => {
    const days = LEVEL_DAYS[level];
    return days ? nextDays(now, days)[1] : null;
};

// Whether a task is in a level's own part, the one it adds to the overdue tasks every level holds.
export const inLevel = (task: Task, level: Level, now: Date): boolean => {
    if (level === "all") return true;
    const last = levelLastDay(level, now);
    return last !== null && isDueBetween(task, dayKey(now), last);
};

// The due date (Unix ms) of a task added from a level, so it shows up there: 18:00 of the last
// day the level reaches; none from "expired" and "all".
export const tabDueDate = (level: Level, now: Date): number | "" => {
    const last = levelLastDay(level, now);
    return last ? new Date(`${last}T18:00`).getTime() : "";
};
