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
