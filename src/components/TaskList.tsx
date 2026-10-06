import React, { SetStateAction, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getStatusIcons, STATUS_ENUM } from "../utils";
import { Icon } from "@sensorario/sg-components";
import TaskModal from "./TaskModal";
import TaskTitle from "./TaskTitle";
import { toPlainText } from "../utils/toPlainText";
import { taskAge } from "../utils/taskAge";
import { Modal } from "./Modal";
import FormatDate from "./FormatDate";
import { Task } from "../types/commonTypes";
import { getConfigRepository } from "../repositories";
import { childrenOf, descendantIds, flattenTree, hasOpenDescendants, INDENT_PX, projectDrop, TreeRow } from "../utils/taskTree";
import { navigate } from "../Router";

// A project in one of the user's own workspaces, as listed by GET /quadrato/projects.
export type OwnProject = { id: string; name: string; workspace: string; workspaceUuid: string };

// @todo #44 extract task type in a common file and fix dateTime to timestamp
export const TaskList = ({ tasks, onTaskClick, updateTaskTitle, onReorder, onClearDueDates, onArchive, onDelete, onChangeProject, onCreateParent, onMoveToNewWorkspace, loadProjects, currentWorkspace, workspaces, workspaceProjects, editable, projectEditable, dateTimeEnabled, iconTheme, projectFilter }: {
    tasks: Task[];
    onTaskClick: (id: number) => void;
    updateTaskTitle: (id: number, title: string, longDescription?: string, project?: string, timestamp?: string | number, periodicity?: { number: string; unit: string } | null) => void;
    onReorder?: (taskId: Task['id'], parentId: Task['id'] | null, siblingIds: Task['id'][]) => void;
    onClearDueDates?: (ids: Task['id'][]) => void;
    onArchive?: (ids: Task['id'][]) => void;
    onDelete?: (ids: Task['id'][]) => void;
    onChangeProject?: (ids: Task['id'][], project: string, workspaceUuid?: string) => void;
    onCreateParent?: (ids: Task['id'][], title: string, project: string, workspaceUuid?: string) => void;
    onMoveToNewWorkspace?: (ids: Task['id'][], name: string) => Promise<'ok' | 'exists' | 'error'>;
    loadProjects?: () => Promise<OwnProject[]>;
    currentWorkspace?: string;
    workspaces?: { id: string; name: string }[];
    // All projects of the current workspace: `tasks` may be only the filtered ones on screen.
    workspaceProjects?: string[];
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
    const [drag, setDrag] = useState<{ insertIndex: number; depth: number; parentId: Task['id'] | null } | null>(null);
    const [draggedId, setDraggedId] = useState<Task['id'] | null>(null);
    const rowRefs = useRef(new Map<Task['id'], HTMLLIElement>());
    const prevTops = useRef(new Map<Task['id'], number>());

    // FLIP: when a status change moves a task to the top or bottom, every row slides
    // from its old offset to the new one. offsetTop (not getBoundingClientRect) so
    // page scroll between renders doesn't look like a move; skipped while dragging
    // because the drag hit-testing reads the rows' on-screen rects.
    useLayoutEffect(() => {
        const animate = drag === null && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        const tops = new Map<Task['id'], number>();
        rowRefs.current.forEach((el, id) => {
            tops.set(id, el.offsetTop);
            const prev = prevTops.current.get(id);
            if (!animate || prev === undefined || prev === el.offsetTop) return;
            el.style.transition = 'none';
            el.style.transform = `translateY(${prev - el.offsetTop}px)`;
            void el.offsetHeight;
            el.style.transition = 'transform 300ms ease';
            el.style.transform = '';
        });
        prevTops.current = tops;
    });
    const [selectedIds, setSelectedIds] = useState<Task['id'][]>([]);
    const [marquee, setMarquee] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
    const [showSelectionModal, setShowSelectionModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [projectQuery, setProjectQuery] = useState('');
    const [ownProjects, setOwnProjects] = useState<OwnProject[] | null>(null);
    // undefined means the current workspace.
    const [workspaceUuid, setWorkspaceUuid] = useState<string | undefined>(undefined);
    const [chosenProject, setChosenProject] = useState<string | null>(null);
    const [parentTitle, setParentTitle] = useState('');
    const [selectionTab, setSelectionTab] = useState<'move' | 'parent' | 'newWorkspace'>('move');
    const [newWorkspaceName, setNewWorkspaceName] = useState('');
    const [newWorkspaceError, setNewWorkspaceError] = useState<string | null>(null);
    const [movingToNewWorkspace, setMovingToNewWorkspace] = useState(false);

    useEffect(() => {
        if (!showSelectionModal || !onChangeProject || !loadProjects) return;
        let cancelled = false;
        loadProjects()
            .then(list => { if (!cancelled) setOwnProjects(list); })
            .catch(() => { });
        return () => { cancelled = true; };
    }, [showSelectionModal, onChangeProject, loadProjects]);
    const suppressClick = useRef(false);

    // Mouse only: pressing anywhere on the list and dragging draws a selection area.
    // It starts after a few pixels, so a plain click on a row still works.
    const startMarquee = (e: React.PointerEvent) => {
        if (!onClearDueDates || e.pointerType !== 'mouse' || e.button !== 0) return;
        const startX = e.clientX;
        const startY = e.clientY;
        let active = false;
        let selected: Task['id'][] = [];

        const onMove = (ev: PointerEvent) => {
            if (!active) {
                if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < 5) return;
                active = true;
                document.body.style.userSelect = 'none';
            }
            window.getSelection()?.removeAllRanges();
            const area = {
                left: Math.min(startX, ev.clientX),
                top: Math.min(startY, ev.clientY),
                right: Math.max(startX, ev.clientX),
                bottom: Math.max(startY, ev.clientY),
            };
            setMarquee({ left: area.left, top: area.top, width: area.right - area.left, height: area.bottom - area.top });
            selected = [...rowRefs.current.entries()]
                .filter(([, li]) => {
                    const rect = li.getBoundingClientRect();
                    return rect.left < area.right && rect.right > area.left && rect.top < area.bottom && rect.bottom > area.top;
                })
                .map(([id]) => id);
            setSelectedIds(selected);
        };
        const onUp = () => {
            if (active) {
                // The click that follows the release must not toggle a status or open the editor.
                suppressClick.current = true;
                setTimeout(() => { suppressClick.current = false; }, 0);
                if (selected.length > 0) setShowSelectionModal(true);
            }
            cleanup();
        };
        const cleanup = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', cleanup);
            document.body.style.userSelect = '';
            setMarquee(null);
            if (!active || selected.length === 0) setSelectedIds([]);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', cleanup);
    };

    const closeSelection = () => {
        setShowSelectionModal(false);
        setShowDeleteConfirm(false);
        setProjectQuery('');
        setWorkspaceUuid(undefined);
        setChosenProject(null);
        setParentTitle('');
        setSelectionTab('move');
        setNewWorkspaceName('');
        setNewWorkspaceError(null);
        setSelectedIds([]);
    };

    // Only completed or skipped tasks can be archived: the others in the selection are left alone.
    // A closed parent takes its subtasks along (they're closed too), so none is left orphaned.
    const isClosed = (task: Task) => task.status === STATUS_ENUM.DONE || task.status === STATUS_ENUM.SKIPPED;
    const archivableIds = [...new Set(tasks
        .filter(task => selectedIds.includes(task.id) && !task.archived && isClosed(task))
        .flatMap(task => [task.id, ...descendantIds(tasks, task.id)]))];
    // A task that still has subtasks can't be deleted.
    const deletableIds = selectedIds.filter(id => childrenOf(tasks, id).length === 0);
    const projects = [...new Set(tasks.map(task => task.project).filter((p): p is string => !!p))].sort();
    // The API lists only workspaces the user owns: the projects of the tasks on screen are added
    // so a shared workspace (or no API list at all, when logged out) still offers its own.
    const otherWorkspaces = (workspaces ?? []).filter(w => w?.id && w.name !== currentWorkspace);
    const ownOptions = (ownProjects ?? []).map(p => ({ name: p.name, workspaceUuid: p.workspace === currentWorkspace ? undefined : p.workspaceUuid }));
    const projectOptions = workspaceUuid
        ? ownOptions.filter(p => p.workspaceUuid === workspaceUuid).map(p => p.name)
        : [...new Set([...ownOptions.filter(p => !p.workspaceUuid).map(p => p.name), ...(workspaceProjects ?? projects)])];
    const query = projectQuery.trim();
    const matchingProjects = projectOptions
        .filter(name => name.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => a.localeCompare(b));
    const canCreateProject = query !== '' && !matchingProjects.some(name => name.toLowerCase() === query.toLowerCase());
    const isChosen = (name: string) => chosenProject === name;
    const hasDueDate = tasks.some(task => selectedIds.includes(task.id) && !!task.timestamp);
    // With no project picked the parent stays with its children: their project when they share one.
    const selectedProjects = [...new Set(tasks.filter(task => selectedIds.includes(task.id)).map(task => task.project ?? ''))];
    const parentProject = chosenProject ?? (!workspaceUuid && selectedProjects.length === 1 ? selectedProjects[0] : '');
    const projectOptionStyle = (chosen: boolean): React.CSSProperties => ({
        width: '100%', textAlign: 'left', border: 'none', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer',
        display: 'flex', justifyContent: 'space-between', gap: '8px', color: 'inherit', font: 'inherit',
        background: chosen ? 'rgba(84, 128, 230, 0.15)' : 'none',
    });

    const destinationPicker = (
        <>
            {otherWorkspaces.length > 0 && (
                <select
                    className="modal-input"
                    style={{ marginBottom: 0 }}
                    value={workspaceUuid ?? ''}
                    onChange={e => { setWorkspaceUuid(e.target.value || undefined); setProjectQuery(''); setChosenProject(null); }}
                    aria-label={t('taskList.workspaceLabel')}
                >
                    <option value="">{currentWorkspace}</option>
                    {otherWorkspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
            )}
            <input
                className="modal-input"
                style={{ marginBottom: 0 }}
                value={projectQuery}
                onChange={e => { setProjectQuery(e.target.value); setChosenProject(null); }}
                placeholder={t('taskList.searchProject')}
                aria-label={t('taskList.projectLabel')}
            />
            <ul aria-label={t('taskList.projectLabel')} style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: '220px', overflowY: 'auto' }}>
                {query === '' && (
                    <li>
                        <button type="button" aria-pressed={isChosen('')} style={projectOptionStyle(isChosen(''))} onClick={() => setChosenProject('')}>
                            <em>{t('taskList.noProject')}</em>
                        </button>
                    </li>
                )}
                {matchingProjects.map(name => (
                    <li key={name}>
                        <button type="button" aria-pressed={isChosen(name)} style={projectOptionStyle(isChosen(name))} onClick={() => setChosenProject(name)}>
                            <span>{name}</span>
                        </button>
                    </li>
                ))}
                {canCreateProject && (
                    <li>
                        <button type="button" aria-pressed={isChosen(query)} style={projectOptionStyle(isChosen(query))} onClick={() => setChosenProject(query)}>
                            {t('taskList.newProject', { name: query })}
                        </button>
                    </li>
                )}
            </ul>
        </>
    );
    const selectionTabs: { key: 'move' | 'parent' | 'newWorkspace'; title: string }[] = [
        { key: 'move', title: t('taskList.tabMove') },
        ...(onCreateParent ? [{ key: 'parent' as const, title: t('taskList.tabParent') }] : []),
        ...(onMoveToNewWorkspace ? [{ key: 'newWorkspace' as const, title: t('taskList.tabNewWorkspace') }] : []),
    ];

    // Dragging starts from the grip only, so clicks on the row and page scrolling are untouched.
    // Up and down picks the place, a small move sideways picks the level: right of the row
    // above makes it a subtask of that row, left brings it back up. Subtasks move along.
    const startDrag = (e: React.PointerEvent, task: Task, rows: TreeRow[]) => {
        if (!onReorder || e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        const subtree = new Set([task.id, ...descendantIds(rows.map(r => r.task), task.id)]);
        const others = rows.filter(r => !subtree.has(r.task.id));
        const startIndex = rows.findIndex(r => r.task.id === task.id);
        const startDepth = rows[startIndex].depth;
        const startX = e.clientX;
        const start = { insertIndex: startIndex, ...projectDrop(others, startIndex, startDepth, 0) };
        let state = start;
        setDraggedId(task.id);
        setDrag(state);

        const onMove = (ev: PointerEvent) => {
            let index = others.findIndex(r => {
                const rect = rowRefs.current.get(r.task.id)?.getBoundingClientRect();
                return rect !== undefined && ev.clientY < rect.top + rect.height / 2;
            });
            if (index === -1) index = others.length;
            const next = { insertIndex: index, ...projectDrop(others, index, startDepth, ev.clientX - startX) };
            if (next.insertIndex !== state.insertIndex || next.depth !== state.depth) {
                state = next;
                setDrag(next);
            }
        };
        const onUp = () => {
            if (state.insertIndex !== start.insertIndex || state.parentId !== start.parentId) {
                const ids = new Set(rows.map(r => r.task.id));
                const parentOf = (t: Task) => (t.parentId != null && ids.has(t.parentId) ? t.parentId : null);
                const ordered = [
                    ...others.slice(0, state.insertIndex).map(r => r.task),
                    task,
                    ...others.slice(state.insertIndex).map(r => r.task),
                ];
                const siblings = ordered.filter(t => t === task || parentOf(t) === state.parentId).map(t => t.id);
                onReorder(task.id, state.parentId, siblings);
            }
            cleanup();
        };
        const cleanup = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', cleanup);
            setDraggedId(null);
            setDrag(null);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', cleanup);
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

    const handler = (task: Task, depth: number, rows: TreeRow[]) => {
        const isExpired = dateTimeEnabled && task.timestamp && new Date(task.timestamp) < new Date();


        const isMobile = /iPhone/i.test(navigator.userAgent);

        // if timestamp does not contain "-" then convert it to ISO string for FormatDate
        if (dateTimeEnabled && task.timestamp && typeof task.timestamp === 'string' && !task.timestamp.includes('-')) {
            const timestampNum = Number(task.timestamp);
            if (!isNaN(timestampNum)) {
                task.timestamp = new Date(timestampNum).toISOString();
            }
        }

        const draggable = onReorder !== undefined;
        const blocked = hasOpenDescendants(tasks, task.id);
        const isDragged = draggedId === task.id;
        const isSelected = selectedIds.includes(task.id);

        return (
            <li
                key={task.id}
                ref={el => { if (el) rowRefs.current.set(task.id, el); else rowRefs.current.delete(task.id); }}
                className="task-item"
                onMouseEnter={() => setHoveredId(typeof task.id === 'number' ? task.id : null)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '4px', paddingLeft: `${4 + depth * INDENT_PX}px`, borderBottom: '1px solid #eee', cursor: isDragged ? 'grabbing' : 'pointer',
                    ...(isSelected && { background: '#e8f0fe' }),
                    ...(isDragged && { opacity: 0.6, background: '#f3f7ff', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' })
                }}

            >
                {draggable && (
                    <span
                        onPointerDown={e => startDrag(e, task, rows)}
                        title={t('taskList.dragHandle')}
                        aria-label={t('taskList.dragHandle')}
                        style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: '#aaa', cursor: isDragged ? 'grabbing' : 'grab', touchAction: 'none', padding: '0 2px' }}
                    >
                        <Icon name="grip-vertical" size={16} />
                    </span>
                )}
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

                    <span onClick={() => onTaskClick(task.id)} title={blocked ? t('taskList.subtasksOpen') : undefined} style={{ flexShrink: 0, verticalAlign: 'middle', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                        <TaskTitle title={task.title} />
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
                {/* Outside the flex: 1 title area, so it sits at the right edge of every row. */}
                {task.createdAt != null && (() => {
                    const age = taskAge(task.createdAt, Math.floor(Date.now() / 1000));
                    return (
                        <span style={{ flexShrink: 0, marginLeft: '8px', color: '#999', whiteSpace: 'nowrap' }} title={new Date(task.createdAt * 1000).toLocaleString()}>
                            {t(`taskList.age.${age.unit}`, { count: age.count })}
                        </span>
                    );
                })()}
            </li>
        );
    };

    const rows = flattenTree(tasks.filter(t => !t.archived));
    let displayRows = rows;
    if (drag && draggedId !== null) {
        const subtree = new Set([draggedId, ...descendantIds(tasks, draggedId)]);
        const others = rows.filter(r => !subtree.has(r.task.id));
        const moving = rows.filter(r => subtree.has(r.task.id));
        const shift = drag.depth - (moving[0]?.depth ?? 0);
        displayRows = [
            ...others.slice(0, drag.insertIndex),
            ...moving.map(r => ({ ...r, depth: r.depth + shift })),
            ...others.slice(drag.insertIndex),
        ];
    }

    return (
        <>
            <ul
                className="task-list"
                onPointerDown={startMarquee}
                onClickCapture={e => { if (suppressClick.current) { e.stopPropagation(); e.preventDefault(); } }}
            >
                {displayRows.map(r => handler(r.task, r.depth, rows))}
            </ul>
            {marquee && (
                <div
                    data-testid="selection-area"
                    style={{
                        position: 'fixed', ...marquee, pointerEvents: 'none', zIndex: 1000,
                        border: '1px dashed #5480e6', background: 'rgba(84, 128, 230, 0.1)'
                    }}
                />
            )}
            {showSelectionModal && onClearDueDates && (
                <Modal
                    title={t('taskList.selectionTitle')}
                    onClick={closeSelection}
                    buttons={[
                        { label: t('common.cancel'), onClick: closeSelection },
                        ...(hasDueDate
                            ? [{ label: t('taskList.clearDueDates'), onClick: () => { onClearDueDates(selectedIds); closeSelection(); } }]
                            : []),
                        ...(onArchive && archivableIds.length > 0
                            ? [{ label: t('taskList.archive', { count: archivableIds.length }), onClick: () => { onArchive(archivableIds); closeSelection(); } }]
                            : []),
                        // Deleting can't be undone: it goes through a second confirmation.
                        ...(onDelete && deletableIds.length > 0
                            ? [{ label: t('taskList.delete'), onClick: () => { setShowSelectionModal(false); setShowDeleteConfirm(true); } }]
                            : []),
                    ]}
                >
                    <p>{t('taskList.selectionMessage', { count: selectedIds.length })}</p>
                    {onChangeProject && (
                        <div className="tabbed-content">
                            <div className="tabs" role="tablist">
                                {selectionTabs.map(tab => (
                                    <div
                                        key={tab.key}
                                        role="tab"
                                        tabIndex={0}
                                        aria-selected={selectionTab === tab.key}
                                        className={`tab ${selectionTab === tab.key ? 'active' : ''}`}
                                        onClick={() => setSelectionTab(tab.key)}
                                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectionTab(tab.key); }}
                                    >
                                        <span>{tab.title}</span>
                                    </div>
                                ))}
                            </div>
                            {/* Only the active tab is rendered: the move and parent tabs share the destination picker. */}
                            <div className="tab-content active" role="tabpanel" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {selectionTab === 'parent' && onCreateParent && (
                                    <input
                                        className="modal-input"
                                        style={{ marginBottom: 0 }}
                                        value={parentTitle}
                                        onChange={e => setParentTitle(e.target.value)}
                                        placeholder={t('taskList.parentTitle')}
                                        aria-label={t('taskList.parentTitle')}
                                    />
                                )}
                                {selectionTab !== 'newWorkspace' && destinationPicker}
                                {selectionTab === 'move' && (
                                    <button
                                        type="button"
                                        className="modal-close-btn"
                                        disabled={chosenProject === null}
                                        onClick={() => { if (chosenProject !== null) { onChangeProject(selectedIds, chosenProject, workspaceUuid); closeSelection(); } }}
                                    >
                                        {t('taskList.moveToProject')}
                                    </button>
                                )}
                                {selectionTab === 'parent' && onCreateParent && (
                                    <button
                                        type="button"
                                        className="modal-close-btn"
                                        disabled={toPlainText(parentTitle).trim() === ''}
                                        onClick={() => { onCreateParent(selectedIds, toPlainText(parentTitle).trim(), parentProject, workspaceUuid); closeSelection(); }}
                                    >
                                        {t('taskList.createParent')}
                                    </button>
                                )}
                                {selectionTab === 'newWorkspace' && onMoveToNewWorkspace && (
                                    <>
                                        <input
                                            className="modal-input"
                                            style={{ marginBottom: 0 }}
                                            value={newWorkspaceName}
                                            onChange={e => { setNewWorkspaceName(e.target.value); setNewWorkspaceError(null); }}
                                            placeholder={t('taskList.newWorkspaceName')}
                                            aria-label={t('taskList.newWorkspaceName')}
                                        />
                                        {newWorkspaceError && <p role="alert" style={{ margin: 0, color: '#c0392b' }}>{newWorkspaceError}</p>}
                                        <button
                                            type="button"
                                            className="modal-close-btn"
                                            disabled={toPlainText(newWorkspaceName).trim() === '' || movingToNewWorkspace}
                                            onClick={async () => {
                                                setMovingToNewWorkspace(true);
                                                const result = await onMoveToNewWorkspace(selectedIds, toPlainText(newWorkspaceName).trim());
                                                setMovingToNewWorkspace(false);
                                                if (result === 'ok') closeSelection();
                                                else setNewWorkspaceError(t(result === 'exists' ? 'taskList.newWorkspaceExists' : 'taskList.newWorkspaceFailed'));
                                            }}
                                        >
                                            {t('taskList.moveToNewWorkspace')}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </Modal>
            )}
            {showDeleteConfirm && onDelete && (
                <Modal
                    title={t('taskList.deleteTitle')}
                    onClick={closeSelection}
                    buttons={[
                        { label: t('common.cancel'), onClick: closeSelection },
                        { label: t('taskList.deleteConfirm', { count: deletableIds.length }), onClick: () => { onDelete(deletableIds); closeSelection(); } },
                    ]}
                >
                    <p>{t('taskList.deleteMessage', { count: deletableIds.length })}</p>
                    {deletableIds.length < selectedIds.length && (
                        <p>{t('taskList.deleteSkipsParents', { count: selectedIds.length - deletableIds.length })}</p>
                    )}
                </Modal>
            )}
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