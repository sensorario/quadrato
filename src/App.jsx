import { useState, useEffect } from 'react';
import './App.css';
import NewTaskModal from './components/NewTaskModal';
import HelpModal from './components/HelpModal';
import { Header } from './components/Header';


const STATUS_ENUM = {
  TODO: 0,
  IN_PROGRESS: 1,
  DONE: 2,
  SKIPPED: 3
};

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
      if (e.key === 'Escape') {
        if (showHelp) {
          setShowHelp(false);
        } else if (showPopup) {
          setShowPopup(false);
        }
      }
      // Apri help con Shift + /
      if ((e.key === '?' || (e.key === '/' && e.shiftKey))) {
        setShowHelp(true);
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

  const TaskList = ({ tasks, onTaskClick }) => (
    <ul className="task-list">
      {tasks.map(task => (
        <li
          key={task.id}
          className="task-item"
          onClick={() => onTaskClick(task.id)}
        >
          <strong>{STATUS[task.status]}</strong> - {task.title}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="app-container">

      <Header />
      <TaskList tasks={tasks} onTaskClick={handleClick} />

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
