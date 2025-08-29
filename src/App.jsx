import { useState, useEffect } from 'react';
import './App.css';
import NewTaskModal from './components/NewTaskModal';
import HelpModal from './components/HelpModal';
import TaskList from './components/TaskList';
import { Header } from './components/Header';
import { STATUS_ENUM, STATUS } from './utils';

const initialTasks = [
  { id: 1, title: 'Studiare React', status: STATUS_ENUM.TODO },
  { id: 2, title: 'Creare una to-do list', status: STATUS_ENUM.TODO },
  { id: 3, title: 'Testare Vite', status: STATUS_ENUM.DONE },
  { id: 4, title: 'Scrivere documentazione', status: STATUS_ENUM.TODO },
  { id: 5, title: 'Progettare interfaccia', status: STATUS_ENUM.IN_PROGRESS },
];

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('simplanner-tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });
  const [showPopup, setShowPopup] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showHelp, setShowHelp] = useState(false);

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
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        setShowHelp(true);
      }
      if (e.key === 'Escape') {
        if (showHelp) {
          setShowHelp(false);
        } else if (showPopup) {
          setShowPopup(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHelp, showPopup]);


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
      <Header setShowHelp={setShowHelp} />
      <TaskList tasks={tasks} onTaskClick={handleClick} />
      {/* Plus icon in basso al centro dopo tutti i task */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '1.5rem', margin: '24px 0' }}>
        <button
          className="plus-icon"
          aria-label="Aggiungi nuovo task"
          onClick={() => setShowPopup(true)}
          type="button"
          style={{ border: 'none', background: 'none', padding: 0 }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15" fill="#f0f0f0" stroke="#888" strokeWidth="2" />
            <line x1="16" y1="10" x2="16" y2="22" stroke="#444" strokeWidth="2" />
            <line x1="10" y1="16" x2="22" y2="16" stroke="#444" strokeWidth="2" />
          </svg>
        </button>
        <button
          className="clean-icon"
          aria-label="Pulisci task"
          onClick={() => setTasks(tasks => tasks.filter(t => t.status === STATUS_ENUM.TODO || t.status === STATUS_ENUM.IN_PROGRESS))}
          type="button"
          style={{ border: 'none', background: 'none', padding: 0 }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15" fill="#f0f0f0" stroke="#888" strokeWidth="2" />
            <line x1="10" y1="10" x2="22" y2="22" stroke="#444" strokeWidth="2" />
            <line x1="22" y1="10" x2="10" y2="22" stroke="#444" strokeWidth="2" />
          </svg>
        </button>
      </div>
      {showHelp && <HelpModal setShowHelp={setShowHelp} />}
      {showPopup && <NewTaskModal
        newTaskTitle={newTaskTitle}
        setNewTaskTitle={setNewTaskTitle}
        handleAddTask={handleAddTask}
        setShowPopup={setShowPopup} />}
    </div>
  );
}

export default App
