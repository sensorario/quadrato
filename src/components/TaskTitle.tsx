import React from "react";
import { Icon } from "@sensorario/sg-components";
import type { IconName } from "@sensorario/sg-components";

export const TASK_TYPES = ["feature", "bug", "pay", "spike", "epic", "chore", "docs"] as const;

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
};

// A task's type is the start of its title: "[bug] Crash" is a bug called "Crash".
export const splitTaskType = (title: string): { type: TaskType | null; text: string } => {
    const match = taskTypeRegex.exec(title);
    return match
        ? { type: match[1].toLowerCase() as TaskType, text: title.slice(match[0].length) }
        : { type: null, text: title };
};

const TaskTitle = ({ title, iconSize }: { title: string; iconSize?: number }) => {
    const { type: taskType, text } = splitTaskType(title);
    const icon = taskType ? taskTypeIcons[taskType] : null;
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
