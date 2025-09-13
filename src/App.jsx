import React, { useState, useEffect } from 'react';
import './App.css';
import TaskList from './components/TaskList';
// import { Header } from './components/Header';
import { STATUS_ENUM } from './utils';
import Toggle from './components/Toggle';
import TaskProjectSelector from './components/TaskProjectSelector';
import Footer from './components/Footer';
import ConfirmModal from './components/ConfirmModal';
import HelpModal from './components/HelpModal';
import GearIcon from "./components/GearIcon";
import HelpIcon from "./components/HelpIcon";
import { Modal } from './components/Modal';

const initialTasks = [
  { id: 1, title: 'Questo è un task da fare', longDescription: '', project: 'quadrato', dateTime: '', status: STATUS_ENUM.TODO },
  { id: 2, title: 'Questo è un altro task da completare', longDescription: '', project: 'quadrato', dateTime: '', status: STATUS_ENUM.TODO },
  { id: 3, title: 'Task semplice da svolgere', longDescription: '', project: 'quadrato', dateTime: '', status: STATUS_ENUM.TODO },
  { id: 4, title: 'Task in corso di lavorazione', longDescription: '', project: 'quadrato', dateTime: '', status: STATUS_ENUM.IN_PROGRESS },
  { id: 5, title: 'Altro task in progresso', longDescription: '', project: 'quadrato', dateTime: '', status: STATUS_ENUM.IN_PROGRESS },
  { id: 6, title: 'Task completato con successo', longDescription: '', project: 'quadrato', dateTime: '', status: STATUS_ENUM.DONE },
  { id: 7, title: 'Questo task è stato finito', longDescription: '', project: 'quadrato', dateTime: '', status: STATUS_ENUM.DONE },
  { id: 8, title: 'Task portato a termine', longDescription: '', project: 'quadrato', dateTime: '', status: STATUS_ENUM.DONE },
  { id: 9, title: 'Task skippato per il momento', longDescription: '', project: 'quadrato', dateTime: '', status: STATUS_ENUM.SKIPPED },
  { id: 10, title: 'Questo task è stato saltato', longDescription: '', project: 'quadrato', dateTime: '', status: STATUS_ENUM.SKIPPED },
];

