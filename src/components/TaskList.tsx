import React, { useState } from "react";
import { STATUS } from "../utils";
import EditIcon from "./EditIcon";
import EditTaskModal from "./EditTaskModal";

export const TaskList = ({ tasks, onTaskClick, updateTaskTitle, editable, projectEditable, dateTimeEnabled }) => {

    const [hoveredId, setHoveredId] = useState(null);
    const [editId, setEditId] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [editLongValue, setEditLongValue] = useState("");
    const [editProjectValue, setEditProjectValue] = useState("");
    const [editDateTimeValue, setEditDateTimeValue] = useState("");

    const handleEditClick = (task) => {
        setEditId(task.id);
        setEditValue(task.title);
        setEditLongValue(task.longDescription || "");
        setEditProjectValue(task.project || "");
        setEditDateTimeValue(task.dateTime || "");
    };

    const handleEditSave = () => {
        if (editValue.trim() === "") return;
        updateTaskTitle(editId, editValue, editLongValue, editProjectValue, editDateTimeValue);
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
        const isExpired = dateTimeEnabled && task.dateTime && new Date(task.dateTime) < new Date();
        return (
            <li
                key={task.id}
                className="task-item"
                onMouseEnter={() => setHoveredId(task.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
                <span
                    style={{
                        flex: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minWidth: 0,
                        color: isExpired ? 'red' : undefined
                    }}
                    onClick={() => onTaskClick(task.id)}>
                    <strong>{STATUS[task.status]}</strong>
                    {dateTimeEnabled && task.dateTime && (
                        <span style={{ margin: '0 4px', color: '#666' }}>[{new Date(task.dateTime).toLocaleString()}]</span>
                    )}
                    {projectEditable && task.project && (
                        <span style={{ margin: '0 4px', color: '#666' }}>({task.project})</span>
                    )}
                    {' '}<span dangerouslySetInnerHTML={{ __html: title }} />
                </span>
                {editable && hoveredId === task.id && (
                    <span style={{ marginLeft: '1rem', cursor: 'pointer' }} title="Modifica" onClick={e => { e.stopPropagation(); handleEditClick(task); }}>
                        <EditIcon />
                    </span>
                )}
            </li>
        );
    };

    // Ordina i task se dataTimeEnabled
    let orderedTasks = tasks;
    if (dateTimeEnabled) {
        const withDate = tasks.filter(t => t.dateTime);
        const withoutDate = tasks.filter(t => !t.dateTime);
        withDate.sort((a, b) => {
            const aTime = new Date(a.dateTime).getTime();
            const bTime = new Date(b.dateTime).getTime();
            return aTime - bTime;
        });
        orderedTasks = [...withDate, ...withoutDate];
    }
    return (
        <>
            <ul className="task-list">
                {orderedTasks.map(handler)}
            </ul>
            {editable && editId !== null && (
                <EditTaskModal
                    value={editValue}
                    setValue={setEditValue}
                    longValue={editLongValue}
                    setLongValue={setEditLongValue}
                    projectValue={editProjectValue}
                    setProjectValue={setEditProjectValue}
                    dateTimeValue={editDateTimeValue}
                    setDateTimeValue={setEditDateTimeValue}
                    onClose={() => setEditId(null)}
                    onSave={handleEditSave}
                    projectEditable={projectEditable}
                    dateTimeEnabled={dateTimeEnabled}
                />
            )}
        </>
    );
}

export default TaskList;