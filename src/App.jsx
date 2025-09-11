import { useState, useEffect } from 'react';
import './App.css';
import TaskList from './components/TaskList';
import { Header } from './components/Header';
import { STATUS_ENUM } from './utils';
import Toggle from './components/Toggle';
import TaskProjectSelector from './components/TaskProjectSelector';
import Footer from './components/Footer';
import ConfirmModal from './components/ConfirmModal';
import HelpModal from './components/HelpModal';

const initialTasks = [
  { id: 1, title: 'Questo è un task da fare', longDescription: '', project: 'Quadrato', dateTime: '', status: STATUS_ENUM.TODO },
  { id: 2, title: 'Questo è un altro task da completare', longDescription: '', project: 'Quadrato', dateTime: '', status: STATUS_ENUM.TODO },
  { id: 3, title: 'Task semplice da svolgere', longDescription: '', project: 'Quadrato', dateTime: '', status: STATUS_ENUM.TODO },
  { id: 4, title: 'Task in corso di lavorazione', longDescription: '', project: 'Quadrato', dateTime: '', status: STATUS_ENUM.IN_PROGRESS },
  { id: 5, title: 'Altro task in progresso', longDescription: '', project: 'Quadrato', dateTime: '', status: STATUS_ENUM.IN_PROGRESS },
  { id: 6, title: 'Task completato con successo', longDescription: '', project: 'Quadrato', dateTime: '', status: STATUS_ENUM.DONE },
  { id: 7, title: 'Questo task è stato finito', longDescription: '', project: 'Quadrato', dateTime: '', status: STATUS_ENUM.DONE },
  { id: 8, title: 'Task portato a termine', longDescription: '', project: 'Quadrato', dateTime: '', status: STATUS_ENUM.DONE },
  { id: 9, title: 'Task skippato per il momento', longDescription: '', project: 'Quadrato', dateTime: '', status: STATUS_ENUM.SKIPPED },
  { id: 10, title: 'Questo task è stato saltato', longDescription: '', project: 'Quadrato', dateTime: '', status: STATUS_ENUM.SKIPPED },
];

function App() {
  // Stato per il tema delle icone
  const [iconTheme, setIconTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('simplanner-icon-theme');
      return saved ? saved : 'default';
    } catch (e) {
      return 'default';
    }
  });

  // Funzione per aggiornare il tema e sincronizzare con localStorage
  const handleThemeChange = (theme) => {
    setIconTheme(theme);
    localStorage.setItem('simplanner-icon-theme', theme);
  };

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

  const [showPopup, setShowPopup] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskProject, setNewTaskProject] = useState();
  const [newTaskDateTime, setNewTaskDateTime] = useState('');
  const [newTaskLongDescription, setNewTaskLongDescription] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [zenMode, setZenMode] = useState(() => {
    const saved = localStorage.getItem('simplanner-zen-mode');
    return saved ? JSON.parse(saved) : false;
  });

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

  useEffect(() => {
    localStorage.setItem('simplanner-project-filter', JSON.stringify(projectFilter));
    setNewTaskProject(projectFilter === 'ALL' ? '' : projectFilter);
  }, [projectFilter]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      console.log(e.key, e.ctrlKey, e.shiftKey, e.altKey);
      if (e.ctrlKey && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        setShowPopup(true);
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'X') {
        e.preventDefault();
        const updatedTasks = archiveCompletedAndSkippedTasks({ tasks });
        setTasks(updatedTasks);
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'H') {
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
          ? { ...task, status: (task.status + 1) % 4 }
          : task
      );
      localStorage.setItem('simplanner-tasks', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim() === '') return;
    const newTask = {
      id: Date.now(),
      title: newTaskTitle,
      longDescription: newTaskLongDescription,
      project: newTaskProject,
      dateTime: newTaskDateTime,
      status: 0,
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
    const updatedTasks = tasks.map(t => {
      if (t.status === STATUS_ENUM.SKIPPED || t.status === STATUS_ENUM.DONE) {
        return { ...t, archived: true };
      }
      return t;
    });
    localStorage.setItem('simplanner-tasks', JSON.stringify(updatedTasks));
    return updatedTasks;
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

  const NewTaskModalView = <div className="modal-overlay" onClick={() => setShowPopup(false)}>
    <div className="modal" onClick={e => e.stopPropagation()}>
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
      <div className="modal-long-description">
        <textarea
          value={newTaskLongDescription}
          onChange={e => setNewTaskLongDescription(e.target.value)}
          placeholder="Descrizione del task"
          className="modal-input"
        />
      </div>
      {projectEditable && <div className="modal-input-wrapper">
        <input
          type="text"
          value={newTaskProject}
          onChange={e => setNewTaskProject(e.target.value)}
          placeholder="Progetto (opzionale)"
          className="modal-input"
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleAddTask();
            }
          }}
        />
      </div>}
      {dateTimeEnabled && <div className="modal-input-wrapper">
        <input
          type="datetime-local"
          value={newTaskDateTime}
          onChange={e => setNewTaskDateTime(e.target.value)}
          className="modal-input"
        />
      </div>}
      <button onClick={handleAddTask} className='modal-close-btn'>salva</button>
    </div>
  </div>

  if (zenMode) {
    return <div className="app-container">
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Toggle
          checked={zenMode}
          onChange={setZenMode}
          label={zenMode ? "normal mode" : "zen mode"}
        />
      </div>
      {VisibleTasks}
      {showPopup && NewTaskModalView}
    </div>
  }

  const HeaderView = <Header
    tasks={tasks}
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
    iconTheme={iconTheme}
    handleThemeChange={handleThemeChange}
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

  const ConfirmModalView = <ConfirmModal
    setShowCleanConfirm={setShowCleanConfirm}
    handleCleanTasks={handleCleanTasks} />;

  const visibleTasks = (() => {
    let filtered =
      projectFilter === 'ALL'
        ? unarchivedTasks
        : projectFilter === null
          ? unarchivedTasks.filter(t => !t.project)
          : projectFilter
            ? unarchivedTasks.filter(t => t.project === projectFilter)
            : unarchivedTasks;
    const now = new Date();
    const end = new Date(now);
    end.setDate(now.getDate() + daysRange);
    return filtered.filter(t => {
      if (!t.dateTime) return true;
      const dt = new Date(t.dateTime);
      if (showExpired && dt < now) return true;
      return dt >= now && dt <= end;
    });
  })();

  return (
    <div className="foo">
      <div className="app-container">
        {HeaderView}
        {projectEditable && DefinedTaskProject}
        <TaskList
          tasks={visibleTasks}
          onTaskClick={handleClick}
          updateTaskTitle={updateTaskTitle}
          editable={editable}
          projectEditable={projectEditable}
          dateTimeEnabled={dateTimeEnabled}
          iconTheme={iconTheme}
        />
        {FooterView}
        {showHelp && HelpModalView}
        {showPopup && NewTaskModalView}
        {showCleanConfirm && ConfirmModalView}
      </div>
    </div>
  );
}

export default App
