import { useState, useEffect } from 'react';
import './App.css';
import NewTaskModal from './components/NewTaskModal';
import TaskList from './components/TaskList';
import { Header } from './components/Header';
import { STATUS_ENUM, STATUS } from './utils';
import Toggle from './components/Toggle';
import TaskProjectSelector from './components/TaskProjectSelector';
import Footer from './components/Footer';
import ConfirmModal from './components/ConfirmModal';
import HelpModal from './components/HelpModal';

const initialTasks = [
  { id: 1, title: 'Studiare React', longDescription: '', project: '', dateTime: '', status: STATUS_ENUM.TODO },
  { id: 2, title: 'Creare una to-do list', longDescription: '', project: '', dateTime: '', status: STATUS_ENUM.TODO },
  { id: 3, title: 'Testare Vite', longDescription: '', project: '', dateTime: '', status: STATUS_ENUM.DONE },
  { id: 4, title: 'Scrivere documentazione', longDescription: '', project: '', dateTime: '', status: STATUS_ENUM.TODO },
  { id: 5, title: 'Progettare interfaccia', longDescription: '', project: '', dateTime: '', status: STATUS_ENUM.IN_PROGRESS },
];

function App() {
  // Stato per abilitare/disabilitare il campo data-ora nei task
  const [dateTimeEnabled, setDateTimeEnabledState] = useState(() => {
    const saved = localStorage.getItem('simplanner-dateTime-enabled');
    return saved ? JSON.parse(saved) : false;
  });

  const [showExpired, setShowExpired] = useState(() => {
    const saved = localStorage.getItem('simplanner-show-expired');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('simplanner-show-expired', JSON.stringify(showExpired));
  }, [showExpired]);

  const setDateTimeEnabled = (val) => {
    setDateTimeEnabledState(val);
    localStorage.setItem('simplanner-dateTime-enabled', JSON.stringify(val));
  };
  // Stato per filtro progetto
  const [projectFilter, setProjectFilterState] = useState(() => {
    const saved = localStorage.getItem('simplanner-project-filter');
    return saved ? JSON.parse(saved) : null;
  });
  const setProjectFilter = (val) => {
    setProjectFilterState(val);
    localStorage.setItem('simplanner-project-filter', JSON.stringify(val));
  };
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

  // Stato per lo slider dei giorni
  const [daysRange, setDaysRange] = useState(() => {
    const saved = localStorage.getItem('simplanner-days-range');
    return saved ? JSON.parse(saved) : 7;
  });

  useEffect(() => {
    localStorage.setItem('simplanner-days-range', JSON.stringify(daysRange));
  }, [daysRange]);

  // Funzione per aggiornare la descrizione di un task
  const updateTaskTitle = (id, value, longValue, projectValue, dateTimeValue) => {
    setTasks(tasks => {
      const updated = tasks.map(task =>
        task.id === id
          ? {
            ...task,
            title: value,
            longDescription: longValue,
            project: projectValue ?? task.project,
            dateTime: dateTimeValue ?? task.dateTime
          }
          : task
      );
      localStorage.setItem('simplanner-tasks', JSON.stringify(updated));
      return updated;
    });
  };
  const [showPopup, setShowPopup] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskProject, setNewTaskProject] = useState();
  const [showHelp, setShowHelp] = useState(false);
  const [zenMode, setZenMode] = useState(() => {
    const saved = localStorage.getItem('simplanner-zen-mode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('simplanner-project-filter', JSON.stringify(projectFilter));
    setNewTaskProject(projectFilter === 'ALL' ? '' : projectFilter);
  }, [projectFilter]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        setShowPopup(true);
      }
      if (e.ctrlKey && e.key === 'x') {
        e.preventDefault();
        const updatedTasks = archiveCompletedAndSkippedTasks({ tasks });
        setTasks(updatedTasks);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      longDescription: '',
      project: newTaskProject,
      dateTime: '',
      status: 0
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    {/* Todo spostare il salvataggio in un componente a parte in caso di cambio di strategia */ }
    localStorage.setItem('simplanner-tasks', JSON.stringify(updatedTasks));
    setNewTaskTitle('');
    setShowPopup(false);
  };

  const [showCleanConfirm, setShowCleanConfirm] = useState(false);

  const archiveCompletedAndSkippedTasks = ({ tasks }) => {
    return tasks.map(t => {
      if (t.status === STATUS_ENUM.SKIPPED || t.status === STATUS_ENUM.DONE) {
        return { ...t, archived: true };
      }
      return t;
    });
  };

  const handleCleanTasks = () => {
    // const updatedTasks = tasks.filter(t => t.status === STATUS_ENUM.TODO || t.status === STATUS_ENUM.IN_PROGRESS);
    const updatedTasks = archiveCompletedAndSkippedTasks({ tasks });
    setTasks(updatedTasks);
    localStorage.setItem('simplanner-tasks', JSON.stringify(updatedTasks));
    setShowCleanConfirm(false);
  };

  const unarchivedTasks = tasks.filter(t => !t.archived);

  const VisibleTasks =
    <TaskList
      tasks={(() => {
        // Filtra per progetto
        let filtered =
          projectFilter === 'ALL'
            ? unarchivedTasks
            : projectFilter === null
              ? unarchivedTasks.filter(t => !t.project)
              : projectFilter
                ? unarchivedTasks.filter(t => t.project === projectFilter)
                : unarchivedTasks;
        // Filtra per range di giorni
        const now = new Date();
        const end = new Date(now);
        end.setDate(now.getDate() + daysRange);
        return filtered.filter(t => {
          if (!t.dateTime) return true; // task senza scadenza
          const dt = new Date(t.dateTime);
          if (showExpired && dt < now) return true; // mostra scaduti se abilitato
          return dt >= now && dt <= end;
        });
      })()}
      onTaskClick={handleClick}
      updateTaskTitle={updateTaskTitle}
      editable={editable}
      projectEditable={projectEditable}
      dateTimeEnabled={dateTimeEnabled}
    />

  if (zenMode) {
    return <div className="app-container">
      <Toggle
        checked={zenMode}
        onChange={setZenMode}
        label={zenMode ? "normal mode" : "zen mode"}
      />
      {VisibleTasks}
    </div>
  }

  const HeaderView = <Header
    setShowHelp={setShowHelp}
    editable={editable}
    setEditable={setEditable}
    projectEditable={projectEditable}
    setProjectEditable={setProjectEditable}
    dateTimeEnabled={dateTimeEnabled}
    setDateTimeEnabled={setDateTimeEnabled}
    showExpired={showExpired}
    setShowExpired={setShowExpired}
    daysRange={daysRange}
    setDaysRange={setDaysRange}
    zenMode={zenMode}
    setZenMode={setZenMode}
  />;

  const DefinedTaskProject = <TaskProjectSelector
    tasks={tasks}
    projectFilter={projectFilter}
    setProjectFilter={setProjectFilter} />

  const FooterView = <Footer
    setShowPopup={setShowPopup}
    setShowCleanConfirm={setShowCleanConfirm} />;

  const HelpModalView = <HelpModal
    showHelp={showHelp}
    setShowHelp={setShowHelp}
  />;

  const NewTaskModalView = <NewTaskModal
    newTaskTitle={newTaskTitle}
    setNewTaskTitle={setNewTaskTitle}
    newTaskProject={newTaskProject}
    setNewTaskProject={setNewTaskProject}
    handleAddTask={handleAddTask}
    setShowPopup={setShowPopup}
    projectEditable={projectEditable} />

  const ConfirmModalView = <ConfirmModal
    setShowCleanConfirm={setShowCleanConfirm}
    handleCleanTasks={handleCleanTasks} />;

  return (
    <div className="foo">
      <div className="app-container">
        {HeaderView}
        {projectEditable && DefinedTaskProject}
        {VisibleTasks}
        {FooterView}
        {showHelp && HelpModalView}
        {showPopup && NewTaskModalView}
        {showCleanConfirm && ConfirmModalView}
      </div>
    </div >
  );
}

export default App
