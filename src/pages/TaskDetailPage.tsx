import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, Logo, QuadratoHeader } from '@sensorario/sg-components';
import { Task } from '../types/commonTypes';
import { getConfigRepository } from '../repositories';
import { navigate } from '../Router';
import TaskTitle from '../components/TaskTitle';
import { STATUS_ENUM } from '../utils';
import { byPosition, descendantIds, flattenTree, hasOpenDescendants, reconcileAncestors, toTime, TreeRow } from '../utils/taskTree';
import { dayKey } from '../utils/taskDays';
import { toPlainText } from '../utils/toPlainText';
import { useSlidingRows } from '../functions/useSlidingRows';

const UNIT_KEYS: Record<string, string> = { minuti: 'minutes', giorni: 'days', settimane: 'weeks', mesi: 'months', anni: 'years' };

// A due date (Unix ms) as a datetime-local field writes it, where the browser is.
const dateTimeField = (time: number | null) => {
    if (time === null) return '';
    const date = new Date(time);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${dayKey(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const withPositions = (tasks: Task[], positions: Map<Task['id'], number>) =>
    tasks.map(t => positions.has(t.id) && t.position !== positions.get(t.id) ? { ...t, position: positions.get(t.id) } : t);

const goBack = (task: Task) => {
    const anyTask = task as any;
    const repo = getConfigRepository();
    if (task.project) {
        repo.setProjectFilter(task.project);
        navigate('/');
    } else if (anyTask.workspace) {
        repo.setProjectFilter('ALL');
        navigate('/' + encodeURIComponent(anyTask.workspace));
    } else {
        navigate('/');
    }
};

const Breadcrumb = ({ task }: { task: Task }) => {
    const { t } = useTranslation();
    const anyTask = task as any;
    const repo = getConfigRepository();
    const crumbStyle: React.CSSProperties = {
        cursor: 'pointer', background: 'none', border: 'none',
        color: '#007bff', fontSize: '14px', padding: 0,
    };
    const sepStyle: React.CSSProperties = { margin: '0 6px', color: '#aaa', fontSize: '14px' };

    return (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            {anyTask.workspace ? (
                <button style={crumbStyle} onClick={() => {
                    repo.setProjectFilter('ALL');
                    navigate('/' + encodeURIComponent(anyTask.workspace));
                }}>
                    {anyTask.workspace}
                </button>
            ) : (
                <button style={crumbStyle} onClick={() => navigate('/')}>{t('taskDetailPage.home')}</button>
            )}
            {task.project && (
                <>
                    <span style={sepStyle}>/</span>
                    <button style={crumbStyle} onClick={() => {
                        repo.setProjectFilter(task.project!);
                        navigate('/');
                    }}>
                        {task.project}
                    </button>
                </>
            )}
            {/* The Gantt opened on this task's project, by its route (see the Gantt's App.jsx). */}
            <a
                href={`https://gantt.simonegentili.com/${task.project ? `progetto/${encodeURIComponent(task.project)}` : 'senza-progetto'}`}
                title={t('taskDetailPage.openInGantt')}
                aria-label={t('taskDetailPage.openInGantt')}
                style={{ marginLeft: 'auto', display: 'flex', color: '#007bff' }}
            >
                <Logo name="gantt" size={22} />
            </a>
        </div>
    );
};

// The title as the list shows it. A double click makes the text itself editable, as an input:
// Enter saves it, Esc or a click elsewhere puts it back as it was.
const EditableTitle = ({ title, onSave }: { title: string; onSave: (title: string) => void }) => {
    const { t } = useTranslation();
    const [editing, setEditing] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!editing || !element) return;
        element.focus();
        // The caret after the last character, as when clicking an input.
        const range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
    }, [editing]);

    if (!editing) {
        return (
            <span
                onDoubleClick={() => setEditing(true)}
                title={t('taskDetailPage.editTitleHint')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'text' }}
            >
                <TaskTitle title={title} iconSize={36} />
            </span>
        );
    }

    const finish = (save: boolean) => {
        const value = toPlainText(ref.current?.textContent ?? '').trim();
        setEditing(false);
        if (save && value !== '' && value !== title) onSave(value);
    };

    return (
        <span
            ref={ref}
            role="textbox"
            aria-label={t('taskDetailPage.title')}
            contentEditable="plaintext-only"
            suppressContentEditableWarning
            onKeyDown={e => {
                // Enter also ends what an input method (Japanese, Chinese…) is composing: that's no save.
                if (e.nativeEvent.isComposing) return;
                if (e.key === 'Enter') {
                    e.preventDefault();
                    finish(true);
                } else if (e.key === 'Escape') {
                    finish(false);
                }
            }}
            onBlur={() => finish(false)}
            style={{ minWidth: '2ch', padding: '0 4px', borderRadius: '6px', outline: '2px solid #dbe8ff' }}
        >
            {title}
        </span>
    );
};

