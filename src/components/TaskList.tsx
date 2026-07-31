import React, { SetStateAction, useState } from "react";
import { useTranslation } from "react-i18next";
import { getStatusIcons } from "../utils";
import EditIcon from "./EditIcon";
import FeatureIcon from "./FeatureIcon";
import BugIcon from "./BugIcon";
import TaskModal from "./TaskModal";
import FormatDate from "./FormatDate";
import { Task } from "../types/commonTypes";
import { getConfigRepository } from "../repositories";
import sortByDate from "../utils/filterTaskByVisibilityRange";
import { navigate } from "../Router";

// @todo #44 extract task type in a common file and fix dateTime to timestamp
export const TaskList = ({ tasks, onTaskClick, updateTaskTitle, editable, projectEditable, dateTimeEnabled, iconTheme, projectFilter }: {
    tasks: Task[];
    onTaskClick: (id: number) => void;
    updateTaskTitle: (id: number, title: string, longDescription?: string, project?: string, timestamp?: string | number, periodicity?: { number: string; unit: string } | null) => void;
    editable: boolean;
    projectEditable: boolean;
    dateTimeEnabled: boolean;
    iconTheme: 'default' | 'checked' | 'panda';
    projectFilter?: string | null;
}) => {
    const { t } = useTranslation();
    // Aggiorno la tipizzazione per timestamp
    // tasks: Array<{ id: number; title: string; status: number; longDescription?: string; project?: string; timestamp?: number | string; archived?: boolean; }>
    const STATUS = getStatusIcons(iconTheme);

    // Recupera i colori dei progetti dal repository
    let projectColors: Record<string, string> = getConfigRepository().getProjectColors();

    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const [editTask, setEditTask] = useState<Task | null>(null);

    const handleEditClick = (task: Task) => {
        setEditTask(task);
    };

    const handleEditSave = (values: { title: string; longDescription: string; project: string; timestamp: string | number | ""; periodicity: { number: string; unit: string } | null }) => {
        if (editTask) {
            updateTaskTitle(editTask.id, values.title, values.longDescription, values.project, values.timestamp, values.periodicity);
        }
        setEditTask(null);
    };

    // @todo define task type
    const taskTypeRegex = /^\[(feature|bug)\]\s*/i;

    const handler = (task: Task) => {
        let title = task.title;
        const taskTypeMatch = taskTypeRegex.exec(title);
        const taskTypeIcon = taskTypeMatch
            ? (taskTypeMatch[1].toLowerCase() === 'bug' ? <BugIcon /> : <FeatureIcon />)
            : null;
        if (taskTypeMatch) {
            title = title.slice(taskTypeMatch[0].length);
        }
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
                        {projectEditable && task.project && task.project !== projectFilter && (
                            <span style={{ margin: '0', color: '#666' }}>({task.project})</span>
                        )}
                    </span>

                    <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} title={t('taskList.edit')} onClick={e => { e.stopPropagation(); handleEditClick(task); }}>
                        {taskTypeIcon}
                        <span dangerouslySetInnerHTML={{ __html: title }} />
                    </span>

                    <button
                        title={t('taskList.viewDetail')}
                        onClick={e => { e.stopPropagation(); navigate(`/task/${task.id}`); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', display: 'flex', alignItems: 'center', flexShrink: 0, color: '#888' }}
                        aria-label={t('taskList.viewDetailAria')}
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
            {editable && editTask !== null && (
                <TaskModal
                    key={editTask.id}
                    mode="edit"
                    initialValues={editTask}
                    onSave={handleEditSave}
                    onClose={() => setEditTask(null)}
                    projectEditable={projectEditable}
                    dateTimeEnabled={dateTimeEnabled}
                />
            )}
        </>
    );
}

export default TaskList;