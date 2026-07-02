import React, { useEffect, useState } from 'react';
import { Task } from '../types/commonTypes';
import { getConfigRepository } from '../repositories';
import { navigate } from '../Router';
import FormatDate from '../components/FormatDate';
import { STATUS_ENUM } from '../utils';

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
                <button style={crumbStyle} onClick={() => navigate('/')}>Home</button>
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

const statusLabel: Record<number, string> = {
    [STATUS_ENUM.TODO]: 'Da fare',
    [STATUS_ENUM.IN_PROGRESS]: 'In corso',
    [STATUS_ENUM.DONE]: 'Completato',
    [STATUS_ENUM.SKIPPED]: 'Saltato',
};

type TaskDetailPageProps = {
    taskId: string;
};

export const TaskDetailPage = ({ taskId }: TaskDetailPageProps) => {
    const [task, setTask] = useState<Task | null>(null);
    const [notFound, setNotFound] = useState(false);

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

    if (notFound && !task) {
        return (
            <div style={containerStyle}>
                <button
                    onClick={() => navigate('/')}
                    style={{ marginBottom: '20px', cursor: 'pointer', background: 'none', border: 'none', color: '#007bff', fontSize: '14px' }}
                >
                    ← Torna indietro
                </button>
                <p>Task non trovato.</p>
            </div>
        );
    }

    if (!task) {
        return (
            <div style={containerStyle}>
                <p>Caricamento...</p>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <Breadcrumb task={task} />

            <h2 style={{ margin: '0 0 8px', fontSize: '22px' }}>{task.title}</h2>

            <span style={labelStyle}>Stato</span>
            <span style={valueStyle}>{statusLabel[task.status] ?? task.status}</span>

            {task.project && (
                <>
                    <span style={labelStyle}>Progetto</span>
                    <span style={valueStyle}>{task.project}</span>
                </>
            )}

            {task.timestamp && (
                <>
                    <span style={labelStyle}>Scadenza</span>
                    <span style={valueStyle}>
                        <FormatDate date={typeof task.timestamp === 'number' ? task.timestamp : task.timestamp} />
                    </span>
                </>
            )}

            {task.periodicity && (task.periodicity.number || task.periodicity.unit) && (
                <>
                    <span style={labelStyle}>Periodicità</span>
                    <span style={valueStyle}>Ogni {task.periodicity.number} {task.periodicity.unit}</span>
                </>
            )}

            {task.longDescription && (
                <>
                    <span style={labelStyle}>Descrizione</span>
                    <p style={{ ...valueStyle, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{task.longDescription}</p>
                </>
            )}

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #eee', fontSize: '12px', color: '#999' }}>
                ID task: {task.id}
            </div>
        </div>
    );
};

export default TaskDetailPage;