type TaskDetailPageProps = {
    taskId: string;
};

export const TaskDetailPage = ({ taskId }: TaskDetailPageProps) => {
    const { t } = useTranslation();
    const statusLabel: Record<number, string> = {
        [STATUS_ENUM.TODO]: t('taskDetailPage.statusTodo'),
        [STATUS_ENUM.IN_PROGRESS]: t('taskDetailPage.statusInProgress'),
        [STATUS_ENUM.DONE]: t('taskDetailPage.statusDone'),
        [STATUS_ENUM.SKIPPED]: t('taskDetailPage.statusSkipped'),
    };
    const [task, setTask] = useState<Task | null>(null);
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [newSubtask, setNewSubtask] = useState('');
    const subtaskInputRef = useRef<HTMLInputElement>(null);
    const [notFound, setNotFound] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(
        () => Boolean(localStorage.getItem('simonegentili.com-access-token'))
    );
    const [deleting, setDeleting] = useState(false);
    // While a subtask is dragged: the siblings' positions where it would land, shown at once.
    const [draggedId, setDraggedId] = useState<Task['id'] | null>(null);
    const [dragPositions, setDragPositions] = useState<Map<Task['id'], number> | null>(null);
    // Bumped to draw the date fields again from the task, when what was typed isn't kept.
    const [datesRevision, setDatesRevision] = useState(0);
    const { rowRef, isAbove, startFollowing, follow, stopFollowing } = useSlidingRows(taskId);

    const matchTask = (t: any) =>
        String(t.id) === String(taskId) || String(t.uuid) === String(taskId);

    useEffect(() => {
        const repo = getConfigRepository();
        repo.onDataLoaded(() => {
            const tasks: Task[] = (repo as any).getTasks ? (repo as any).getTasks() : [];
            setAllTasks(tasks);
            const found = tasks.find(matchTask);
            if (found) {
                setTask(found);
            } else {
                setNotFound(true);
            }
        });
        repo.onAuthenticated(() => setIsAuthenticated(true));
        repo.onUnauthorized(() => setIsAuthenticated(false));

        // Fallback: try from localStorage directly
        const raw = localStorage.getItem('simplanner-tasks');
        if (raw) {
            try {
                const tasks: Task[] = JSON.parse(raw);
                setAllTasks(tasks);
                const found = tasks.find(matchTask);
                if (found) {
                    setTask(found);
                } else {
                    setNotFound(true);
                }
            } catch {
                setNotFound(true);
            }
        }
    }, [taskId]);

    // Opening a task, also another one from its subtasks, lands in the new-subtask field.
    useEffect(() => {
        subtaskInputRef.current?.focus();
    }, [task?.id]);

    const handleLogin = async (username: string, password: string) => {
        try {
            // Autenticandosi direttamente su questa pagina (invece di rimandare
            // a /login) l'utente resta su /task/:id e i dati del task vengono
            // ricaricati automaticamente da onDataLoaded al termine del login.
            await getConfigRepository().authenticate(username, password);
        } catch (err) {
            alert(t('loginPage.loginFailed', { message: (err as Error).message }));
        }
    };

    const handleLogout = () => {
        getConfigRepository().logout();
        setIsAuthenticated(false);
        setTask(null);
    };

    const handleDelete = async () => {
        if (!task || !window.confirm(t('taskDetailPage.deleteConfirm'))) {
            return;
        }

        const token = localStorage.getItem('simonegentili.com-access-token');
        setDeleting(true);
        try {
            const res = await fetch(`https://api.simonegentili.com/quadrato/task/${task.id}`, {
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            if (res.status === 401) {
                localStorage.removeItem('simonegentili.com-access-token');
                setIsAuthenticated(false);
                return;
            }

            if (res.status === 409) {
                alert(t('taskDetailPage.deleteHasSubtasks'));
                return;
            }

            if (!res.ok) {
                throw new Error(String(res.status));
            }

            goBack(task);
        } catch {
            alert(t('taskDetailPage.deleteFailed'));
        } finally {
            setDeleting(false);
        }
    };

    const handleAddSubtask = async () => {
        const title = toPlainText(newSubtask).trim();
        if (!task || title === '') return;
        // Emptied at once and never disabled, so it keeps the focus (also after a click on the
        // button): the next subtask can be typed while this one is saved. Put back if saving
        // fails and nothing new was typed.
        setNewSubtask('');
        subtaskInputRef.current?.focus();
        const restore = () => setNewSubtask(current => current === '' ? title : current);

        const headers = {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('simonegentili.com-access-token')
                ? { Authorization: `Bearer ${localStorage.getItem('simonegentili.com-access-token')}` }
                : {}),
        };
        try {
            const res = await fetch('https://api.simonegentili.com/quadrato/task', {
                method: 'POST',
                headers,
                body: JSON.stringify({ title, project: task.project ?? '', parentId: task.id, status: STATUS_ENUM.TODO, archived: false }),
            });
            if (res.status === 401) {
                localStorage.removeItem('simonegentili.com-access-token');
                setIsAuthenticated(false);
                restore();
                return;
            }
            const created = (await res.json())?.task;
            if (!res.ok || !created?.id) throw new Error(String(res.status));

            // A closed task with a new open subtask is open again, as the list does it.
            const reconciled = reconcileAncestors([...allTasks, created], [task.id]);
            const before = new Map(allTasks.map(t => [t.id, t]));
            for (const t of reconciled) {
                const old = before.get(t.id);
                if (old && old.status !== t.status) {
                    await fetch(`https://api.simonegentili.com/quadrato/task/${t.id}`, {
                        method: 'PUT',
                        headers,
                        body: JSON.stringify({ status: t.status }),
                    });
                }
            }

            getConfigRepository().fetchData();
        } catch {
            restore();
            alert(t('taskDetailPage.addSubtaskFailed'));
        }
    };

    // Shown at once, put back if the API doesn't take it.
    const handleRename = async (title: string) => {
        if (!task) return;
        const previous = task.title;
        setTask({ ...task, title });
        const token = localStorage.getItem('simonegentili.com-access-token');
        try {
            const res = await fetch(`https://api.simonegentili.com/quadrato/task/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: JSON.stringify({ title }),
            });
            if (res.status === 401) {
                localStorage.removeItem('simonegentili.com-access-token');
                setIsAuthenticated(false);
                return;
            }
            if (!res.ok) throw new Error(String(res.status));
            getConfigRepository().fetchData();
        } catch {
            setTask(current => current && { ...current, title: previous });
            alert(t('taskDetailPage.renameFailed'));
        }
    };

    // Shown at once, put back if the API doesn't take it. As in the list, the rules between a
    // task and its subtasks apply first, up from `from` (reconcileAncestors): parents close with
    // their last open subtask and reopen when one isn't, and are due no earlier than their
    // subtasks. Every task that changes is saved.
    const saveChanges = async (changes: Partial<Task>, from: Task['id'][], failure: string) => {
        if (!task) return;
        const before = allTasks;
        const after = reconcileAncestors(before.map(t => t.id === task.id ? { ...t, ...changes } : t), from);
        const previous = new Map(before.map(t => [t.id, t]));
        const puts = after.flatMap(t => {
            const old = previous.get(t.id);
            if (!old || old === t) return [];
            const body = Object.fromEntries((['status', 'timestamp', 'startsAt'] as const)
                .filter(field => (old[field] ?? null) !== (t[field] ?? null))
                .map(field => [field, t[field] ?? null]));
            return Object.keys(body).length > 0 ? [{ id: t.id, body }] : [];
        });
        setAllTasks(after);
        setTask(after.find(t => t.id === task.id) ?? task);
        const token = localStorage.getItem('simonegentili.com-access-token');
        try {
            const responses = await Promise.all(puts.map(({ id, body }) =>
                fetch(`https://api.simonegentili.com/quadrato/task/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                    body: JSON.stringify(body),
                })
            ));
            if (responses.some(res => res.status === 401)) {
                localStorage.removeItem('simonegentili.com-access-token');
                setIsAuthenticated(false);
                return;
            }
            if (responses.some(res => !res.ok)) throw new Error('save');
            getConfigRepository().fetchData();
        } catch {
            setAllTasks(before);
            setTask(task);
            setDatesRevision(r => r + 1);
            alert(failure);
        }
    };

    // From the parent up: the task itself keeps the status picked.
    const handleStatus = (status: number) => {
        if (!task || task.status === status) return;
        saveChanges({ status }, task.parentId != null ? [task.parentId] : [], t('taskDetailPage.statusFailed'));
    };

    // The fields are saved when left (or on Enter), not at every keystroke: a date being typed
    // is complete only then. The start is a day, as in the Gantt; the due date has its time.
    const startDay = task?.startsAt ? dayKey(new Date(task.startsAt * 1000)) : '';
    const dueTime = task ? toTime(task.timestamp) : null;
    const rejectDates = () => {
        setDatesRevision(r => r + 1);
        alert(t('taskDetailPage.startAfterEnd'));
    };

    const handleStart = (day: string) => {
        if (!task || day === startDay) return;
        if (day !== '' && dueTime !== null && day > dayKey(new Date(dueTime))) return rejectDates();
        const startsAt = day === '' ? null : Math.floor(new Date(`${day}T00:00:00`).getTime() / 1000);
        saveChanges({ startsAt }, [], t('taskDetailPage.datesFailed'));
    };

    // From the task itself up: it can't be due before its subtasks, its parents after it.
    const handleDue = (value: string) => {
        if (!task) return;
        const timestamp = value === '' ? null : new Date(value).getTime();
        if (timestamp === dueTime) return;
        if (timestamp !== null && startDay !== '' && dayKey(new Date(timestamp)) < startDay) return rejectDates();
        saveChanges({ timestamp }, [task.id], t('taskDetailPage.datesFailed'));
    };

    // Shown at once, put back if the API doesn't take it.
    const saveOrder = async (positions: Map<Task['id'], number>) => {
        const before = allTasks;
        const after = withPositions(before, positions);
        const changed = after.filter((t, i) => t !== before[i]);
        if (changed.length === 0) return;
        setAllTasks(after);
        const token = localStorage.getItem('simonegentili.com-access-token');
        try {
            const responses = await Promise.all(changed.map(t =>
                fetch(`https://api.simonegentili.com/quadrato/task/${t.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                    body: JSON.stringify({ position: t.position }),
                })
            ));
            if (responses.some(res => res.status === 401)) {
                localStorage.removeItem('simonegentili.com-access-token');
                setIsAuthenticated(false);
                return;
            }
            if (responses.some(res => !res.ok)) throw new Error('reorder');
            getConfigRepository().fetchData();
        } catch {
            setAllTasks(before);
            alert(t('taskDetailPage.reorderFailed'));
        }
    };

    // Dragged by the grip, up and down among its siblings only: its own subtasks move along,
    // and it never ends up under another task. The rows follow the pointer, the others slide
    // out of the way, and on release they slide into their place.
    const startDrag = (e: React.PointerEvent, sub: Task, rows: TreeRow[]) => {
        if (e.button !== 0) return;
        e.preventDefault();
        const siblings = rows.filter(r => r.task.parentId === sub.parentId).map(r => r.task);
        const others = siblings.filter(s => s.id !== sub.id);
        const startIndex = siblings.indexOf(sub);
        const positionsAt = (index: number) =>
            new Map([...others.slice(0, index), sub, ...others.slice(index)].map((s, i) => [s.id, i]));
        const startY = e.clientY;
        let index = startIndex;
        startFollowing([sub.id, ...descendantIds(allTasks, sub.id)]);
        setDraggedId(sub.id);
        setDragPositions(positionsAt(index));

        const onMove = (ev: PointerEvent) => {
            follow(ev.clientY - startY);
            let next = others.findIndex(s => isAbove(s.id, ev.clientY));
            if (next === -1) next = others.length;
            if (next !== index) {
                index = next;
                setDragPositions(positionsAt(index));
            }
        };
        const finish = (save: boolean) => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onCancel);
            stopFollowing();
            setDraggedId(null);
            setDragPositions(null);
            if (save && index !== startIndex) saveOrder(positionsAt(index));
        };
        const onUp = () => finish(true);
        const onCancel = () => finish(false);

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onCancel);
    };

    const containerStyle: React.CSSProperties = {
        maxWidth: '600px',
        margin: '40px auto',
        padding: '24px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        fontFamily: 'sans-serif',
    };

    const labelStyle: React.CSSProperties = {
        fontWeight: 'bold',
        color: '#555',
        marginTop: '16px',
        display: 'block',
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    };

    const valueStyle: React.CSSProperties = {
        marginTop: '4px',
        fontSize: '15px',
        color: '#222',
    };

    const header = <QuadratoHeader onLogin={handleLogin} onLogout={handleLogout} />;

    if (!isAuthenticated) {
        return (
            <>
                {header}
                <div style={containerStyle}>
                    <p>{t('taskDetailPage.loginRequired')}</p>
                </div>
            </>
        );
    }

    if (notFound && !task) {
        return (
            <>
                {header}
                <div style={containerStyle}>
                    <button
                        onClick={() => navigate('/')}
                        style={{ marginBottom: '20px', cursor: 'pointer', background: 'none', border: 'none', color: '#007bff', fontSize: '14px' }}
                    >
                        {t('taskDetailPage.back')}
                    </button>
                    <p>{t('taskDetailPage.notFound')}</p>
                </div>
            </>
        );
    }

    if (!task) {
        return (
            <>
                {header}
                <div style={containerStyle}>
                    <p>{t('taskDetailPage.loading')}</p>
                </div>
            </>
        );
    }

    return (
        <>
            {header}
            <div style={containerStyle}>
                <Breadcrumb task={task} />

                <h2 style={{ margin: '0 0 8px', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <EditableTitle title={task.title} onSave={handleRename} />
                </h2>

                {(() => {
                    const parent = task.parentId != null ? allTasks.find(t => t.id === task.parentId) : undefined;
                    if (!parent) return null;
                    return (
                        <>
                            <span style={labelStyle}>{t('taskDetailPage.parent')}</span>
                            <button
                                type="button"
                                onClick={() => navigate(`/task/${parent.id}`)}
                                style={{ ...valueStyle, background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', fontSize: '15px', color: '#007bff', display: 'flex', alignItems: 'center', gap: '6px', textAlign: 'left' }}
                            >
                                <TaskTitle title={parent.title} />
                            </button>
                        </>
                    );
                })()}

                <span style={labelStyle}>{t('taskDetailPage.status')}</span>
                <div role="group" aria-label={t('taskDetailPage.status')} style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    {[STATUS_ENUM.TODO, STATUS_ENUM.IN_PROGRESS, STATUS_ENUM.DONE, STATUS_ENUM.SKIPPED].map(status => {
                        // As in the list: a task closes by itself with its last open subtask.
                        const blocked = (status === STATUS_ENUM.DONE || status === STATUS_ENUM.SKIPPED) && hasOpenDescendants(allTasks, task.id);
                        const current = task.status === status;
                        return (
                            <button
                                key={status}
                                type="button"
                                aria-pressed={current}
                                disabled={blocked}
                                title={blocked ? t('taskList.subtasksOpen') : undefined}
                                onClick={() => handleStatus(status)}
                                style={{
                                    padding: '4px 12px', borderRadius: '999px', fontSize: '13px',
                                    border: `1px solid ${current ? '#007bff' : '#ccc'}`,
                                    background: current ? '#007bff' : '#fff',
                                    color: current ? '#fff' : '#333',
                                    cursor: blocked ? 'not-allowed' : 'pointer',
                                    opacity: blocked ? 0.5 : 1,
                                }}
                            >
                                {statusLabel[status]}
                            </button>
                        );
                    })}
                </div>

                {task.project && (
                    <>
                        <span style={labelStyle}>{t('taskDetailPage.project')}</span>
                        <span style={valueStyle}>{task.project}</span>
                    </>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                    {/* Uncontrolled, drawn again (key) when the task's dates change or what was typed isn't kept. */}
                    <label>
                        <span style={labelStyle}>{t('taskDetailPage.start')}</span>
                        <input
                            key={`start-${startDay}-${datesRevision}`}
                            type="date"
                            className="modal-input"
                            style={{ marginBottom: 0, marginTop: '4px' }}
                            defaultValue={startDay}
                            max={dueTime !== null ? dayKey(new Date(dueTime)) : undefined}
                            onBlur={e => handleStart(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                        />
                    </label>
                    <label>
                        <span style={labelStyle}>{t('taskDetailPage.deadline')}</span>
                        <input
                            key={`due-${dueTime}-${datesRevision}`}
                            type="datetime-local"
                            className="modal-input"
                            style={{ marginBottom: 0, marginTop: '4px' }}
                            defaultValue={dateTimeField(dueTime)}
                            min={startDay !== '' ? `${startDay}T00:00` : undefined}
                            onBlur={e => handleDue(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                        />
                    </label>
                </div>

                {task.periodicity && (task.periodicity.number || task.periodicity.unit) && (
                    <>
                        <span style={labelStyle}>{t('taskDetailPage.periodicity')}</span>
                        <span style={valueStyle}>{t('taskDetailPage.every', { number: task.periodicity.number, unit: t(`taskModal.units.${UNIT_KEYS[task.periodicity.unit] ?? task.periodicity.unit}`) })}</span>
                    </>
                )}

                {task.longDescription && (
                    <>
                        <span style={labelStyle}>{t('taskDetailPage.description')}</span>
                        <p style={{ ...valueStyle, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{task.longDescription}</p>
                    </>
                )}

                <span style={labelStyle}>{t('taskDetailPage.subtasks')}</span>
                {(() => {
                    // The task itself isn't in the list, so its direct children come out at depth 0.
                    const ids = new Set(descendantIds(allTasks, task.id));
                    const subtasks = allTasks.filter(t => ids.has(t.id) && !t.archived);
                    const rows = flattenTree(dragPositions ? withPositions(subtasks, dragPositions) : subtasks, byPosition);
                    if (rows.length === 0) {
                        return <p style={{ ...valueStyle, color: '#999' }}>{t('taskDetailPage.noSubtasks')}</p>;
                    }
                    const lifted = new Set(draggedId != null ? [draggedId, ...descendantIds(allTasks, draggedId)] : []);
                    return (
                        // Positioned, so each row's offsetTop is its place in the list (useSlidingRows).
                        <ul aria-label={t('taskDetailPage.subtasks')} style={{ listStyle: 'none', margin: '4px 0 0', padding: 0, position: 'relative' }}>
                            {rows.map(({ task: sub, depth }) => (
                                <li
                                    key={sub.id}
                                    ref={rowRef(sub.id)}
                                    style={{
                                        paddingLeft: depth * 20, margin: '4px 0', display: 'flex', alignItems: 'center', gap: '4px', position: 'relative',
                                        ...(lifted.has(sub.id) && { zIndex: 1, background: '#f3f7ff', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }),
                                    }}
                                >
                                    <span
                                        onPointerDown={e => startDrag(e, sub, rows)}
                                        title={t('taskList.dragHandle')}
                                        aria-label={t('taskList.dragHandle')}
                                        style={{ display: 'flex', flexShrink: 0, color: '#aaa', cursor: draggedId === sub.id ? 'grabbing' : 'grab', touchAction: 'none' }}
                                    >
                                        <Icon name="grip-vertical" size={16} />
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/task/${sub.id}`)}
                                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', fontSize: '15px', color: '#222', display: 'flex', alignItems: 'center', gap: '6px', textAlign: 'left' }}
                                    >
                                        <span style={{ fontSize: '12px', color: '#888', minWidth: '84px' }}>{statusLabel[sub.status] ?? sub.status}</span>
                                        <TaskTitle title={sub.title} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    );
                })()}
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <input
                        ref={subtaskInputRef}
                        className="modal-input"
                        style={{ marginBottom: 0, flex: 1 }}
                        value={newSubtask}
                        onChange={e => setNewSubtask(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddSubtask(); }}
                        placeholder={t('taskDetailPage.newSubtask')}
                        aria-label={t('taskDetailPage.newSubtask')}
                    />
                    <button
                        type="button"
                        className="modal-close-btn"
                        onClick={handleAddSubtask}
                        disabled={toPlainText(newSubtask).trim() === ''}
                    >
                        {t('taskDetailPage.addSubtask')}
                    </button>
                </div>

                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#999' }}>
                        {t('taskDetailPage.taskId', { id: task.id })}
                    </span>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        style={{
                            cursor: deleting ? 'default' : 'pointer',
                            background: 'none',
                            border: '1px solid #e74c3c',
                            color: '#e74c3c',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            fontSize: '13px',
                            opacity: deleting ? 0.6 : 1,
                        }}
                    >
                        {deleting ? t('taskDetailPage.deleting') : t('taskDetailPage.delete')}
                    </button>
                </div>
            </div>
        </>
    );
};

export default TaskDetailPage;
