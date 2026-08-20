import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QuadratoHeader } from '@sensorario/sg-components';
import { Task } from '../types/commonTypes';
import { getConfigRepository } from '../repositories';
import { navigate } from '../Router';
import FormatDate from '../components/FormatDate';
import { STATUS_ENUM } from '../utils';

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
    const [notFound, setNotFound] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(
        () => Boolean(localStorage.getItem('simonegentili.com-access-token'))
    );

    const matchTask = (t: any) =>
        String(t.id) === String(taskId) || String(t.uuid) === String(taskId);

    useEffect(() => {
        const repo = getConfigRepository();
        repo.onDataLoaded(() => {
            const tasks: Task[] = (repo as any).getTasks ? (repo as any).getTasks() : [];
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

                <h2 style={{ margin: '0 0 8px', fontSize: '22px' }}>{task.title}</h2>

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

                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #eee', fontSize: '12px', color: '#999' }}>
                    {t('taskDetailPage.taskId', { id: task.id })}
                </div>
            </div>
        </>
    );
};

export default TaskDetailPage;
