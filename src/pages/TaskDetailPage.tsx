import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QuadratoHeader } from '@sensorario/sg-components';
import { Task } from '../types/commonTypes';
import { getConfigRepository } from '../repositories';
import { navigate } from '../Router';
import FormatDate from '../components/FormatDate';
import TaskTitle from '../components/TaskTitle';
import { STATUS_ENUM } from '../utils';
import { descendantIds, flattenTree, reconcileAncestors } from '../utils/taskTree';
import { toPlainText } from '../utils/toPlainText';

const UNIT_KEYS: Record<string, string> = { minuti: 'minutes', giorni: 'days', settimane: 'weeks', mesi: 'months', anni: 'years' };

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
        </div>
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

                <h2 style={{ margin: '0 0 8px', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '8px' }}><TaskTitle title={task.title} iconSize={36} /></h2>

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
                <span style={valueStyle}>{statusLabel[task.status] ?? task.status}</span>

                {task.project && (
                    <>
                        <span style={labelStyle}>{t('taskDetailPage.project')}</span>
                        <span style={valueStyle}>{task.project}</span>
                    </>
                )}

                {task.timestamp && (
                    <>
                        <span style={labelStyle}>{t('taskDetailPage.deadline')}</span>
                        <span style={valueStyle}>
                            <FormatDate date={typeof task.timestamp === 'number' ? task.timestamp : task.timestamp} />
                        </span>
                    </>
                )}

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
                    const rows = flattenTree(allTasks.filter(t => ids.has(t.id) && !t.archived));
                    if (rows.length === 0) {
                        return <p style={{ ...valueStyle, color: '#999' }}>{t('taskDetailPage.noSubtasks')}</p>;
                    }
                    return (
                        <ul aria-label={t('taskDetailPage.subtasks')} style={{ listStyle: 'none', margin: '4px 0 0', padding: 0 }}>
                            {rows.map(({ task: sub, depth }) => (
                                <li key={sub.id} style={{ paddingLeft: depth * 20, margin: '4px 0' }}>
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
