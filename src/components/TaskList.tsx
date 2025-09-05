import React, { useState } from "react";
import { STATUS } from "../utils";
import EditIcon from "./EditIcon";
import EditTaskModal from "./EditTaskModal";

export const TaskList = ({ tasks, onTaskClick, updateTaskTitle, editable, projectEditable, dateTimeEnabled }) => {
    // Recupera i colori dei progetti dal localStorage
    let projectColors: Record<string, string> = {};
    try {
        const saved = localStorage.getItem('simplanner-project-colors');
        projectColors = saved ? JSON.parse(saved) : {};
    } catch (e) {
        projectColors = {};
    }

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
        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            return d.toLocaleString('it-IT', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).replace(/\//g, '-');
        };
        const isMobile = /iPhone/i.test(navigator.userAgent);
        return (
            <li
                key={task.id}
                className="task-item"
                onMouseEnter={() => setHoveredId(task.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
                {/* Quadrato di stato (presente) */}
                {/* Quadrato colore progetto */}
                <svg width="18" height="18" style={{ marginRight: 4, marginBottom: -3 }}>
                    <rect width="18" height="18" rx="3" fill={projectColors[task.project] || '#ccc'} />
                </svg>
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

                    {STATUS[task.status]}
                    {dateTimeEnabled && task.dateTime && (
                        <span style={{ margin: '0 4px', color: '#666' }}>[{formatDate(task.dateTime)}]</span>
                    )}
                    {projectEditable && task.project && (
                        <span style={{ margin: '0 4px', color: '#666' }}>({task.project})</span>
                    )}
                    {' '}<span dangerouslySetInnerHTML={{ __html: title }} />
                </span>
                {editable && (isMobile || hoveredId === task.id) && (
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