import React, { useState } from 'react';
import { getStatusIcons } from '../utils';

type DemoTask = {
    id: number;
    title: string;
    status: number;
};

const INITIAL_TASKS: DemoTask[] = [
    { id: 1, title: 'Rispondere alle email', status: 0 },
    { id: 2, title: 'Scrivere la presentazione', status: 1 },
    { id: 3, title: 'Fare la spesa', status: 2 },
    { id: 4, title: 'Chiamare il dentista', status: 3 },
];

// Demo puramente locale: nessun dato viene salvato o inviato al server.
const DemoTaskList = () => {
    const [tasks, setTasks] = useState(INITIAL_TASKS);
    const STATUS = getStatusIcons('panda');

    const cycleStatus = (id: number) => {
        setTasks((prev) => prev.map((task) => (
            task.id === id ? { ...task, status: (task.status + 1) % 4 } : task
        )));
    };

    return (
        <div style={{ maxWidth: '340px', width: '90%', textAlign: 'left' }}>
            <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', margin: '0 0 8px' }}>
                Prova subito, senza registrarti: clicca un&apos;icona per cambiare stato.
                Niente viene salvato.
            </p>
            <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                border: '1px solid #eee',
                borderRadius: '8px',
                overflow: 'hidden'
            }}>
                {tasks.map((task, index) => (
                    <li
                        key={task.id}
                        onClick={() => cycleStatus(task.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            borderBottom: index === tasks.length - 1 ? 'none' : '1px solid #eee',
                            cursor: 'pointer'
                        }}
                    >
                        {STATUS[task.status]}
                        <span>{task.title}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DemoTaskList;
