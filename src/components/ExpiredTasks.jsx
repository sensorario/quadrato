import React, { useEffect, useState } from 'react';
import { getStatusIcons } from '../utils';



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
            .catch(err => {
                setError('Errore nella fetch /quadrato/workspaces');
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Caricamento task scaduti...</div>;
    if (error) return <div>{error}</div>;
    if (!expiredTasks || expiredTasks.length === 0) return <div>Nessun task scaduto</div>;

    return (
        <div>
            <h3>Task scaduti</h3>
            <ul>
                {expiredTasks.map((task, idx) => (
                    <li key={task.id || task.uuid || idx}>
                        <span
                            style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                            onClick={() => {
                                window.location.href = `https://quadrato.simonegentili.com/${encodeURIComponent(task.workspace)}`;
                            }}
                        >
                            {task.workspace}
                        </span>
                        {' / '}
                        {task.description || JSON.stringify(task)}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ExpiredTasks;
