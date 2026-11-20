// Common types for Quadrato app

export type Periodicity = { number: string; unit: string };

// A "[goal]" task's target: at least `minutes` tracked in Tome each day, week or month.
export type GoalCadence = "day" | "week" | "month";
export type Goal = { cadence: GoalCadence; minutes: number };

export type Task = {
    id: number;
    title: string;
    longDescription?: string;
    project?: string;
    timestamp?: string | number | null;
    status: number;
    archived?: boolean;
    periodicity?: Periodicity;
    position?: number | null;
    parentId?: number | null;
    // Unix seconds; missing on tasks created before the API recorded it.
    createdAt?: number | null;
    // Planned start, Unix seconds (the start of its bar in the Gantt); none when not planned.
    startsAt?: number | null;
    goal?: Goal | null;
    // The last day it can be done, "YYYY-MM-DD", never moved by itself; the timestamp is the day to
    // work on it, which the API's cron brings to today while the task is open.
    deadline?: string | null;
    // How many times that cron moved the timestamp; only the API changes it.
    rolledOver?: number;
};

export type HandleAddAnotherModalParams = {
    addAnother: boolean;
    setShowPopup: (show: boolean) => void;
    setAddAnother: (addAnother: boolean) => void;
    setNewTaskTitle: (title: string) => void;
};

export type ModalProps = {
    children: React.ReactNode;
    title: string;
    icon?: React.ReactNode;
    onClick: () => void;
};

export type FooterProps = {
    setShowPopup: (show: boolean) => void;
    setShowCleanConfirm: (show: boolean) => void;
    showText: boolean;
};

export type ConfirmModalProps = {
    setShowCleanConfirm: (val: boolean) => void;
    handleCleanTasks: () => void;
    onClick: () => void;
};

export type HandleEditClickProp = {
    id: number;
    title: string;
    longDescription?: string;
    project?: string;
    timestamp?: string | number;
    periodicity?: Periodicity;
};
