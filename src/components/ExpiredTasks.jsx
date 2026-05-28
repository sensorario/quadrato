
import React, { useEffect, useState } from 'react';

const ExpiredTasks = () => {
    const [expiredTasks, setExpiredTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('https://api.simonegentili.com/quadrato/workspaces', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(res => res.json())
            .then(json => {
                if (Array.isArray(json.expired_tasks)) {
                    setExpiredTasks(json.expired_tasks);
                } else {
                    setExpiredTasks([]);
                }
                setLoading(false);
            })
            .catch(() => {
                setError('Errore nella fetch /quadrato/workspaces');
                setLoading(false);
            });
    }, []);

    const handleWorkspaceClick = (workspaceName) => {
        const token = localStorage.getItem('simonegentili.com-access-token');
        if (!token) return;
        fetch('https://api.simonegentili.com/quadrato/workspace/current', {
            method: 'POST',
            headers: {
                authorization: token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: workspaceName }),
        })
            .then(() => {
                window.location.reload();
            });
    };

    if (loading) return <div>Caricamento task scaduti...</div>;
    if (error) return <div>{error}</div>;
    if (!expiredTasks || expiredTasks.length === 0) return <><div>Nessun task scaduto</div><div>&nbsp;</div></>;

    return (
        <div>
            <h3>Task scaduti</h3>
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
                    </li>
                ))}
            </ul>
            <div>&nbsp;</div>
        </div>
    );
}

export default ExpiredTasks;