function App() {
  // Stato per il tema delle icone
  const [iconTheme, setIconTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('simplanner-icon-theme');
      return saved ? saved : 'default';
    } catch (e) {
      console.log({ e })
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

  const [showConfig, setShowConfig] = useState(false);

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

  const NewTaskModalView = <Modal title="Nuovo Task" onclick={() => setShowPopup(false)}>
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
  </Modal>;

  if (zenMode) {
    return <div className="app-container">
      <div style={{ display: "flex", justifyContent: "flex-end", height: "35px", gap: "12px" }}>
        <Toggle
          checked={zenMode}
          onChange={setZenMode}
        />
        <span onClick={() => setZenMode(!zenMode)} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>zen mode</span>
      </div>
      {VisibleTasks}
      {showPopup && NewTaskModalView}
    </div>
  }


  const Header = ({
    tasks,
    setShowHelp,
    editable,
    setEditable,
    projectEditable,
    setProjectEditable,
    dateTimeEnabled,
    setDateTimeEnabled,
    showExpired,
    setShowExpired,
    daysRange,
    zenMode,
    setZenMode,
    handleThemeChange,
    iconTheme,
    showConfig,
    setShowConfig,
  }) => {
    // Usa i task passati come prop

    // Gestione colori progetti
    const [projectColors, setProjectColors] = useState(() => {
      try {
        const saved = localStorage.getItem('simplanner-project-colors');
        return saved ? JSON.parse(saved) : {};
      } catch (e) {
        return { e };
      }
    });

    const handleColorChange = (project, color) => {
      const newColors = { ...projectColors, [project]: color };
      setProjectColors(newColors);
      localStorage.setItem('simplanner-project-colors', JSON.stringify(newColors));
    };

    const TogglePanel = ({ daysRange, onDaysRangeChange }) => {
      return (
        <div className="tab">
          <Toggle
            checked={editable}
            onChange={setEditable}
            label={"Modifica"}
          />
          <Toggle
            checked={projectEditable}
            onChange={setProjectEditable}
            label={"Raggruppa"}
          />
          <Toggle
            checked={dateTimeEnabled}
            onChange={setDateTimeEnabled}
            label={"Con scadenza"}
          />
          <Toggle
            checked={showExpired}
            onChange={setShowExpired}
            label={"Mostra scaduti"}
          />
          <div style={{ margin: '16px 0', width: '100%', display: 'flex', alignItems: 'center' }}>
            <div className="label" style={{ flex: '1' }}>
              Giorni da mostrare:
            </div>
            <input type="number" name="daysRange" id="daysRange" min={0} max={365} value={daysRange}
              onChange={e => onDaysRangeChange(Number(e.target.value))} style={{
                marginLeft: '12px',
                verticalAlign: 'middle',
                width: '50px',
                minWidth: '60px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px',
                boxSizing: 'border-box',
              }} />
          </div>
        </div>
      );
    };

    const ProjectPanel = () => {
      return tasks && tasks.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <strong>Progetti:</strong>
          <ul style={{ margin: '8px 0 0 0', padding: 0, listStyle: 'none' }}>
            {Array.from(new Set(tasks
              .map(t => t.project)
              .filter(p => typeof p === 'string' && p.trim() !== '')))
              .map((project, idx) => (
                <li key={idx} style={{ padding: '2px 0', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '8px', flex: '1' }}>{String(project)}</span>
                  <input
                    type="color"
                    style={{ width: 24, height: 24, border: 'none', background: 'none', cursor: 'pointer' }}
                    value={projectColors[String(project)] || '#000000'}
                    onChange={e => handleColorChange(String(project), e.target.value)}
                  />
                </li>
              ))}
          </ul>
        </div>
      )
    };

    const ThemePanel = () => {
      return (
        <div>
          <strong>Tema icone:</strong>
          <div style={{ marginTop: '16px' }}>
            <Toggle
              checked={iconTheme === 'default'}
              onChange={() => handleThemeChange('default')}
              label={"Tema di default"}
            />
            <Toggle
              checked={iconTheme === 'checked'}
              onChange={() => handleThemeChange('checked')}
              label={"Stile con spunta"}
            />
          </div>
        </div>
      );
    }

    const TabbedContent = ({ panels }) => {
      const [activeTab, setActiveTab] = useState(() => {
        const saved = localStorage.getItem('simplanner-config-tab');
        return saved ? Number(saved) : 0;
      });

      const handleTabChange = (index) => {
        setActiveTab(index);
        localStorage.setItem('simplanner-config-tab', String(index));
      };

      return <div className="tabbed-content">
        <div className="tabs">
          {panels.map((panel, index) => (
            <div className={`tab ${activeTab === index ? 'active' : ''}`} onClick={() => handleTabChange(index)} key={index}>
              <span>{panel.title}</span>
            </div>
          ))}
        </div>
        <div className="content">
          {panels.map((panel, index) => (
            <div
              key={index}
              className={`tab-content${activeTab === index ? ' active' : ''}`}
            >
              {panel.content}
            </div>
          ))}
        </div>
      </div>
    };

    return (
      <>
        <div className="header-bar" style={{ height: "35px" }}>
          <div className="header-icons">
            <span onClick={() => setShowHelp(true)}>
              <HelpIcon />
            </span>
            <span onClick={() => setShowHelp(true)} style={{ cursor: "pointer" }}>
              help
            </span>
            <span onClick={() => setShowConfig(true)} style={{ cursor: "pointer" }}>
              <GearIcon />
            </span>
            <span onClick={() => setShowConfig(true)} style={{ cursor: "pointer" }}>
              config
            </span>
            <Toggle
              checked={zenMode}
              onChange={setZenMode}
              label={""}
            />
            <span onClick={() => setZenMode(!zenMode)} style={{ cursor: "pointer" }}>zen mode</span>
          </div>
        </div>
        {/** estrarre un componente modal da questo */}
        {showConfig && (
          <Modal onclick={() => setShowConfig(false)} title="Configurazioni" icon={<GearIcon />}  >
            <TabbedContent panels={[
              { content: <TogglePanel daysRange={daysRange} onDaysRangeChange={handleDaysRangeChange} />, title: "Generale" },
              { content: <ProjectPanel />, title: "Progetti" },
              { content: <ThemePanel />, title: "Tema" }
            ]} />
          </Modal>
        )}
      </>
    );
  };

  // Gestione del range dei giorni a livello di App
  const handleDaysRangeChange = (val) => {
    setDaysRange(val);
    localStorage.setItem('simplanner-days-range', JSON.stringify(val));
  };

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
    onDaysRangeChange={handleDaysRangeChange}
    zenMode={zenMode}
    setZenMode={setZenMode}
    iconTheme={iconTheme}
    handleThemeChange={handleThemeChange}
    showConfig={showConfig}
    setShowConfig={setShowConfig}
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
