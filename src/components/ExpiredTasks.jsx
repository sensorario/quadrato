
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@sensorario/sg-components';

const ExpiredTasks = () => {
    const { t } = useTranslation();
    const [expiredTasks, setExpiredTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('simonegentili.com-access-token');

    const handleWorkspaceClick = (workspaceName) => {
        const token = localStorage.getItem('simonegentili.com-access-token');
        if (!token) return;
        fetch('https://api.simonegentili.com/quadrato/workspace/current', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: workspaceName }),
        })
            .then((res) => {
                if (res.status === 401) {
                    localStorage.removeItem('simonegentili.com-access-token');
                }
                window.location.reload();
            });
    };

    if (token && loading) {
        setTimeout(() => {
            fetch('https://api.simonegentili.com/quadrato/workspaces', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })
                .then(res => {
                    if (res.status === 401) {
                        localStorage.removeItem('simonegentili.com-access-token');
                    }
                    return res.json()
                })
                .then(json => {
                    console.log('check expired tasks')
                    console.log({ ArrayIsArray: Array.isArray(json.expired_tasks) })
                    console.log({ json })
                    if (Array.isArray(json.expired_tasks)) {
                        setExpiredTasks(json.expired_tasks);
                    } else {
                        setExpiredTasks([]);
                    }
                    setLoading(false);
                })
                .catch(() => {
                    document.location.reload();
                    setError(t('expiredTasks.fetchError'));
                    setLoading(false);
                });
        }, 1000);
    }

    if (loading) return <div>{t('expiredTasks.loading')}</div>;
    if (error) return <div>{error}</div>;
    if (!expiredTasks || expiredTasks.length === 0) return <><div>{t('expiredTasks.none')}</div><div>&nbsp;</div></>;

    return (
        <div>
            <h3>{t('expiredTasks.title')}</h3>
            <ul>
                {expiredTasks.map((task, idx) => (
                    <li key={task.id || task.uuid || idx}>
                        <span
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleWorkspaceClick(task.workspace)}
                        >
                            {task.workspace}
                        </span>
                        {' / '}
                        {task.description || JSON.stringify(task)}
                        {(task.id || task.uuid) && (
                            <a
                                href={`${window.location.origin}/task/${task.id || task.uuid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={t('expiredTasks.viewDetail')}
                                style={{ marginLeft: '8px', display: 'inline-flex', alignItems: 'center', color: '#888', verticalAlign: 'middle' }}
                            >
                                <Icon name="zoom-in" size={14} />
                            </a>
                        )}
                    </li>
                ))}
            </ul>
            <div>&nbsp;</div>
        </div>
    );
}

export default ExpiredTasks;
