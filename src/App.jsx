import { useState, useEffect } from 'react';
import './App.css';
import NewTaskModal from './components/NewTaskModal';
import HelpModal from './components/HelpModal';
import TaskList from './components/TaskList';
import { Header } from './components/Header';
import { STATUS_ENUM, STATUS } from './utils';
import LogoIcon from './components/LogoIcon';

const initialTasks = [
  { id: 1, title: 'Studiare React', longDescription: '', project: '', status: STATUS_ENUM.TODO },
  { id: 2, title: 'Creare una to-do list', longDescription: '', project: '', status: STATUS_ENUM.TODO },
  { id: 3, title: 'Testare Vite', longDescription: '', project: '', status: STATUS_ENUM.DONE },
  { id: 4, title: 'Scrivere documentazione', longDescription: '', project: '', status: STATUS_ENUM.TODO },
  { id: 5, title: 'Progettare interfaccia', longDescription: '', project: '', status: STATUS_ENUM.IN_PROGRESS },
];

function App() {
  // Stato per abilitare/disabilitare la modifica del progetto
  const [projectEditable, setProjectEditableState] = useState(() => {
    const saved = localStorage.getItem('simplanner-project-editable');
    return saved ? JSON.parse(saved) : false;
  });

  const setProjectEditable = (val) => {
    setProjectEditableState(val);
    localStorage.setItem('simplanner-project-editable', JSON.stringify(val));
  };
  // Stato per abilitare/disabilitare la modifica dei task
  const [editable, setEditableState] = useState(() => {
    const saved = localStorage.getItem('simplanner-editable');
    return saved ? JSON.parse(saved) : true;
  });

  // Wrapper per aggiornare stato e localStorage
  const setEditable = (val) => {
    setEditableState(val);
    localStorage.setItem('simplanner-editable', JSON.stringify(val));
  };
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('simplanner-tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  // Funzione per aggiornare la descrizione di un task
  const updateTaskTitle = (id, value, longValue, projectValue) => {
    setTasks(tasks => tasks.map(task =>
      task.id === id ? { ...task, title: value, longDescription: longValue, project: projectValue ?? task.project } : task
    ));
  };
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
      longDescription: '',
      project: '',
      status: 0
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setShowPopup(false);
  };

  const [showCleanConfirm, setShowCleanConfirm] = useState(false);

  const handleCleanTasks = () => {
    setTasks(tasks => tasks.filter(t => t.status === STATUS_ENUM.TODO || t.status === STATUS_ENUM.IN_PROGRESS));
    setShowCleanConfirm(false);
  };

  return (
    <div className="foo">
      <div className="top-bar" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Status icons before logo and title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {STATUS.map((icon, idx) => (
            <span key={idx}>{icon}</span>
          ))}
        </div>
      </div>
      <div className="app-container">
        <Header
          setShowHelp={setShowHelp}
          editable={editable}
          setEditable={setEditable}
          projectEditable={projectEditable}
          setProjectEditable={setProjectEditable}
        />
        <TaskList
          tasks={tasks}
          onTaskClick={handleClick}
          updateTaskTitle={updateTaskTitle}
          editable={editable}
          projectEditable={projectEditable}
        />
        {/* Plus icon in basso al centro dopo tutti i task */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', margin: '24px 0' }}>
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
          <span style={{ cursor: "pointer" }} onClick={() => setShowPopup(true)}>
            aggiungi
          </span>
          <button
            className="clean-icon"
            aria-label="Pulisci task"
            onClick={() => setShowCleanConfirm(true)}
            type="button"
            style={{ border: 'none', background: 'none', padding: 0 }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="15" fill="#f0f0f0" stroke="#888" strokeWidth="2" />
              <line x1="10" y1="10" x2="22" y2="22" stroke="#444" strokeWidth="2" />
              <line x1="22" y1="10" x2="10" y2="22" stroke="#444" strokeWidth="2" />
            </svg>
          </button>
          <span style={{ cursor: "pointer" }} onClick={() => setShowCleanConfirm(true)}>
            pulisci
          </span>
        </div>
        {showHelp && <HelpModal setShowHelp={setShowHelp} />}
        {showPopup && <NewTaskModal
          newTaskTitle={newTaskTitle}
          setNewTaskTitle={setNewTaskTitle}
          handleAddTask={handleAddTask}
          setShowPopup={setShowPopup} />}
        {showCleanConfirm && (
          <div className="modal-overlay" onClick={() => setShowCleanConfirm(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>Conferma pulizia</h2>
              <p>Vuoi davvero eliminare tutti i task completati o skippati?</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                <button className="modal-close-btn" onClick={() => setShowCleanConfirm(false)}>Annulla</button>
                <button className="modal-close-btn" style={{ background: '#666666', color: '#fff' }} onClick={handleCleanTasks}>Conferma</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App
