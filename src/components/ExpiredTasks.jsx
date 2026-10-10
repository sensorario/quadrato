
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@sensorario/sg-components';

// The overdue tasks of the other workspaces (the API's expired_tasks): a click on the
// workspace name switches to it.
const ExpiredTasks = ({ tasks }) => {
    const { t } = useTranslation();

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

    if (tasks.length === 0) return null;

    return (
        <div className="expired-elsewhere">
            <h3>{t('expiredTasks.elsewhere')}</h3>
            <ul>
                {tasks.map((task, idx) => (
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
        </div>
    );
}

export default ExpiredTasks;
