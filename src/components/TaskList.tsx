import React, { SetStateAction, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getStatusIcons } from "../utils";
import { Icon } from "@sensorario/sg-components";
import TaskModal from "./TaskModal";
import FormatDate from "./FormatDate";
import { Task } from "../types/commonTypes";
import { getConfigRepository } from "../repositories";
import sortByDate from "../utils/filterTaskByVisibilityRange";
import { navigate } from "../Router";

// @todo #44 extract task type in a common file and fix dateTime to timestamp
export const TaskList = ({ tasks, onTaskClick, updateTaskTitle, onReorder, editable, projectEditable, dateTimeEnabled, iconTheme, projectFilter }: {
    tasks: Task[];
    onTaskClick: (id: number) => void;
    updateTaskTitle: (id: number, title: string, longDescription?: string, project?: string, timestamp?: string | number, periodicity?: { number: string; unit: string } | null) => void;
    onReorder?: (orderedIds: Task['id'][]) => void;
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
    const [dragOrder, setDragOrder] = useState<Task['id'][] | null>(null);
    const [draggedId, setDraggedId] = useState<Task['id'] | null>(null);
    const rowRefs = useRef(new Map<Task['id'], HTMLLIElement>());
    const suppressClick = useRef(false);

    // Only tasks without a due date can be reordered: dated ones stay sorted by date.
    // Mouse drags start after a few pixels so a plain click still works; touch drags
    // need a long press so a swipe keeps scrolling the page.
    const startDrag = (e: React.PointerEvent, task: Task, undatedIds: Task['id'][]) => {
        if (!onReorder || task.timestamp || e.button !== 0) return;
        const startX = e.clientX;
        const startY = e.clientY;
        const isTouch = e.pointerType !== 'mouse';
        let active = false;
        let order = undatedIds;
        let longPress: number | undefined;

        const activate = () => {
            active = true;
            window.getSelection()?.removeAllRanges();
            setDraggedId(task.id);
            setDragOrder(order);
        };
        const preventScroll = (ev: TouchEvent) => {
            if (active) ev.preventDefault();
        };
        const onMove = (ev: PointerEvent) => {
            if (!active) {
                const moved = Math.hypot(ev.clientX - startX, ev.clientY - startY);
                if (isTouch) {
                    if (moved > 8) cleanup();
                    return;
                }
                if (moved < 5) return;
                activate();
            }
            const others = order.filter(id => id !== task.id);
            let index = others.findIndex(id => {
                const rect = rowRefs.current.get(id)?.getBoundingClientRect();
                return rect !== undefined && ev.clientY < rect.top + rect.height / 2;
            });
            if (index === -1) index = others.length;
            const next = [...others.slice(0, index), task.id, ...others.slice(index)];
            if (next.some((id, i) => id !== order[i])) {
                order = next;
                setDragOrder(next);
            }
        };
        const onUp = () => {
            if (active) {
                // The click that follows the drop must not toggle the status or open the editor.
                suppressClick.current = true;
                setTimeout(() => { suppressClick.current = false; }, 0);
                if (order.some((id, i) => id !== undatedIds[i])) onReorder(order);
            }
            cleanup();
        };
        const cleanup = () => {
            clearTimeout(longPress);
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', cleanup);
            window.removeEventListener('touchmove', preventScroll);
            setDraggedId(null);
            setDragOrder(null);
        };

        if (isTouch) longPress = window.setTimeout(activate, 300);
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', cleanup);
        window.addEventListener('touchmove', preventScroll, { passive: false });
    };

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
    const taskTypeRegex = /^\[(feature|bug|pay)\]\s*/i;

    const handler = (task: Task, undatedIds: Task['id'][]) => {
        let title = task.title;
        const taskTypeMatch = taskTypeRegex.exec(title);
        const taskTypeIcons: Record<string, React.ReactElement> = { feature: <Icon name="sparkle" aria-hidden={false} aria-label="feature" style={{ color: '#5480e6' }} />, bug: <Icon name="bug" aria-hidden={false} aria-label="bug" style={{ color: '#e2727d' }} />, pay: <Icon name="credit-card" aria-hidden={false} aria-label="pay" style={{ color: '#2e9e5b' }} /> };
        const taskTypeIcon = taskTypeMatch ? taskTypeIcons[taskTypeMatch[1].toLowerCase()] : null;
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

        const draggable = onReorder !== undefined && !task.timestamp;
        const isDragged = draggedId === task.id;

        return (
            <li
                key={task.id}
                ref={el => { if (el) rowRefs.current.set(task.id, el); else rowRefs.current.delete(task.id); }}
                className="task-item"
                onMouseEnter={() => setHoveredId(typeof task.id === 'number' ? task.id : null)}
                onMouseLeave={() => setHoveredId(null)}
                onPointerDown={e => startDrag(e, task, undatedIds)}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '4px', borderBottom: '1px solid #eee', cursor: isDragged ? 'grabbing' : 'pointer',
                    ...(draggable && { WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }),
                    ...(isDragged && { opacity: 0.6, background: '#f3f7ff', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' })
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
                        <Icon name="zoom-in" size={16} />
                    </button>


                </span>
            </li>
        );
    };

    // Ordina i task se dataTimeEnabled

    let orderedTasks: Task[] = [];
    orderedTasks = sortByDate(tasks)
        .filter(t => !t.archived);

    const datedTasks = orderedTasks.filter(t => t.timestamp);
    const undatedTasks = orderedTasks.filter(t => !t.timestamp);
    const undatedIds = undatedTasks.map(t => t.id);
    if (dragOrder) {
        orderedTasks = [...datedTasks, ...dragOrder.map(id => undatedTasks.find(t => t.id === id) as Task)];
    }

    return (
        <>
            <ul className="task-list" onClickCapture={e => { if (suppressClick.current) { e.stopPropagation(); e.preventDefault(); } }}>
                {orderedTasks.map(task => handler(task, undatedIds))}
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