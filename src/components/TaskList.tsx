import React, { SetStateAction, useState } from "react";
import { getStatusIcons } from "../utils";
import EditIcon from "./EditIcon";
import EditTaskModal from "./EditTaskModal";
import FormatDate from "./FormatDate";
import { Task, HandleEditClickProp } from "../types/commonTypes";
import { getConfigRepository } from "../repositories";
import sortByDate from "../utils/filterTaskByVisibilityRange";
import { navigate } from "../Router";

// @todo #44 extract task type in a common file and fix dateTime to timestamp
export const TaskList = ({ tasks, onTaskClick, updateTaskTitle, editable, projectEditable, dateTimeEnabled, iconTheme }: {
    tasks: Task[];
    onTaskClick: (id: number) => void;
    updateTaskTitle: (id: number, title: string, longDescription?: string, project?: string, timestamp?: string | number, periodicity?: { number: string; unit: string }) => void;
    editable: boolean;
    projectEditable: boolean;
    dateTimeEnabled: boolean;
    iconTheme: 'default' | 'checked' | 'panda';
}) => {
    // Aggiorno la tipizzazione per timestamp
    // tasks: Array<{ id: number; title: string; status: number; longDescription?: string; project?: string; timestamp?: number | string; archived?: boolean; }>
    const STATUS = getStatusIcons(iconTheme);

    // Recupera i colori dei progetti dal repository
    let projectColors: Record<string, string> = getConfigRepository().getProjectColors();

    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const [editId, setEditId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");
    const [editLongValue, setEditLongValue] = useState("");
    const [editProjectValue, setEditProjectValue] = useState("");
    const [editTimestampValue, setEditTimestampValue] = useState<string | number>("");
    const [editPeriodicityValue, setEditPeriodicityValue] = useState({ number: '', unit: 'giorni' });

    // @todo #38 move types in a common file
    // Removed local type definition for HandleEditClickProp

    const handleEditClick = (task: HandleEditClickProp) => {
        setEditId(task.id);
        setEditValue(task.title);
        setEditLongValue(task.longDescription || "");
        setEditProjectValue(task.project || "");
        setEditTimestampValue(task.timestamp ?? "");
        setEditPeriodicityValue(task.periodicity || { number: '', unit: 'giorni' });
    };

    const handleEditSave = () => {
        if (editValue.trim() === "") return;
        if (editId !== null) {
            updateTaskTitle(editId, editValue, editLongValue, editProjectValue, editTimestampValue, editPeriodicityValue);
        }
        setEditId(null);
    };

    // @todo define task type
    const handler = (task: Task) => {
        let title = task.title;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const hasLink = urlRegex.test(title);
        if (hasLink) {
            // @todo #45 define url type
            title = title.replace(urlRegex, (url: string) => {
                return `<a href="${url}" class="task-link" target="_blank" rel="noopener noreferrer">${url}</a>`;
            });
        }
        const isExpired = dateTimeEnabled && task.timestamp && new Date(task.timestamp) < new Date();


        const isMobile = /iPhone/i.test(navigator.userAgent);

        // if timestamp does not contain "-" then convert it to ISO string for FormatDate
        if (dateTimeEnabled && task.timestamp && typeof task.timestamp === 'string' && !task.timestamp.includes('-')) {
            const timestampNum = Number(task.timestamp);
            if (!isNaN(timestampNum)) {
                task.timestamp = new Date(timestampNum).toISOString();
            }
        }

        return (
            <li
                key={task.id}
                className="task-item"
                onMouseEnter={() => setHoveredId(typeof task.id === 'number' ? task.id : null)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '4px', borderBottom: '1px solid #eee', cursor: 'pointer'
                }}

            >
                {/* Quadrato di stato (presente) */}
                {/* Quadrato colore progetto */}
                <span
                    style={{
                        flex: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minWidth: 0,
                        color: isExpired ? 'red' : undefined,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>

                    <span onClick={() => onTaskClick(task.id)} style={{ flexShrink: 0, verticalAlign: 'middle', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {projectEditable && <svg width="18" height="18" style={{ flexShrink: 0, verticalAlign: 'middle' }}>
                            <rect width="18" height="18" rx="3" fill={task.project && projectColors[task.project] ? projectColors[task.project] : '#ccc'} />
                        </svg>}

                        {STATUS[task.status]}

                        {dateTimeEnabled && task.timestamp && (
                            <span style={{ margin: '0', color: '#666' }}>
                                <FormatDate date={typeof task.timestamp === 'number' ? task.timestamp : (task.timestamp || '')} />
                            </span>
                        )}
                        {projectEditable && task.project && (
                            <span style={{ margin: '0', color: '#666' }}>({task.project})</span>
                        )}
                    </span>

                    <span style={{ cursor: 'pointer' }} title="Modifica" onClick={e => { e.stopPropagation(); handleEditClick(task); }}>
                        <span dangerouslySetInnerHTML={{ __html: title }} />
                    </span>

                    <button
                        title="Vedi dettaglio"
                        onClick={e => { e.stopPropagation(); navigate(`/task/${task.id}`); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', display: 'flex', alignItems: 'center', flexShrink: 0, color: '#888' }}
                        aria-label="Vedi dettaglio task"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            <line x1="11" y1="8" x2="11" y2="14" />
                            <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                    </button>


                </span>
            </li>
        );
    };

    // Ordina i task se dataTimeEnabled

    let orderedTasks: Task[] = [];
    orderedTasks = sortByDate(tasks)
        .filter(t => !t.archived);

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
                    timestampValue={editTimestampValue}
                    setTimestampValue={setEditTimestampValue}
                    periodicityValue={editPeriodicityValue}
                    setPeriodicityValue={setEditPeriodicityValue}
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