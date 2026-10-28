import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@sensorario/sg-components";
import type { IconName } from "@sensorario/sg-components";

export const TASK_TYPES = ["feature", "bug", "pay", "spike", "epic", "chore", "docs", "note", "event"] as const;

// @todo define task type
const taskTypeRegex = new RegExp(`^\\[(${TASK_TYPES.join("|")})\\]\\s*`, "i");

export type TaskType = typeof TASK_TYPES[number];

export const taskTypeIcons: Record<TaskType, { name: IconName; color: string }> = {
    feature: { name: "sparkle", color: '#5480e6' },
    bug: { name: "bug", color: '#e2727d' },
    pay: { name: "credit-card", color: '#2e9e5b' },
    spike: { name: "books", color: '#9b6bd1' },
    epic: { name: "zap", color: '#e08a2e' },
    chore: { name: "wrench", color: '#7d8796' },
    docs: { name: "file-text", color: '#2a9d9a' },
    note: { name: "edit", color: '#888888' },
    event: { name: "users", color: '#c2559b' },
};

// A task's type is the start of its title: "[bug] Crash" is a bug called "Crash".
export const splitTaskType = (title: string): { type: TaskType | null; text: string } => {
    const match = taskTypeRegex.exec(title);
    return match
        ? { type: match[1].toLowerCase() as TaskType, text: title.slice(match[0].length) }
        : { type: null, text: title };
};

// A note is written down at the time it's added, not something to do: it has no status, it's
// never overdue and it doesn't keep its parent open. The Gantt leaves notes out.
export const isNote = (task: { title: string }): boolean => splitTaskType(task.title).type === "note";

// The types as icons, the one picked framed in its color: a click on it takes it away.
export const TaskTypePicker = ({ value, onChange, style }: {
    value: TaskType | null;
    onChange: (type: TaskType | null) => void;
    style?: React.CSSProperties;
}) => {
    const { t } = useTranslation();
    return (
        <div role="group" aria-label={t("app.taskTypeLegendLabel")} style={{ display: "flex", flexWrap: "wrap", gap: "8px", ...style }}>
            {TASK_TYPES.map((type) => {
                const picked = value === type;
                const { name, color } = taskTypeIcons[type];
                return (
                    <button
                        key={type}
                        type="button"
                        aria-pressed={picked}
                        aria-label={t(`app.${type}Label`)}
                        title={t(`app.${type}Label`)}
                        onClick={() => onChange(picked ? null : type)}
                        style={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            padding: "6px", borderRadius: "8px", cursor: "pointer",
                            border: `2px solid ${picked ? color : "transparent"}`,
                            background: picked ? `${color}22` : "transparent",
                            color,
                        }}
                    >
                        <Icon name={name} size={20} />
                    </button>
                );
            })}
        </div>
    );
};

const TaskTitle = ({ title, iconSize }: { title: string; iconSize?: number }) => {
    const { type: taskType, text } = splitTaskType(title);
    // A note is marked by its line, where the others have their status (TaskList).
    const icon = taskType && taskType !== "note" ? taskTypeIcons[taskType] : null;
    // @todo #45 define url type
    // The capturing group makes split() keep each URL at the odd indexes.
    const parts = text.split(/(https?:\/\/[^\s]+)/).map((part, i) =>
        i % 2 === 1
            ? <a key={i} href={part} className="task-link" target="_blank" rel="noopener noreferrer">{part}</a>
            : part
    );

    return (
        <>
            {icon && taskType && (
                <Icon name={icon.name} size={iconSize} aria-hidden={false} aria-label={taskType} style={{ color: icon.color }} />
            )}
            <span>{parts}</span>
        </>
    );
};

export default TaskTitle;
