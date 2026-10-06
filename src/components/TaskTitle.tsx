import React from "react";
import { Icon } from "@sensorario/sg-components";
import type { IconName } from "@sensorario/sg-components";

// @todo define task type
const taskTypeRegex = /^\[(feature|bug|pay|spike)\]\s*/i;

const taskTypeIcons: Record<string, { name: IconName; color: string }> = {
    feature: { name: "sparkle", color: '#5480e6' },
    bug: { name: "bug", color: '#e2727d' },
    pay: { name: "credit-card", color: '#2e9e5b' },
    spike: { name: "books", color: '#9b6bd1' },
};

const TaskTitle = ({ title, iconSize }: { title: string; iconSize?: number }) => {
    const taskTypeMatch = taskTypeRegex.exec(title);
    const taskType = taskTypeMatch?.[1].toLowerCase();
    const icon = taskType ? taskTypeIcons[taskType] : null;
    const text = taskTypeMatch ? title.slice(taskTypeMatch[0].length) : title;
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
