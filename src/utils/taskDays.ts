import { Task } from "../types/commonTypes";
import { STATUS_ENUM } from "../utils";
import { isEvent, isGoal, isNote } from "../components/TaskTitle";

const pad = (n: number) => String(n).padStart(2, "0");

// "YYYY-MM-DD" of a date, where the browser is.
export const dayKey = (date: Date): string =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// The day to work on a task, as it's saved, null without one: one from the 10th to the 13th is the 13th's.
export const dueDay = (task: Task): string | null => (task.timestamp ? dayKey(new Date(task.timestamp)) : null);

// Still to do or in progress, and something to do: a note's date is when it was written, a goal is never done.
export const isOpen = (task: Task): boolean =>
    !task.archived &&
    !isNote(task) &&
    !isGoal(task) &&
    (task.status === STATUS_ENUM.TODO || task.status === STATUS_ENUM.IN_PROGRESS);

// The last day a task can be done, "YYYY-MM-DD": its deadline, else an event's own day. Null when
// nothing fixes one. Twin of the API's Task::lastDay.
export const lastDay = (task: Task): string | null => task.deadline ?? (isEvent(task) ? dueDay(task) : null);

// Open, and its last day is over: late on the day after, not during it. The day to work on it never
// makes it late, since the API's cron (Cron\Quadrato\RollOverTasks) keeps bringing it to today.
export const isOverdue = (task: Task, now: Date): boolean => {
    const last = lastDay(task);
    return isOpen(task) && last !== null && last < dayKey(now);
};

// The day to work on a task: its own, or today for an open one whose day is over, as the cron
// makes it at its first run after midnight (an event stays on its day). Twin of Task::rollsOver.
export const workDay = (task: Task, now: Date): string | null => {
    const day = dueDay(task);
    return day !== null && day < dayKey(now) && isOpen(task) && !isEvent(task) ? dayKey(now) : day;
};

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
    const day = workDay(task, now);
    return last !== null && day !== null && day >= dayKey(now) && day <= last;
};

// The due date (Unix ms) of a task added from a level, so it shows up there: 18:00 of the last
// day the level reaches; none from "expired" and "all".
export const tabDueDate = (level: Level, now: Date): number | "" => {
    const last = levelLastDay(level, now);
    return last ? new Date(`${last}T18:00`).getTime() : "";
};
