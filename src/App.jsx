


import { useState, useEffect } from 'react';

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
    <div style={{ width: '300px', margin: '0 auto' }}>
      <h1>Simplanner</h1>
      <h2 style={{ marginTop: '2rem' }}>Cose da fare</h2>
      <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
        {[...tasks]
          .map(task => (
            <li
              key={task.id}
              style={{
                cursor: 'pointer',
                transition: 'opacity 2.5s',
              }}
              onClick={() => handleClick(task.id)}
            >
              <strong>{STATUS[task.status]}</strong> - {task.title}
            </li>
          ))}
      </ul>

      {showPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            width: '350px',
          }}>
            <h2>Nuovo Task</h2>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <input
                type="text"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="Titolo del task"
                style={{
                  width: '90%',
                  marginBottom: '1rem',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d1d1',
                  borderRadius: '24px',
                  fontSize: '1rem',
                  outline: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'border 0.2s',
                }}
                autoFocus
                onFocus={e => e.currentTarget.style.border = '1.5px solid #0a66c2'}
                onBlur={e => e.currentTarget.style.border = '1px solid #d1d1d1'}
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
