


import { useState, useEffect } from 'react';
import './App.css';

const STATUS = [
  <svg width="16" height="16" style={{ verticalAlign: 'middle' }} key="square-todo"><rect x="1" y="1" width="14" height="14" fill="white" stroke="black" strokeWidth="2" /></svg>,
  <svg width="16" height="16" style={{ verticalAlign: 'middle' }} key="square-progress">
    <rect x="1" y="1" width="14" height="14" fill="white" stroke="black" strokeWidth="2" />
    <circle cx="8" cy="8" r="3" fill="black" />
  </svg>,
  <svg width="16" height="16" style={{ verticalAlign: 'middle' }} key="square-done">
    <rect x="1" y="1" width="14" height="14" fill="white" stroke="black" strokeWidth="2" />
    <line x1="4" y1="4" x2="12" y2="12" stroke="black" strokeWidth="2" />
    <line x1="12" y1="4" x2="4" y2="12" stroke="black" strokeWidth="2" />
  </svg>,
  <svg width="16" height="16" style={{ verticalAlign: 'middle' }} key="square-skipped"><rect x="1" y="1" width="14" height="14" fill="black" stroke="black" strokeWidth="2" /></svg>
];

const initialTasks = [
  { id: 1, title: 'Studiare React', status: 0 },
  { id: 2, title: 'Creare una to-do list', status: 0 },
  { id: 3, title: 'Testare Vite', status: 2 },
  { id: 4, title: 'Scrivere documentazione', status: 0 },
  { id: 5, title: 'Progettare interfaccia', status: 1 },
];

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('simplanner-tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });
  const [showPopup, setShowPopup] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    localStorage.setItem('simplanner-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        setShowPopup(true);
      }
      if (e.ctrlKey && e.key === 'x') {
        e.preventDefault();
        setTasks(tasks => tasks.filter(t => t.status !== 2 && t.status !== 3));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  const handleClick = (id) => {
    setTasks(tasks => {
      const updated = tasks.map(task =>
        task.id === id
          ? { ...task, status: (task.status + 1) % STATUS.length }
          : task
      );
      // Nessuna cancellazione automatica dei task completati/skippati
      return updated;
    });
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim() === '') return;
    const newTask = {
      id: Date.now(),
      title: newTaskTitle,
      status: 0
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setShowPopup(false);
  };

  return (
    <div className="app-container">
      <h1>Simplanner</h1>
      <h2 className="task-title">Cose da fare</h2>
      <ul className="task-list">
        {[...tasks]
          .map(task => (
            <li
              key={task.id}
              className="task-item"
              onClick={() => handleClick(task.id)}
            >
              <strong>{STATUS[task.status]}</strong> - {task.title}
            </li>
          ))}
      </ul>

      {showPopup && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Nuovo Task</h2>
            <div className="modal-input-wrapper">
              <input
                type="text"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="Titolo del task"
                className="modal-input"
                autoFocus
                onFocus={e => e.currentTarget.classList.add('input-focus')}
                onBlur={e => e.currentTarget.classList.remove('input-focus')}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleAddTask();
                  } else if (e.key === 'Escape') {
                    setShowPopup(false);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App
