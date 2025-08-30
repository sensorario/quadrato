import React, { useState } from "react";
import { STATUS } from "../utils";
import EditIcon from "./EditIcon";
import EditTaskModal from "./EditTaskModal";

export const TaskList = ({ tasks, onTaskClick, updateTaskTitle, editable }) => {

    const [hoveredId, setHoveredId] = useState(null);
    const [editId, setEditId] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [editLongValue, setEditLongValue] = useState("");

    const handleEditClick = (task) => {
        setEditId(task.id);
        setEditValue(task.title);
        setEditLongValue(task.longDescription || "");
    };

    const handleEditSave = () => {
        if (editValue.trim() === "") return;
        updateTaskTitle(editId, editValue, editLongValue);
        setEditId(null);
    };

    const handler = (task) => {
        let title = task.title;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const hasLink = urlRegex.test(title);
        if (hasLink) {
            title = title.replace(urlRegex, (url) => {
                return `<a href="${url}" class="task-link" target="_blank" rel="noopener noreferrer">${url}</a>`;
            });
        }
        return (
            <li
                key={task.id}
                className="task-item"
                onMouseEnter={() => setHoveredId(task.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
                <span
                    style={{ flex: 1 }}
                    onClick={() => onTaskClick(task.id)}>
                    <strong>{STATUS[task.status]}</strong> - <span dangerouslySetInnerHTML={{ __html: title }} />
                </span>
                {editable && hoveredId === task.id && (
                    <span style={{ marginLeft: '1rem', cursor: 'pointer' }} title="Modifica" onClick={e => { e.stopPropagation(); handleEditClick(task); }}>
                        <EditIcon />
                    </span>
                )}
            </li>
        );
    };

    return (
        <>
            <ul className="task-list">
                {tasks.map(handler)}
            </ul>
            {editable && editId !== null && (
                <EditTaskModal
                    value={editValue}
                    setValue={setEditValue}
                    longValue={editLongValue}
                    setLongValue={setEditLongValue}
                    onClose={() => setEditId(null)}
                    onSave={handleEditSave}
                />
            )}
        </>
    );
}

export default TaskList;