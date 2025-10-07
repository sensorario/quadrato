import React, { useState, useEffect } from 'react';
import './App.css';
import TaskList from './components/TaskList';
// import { Header } from './components/Header';
import { STATUS_ENUM, getStatusIcons } from './utils';
import Toggle from './components/Toggle';
import TaskProjectSelector from './components/TaskProjectSelector';
import Footer from './components/Footer';
import ConfirmModal from './components/ConfirmModal';
import HelpModal from './components/HelpModal';
import GearIcon from "./components/GearIcon";
import HelpIcon from "./components/HelpIcon";
import { Modal } from './components/Modal';
import { Palette24 } from './types/Palette24';
import TabbedContent from './components/TabbedContent';
import InfoPanel from './components/InfoPanel';
import { handleAddAnotherModal } from './utils/handleAddAnotherModal';
import { archiveCompletedAndSkippedTasks } from './functions/archiveCompletedAndSkippedTasks';
import { getConfigRepository } from './repositories';

const initialTasks = [
    { id: 1, title: 'Questo è un task da fare', longDescription: '', project: 'quadrato', timestamp: '', status: STATUS_ENUM.TODO },
    { id: 2, title: 'Questo è un altro task da completare', longDescription: '', project: 'quadrato', timestamp: '', status: STATUS_ENUM.TODO },
    { id: 3, title: 'Task semplice da svolgere', longDescription: '', project: 'quadrato', timestamp: '', status: STATUS_ENUM.TODO },
    { id: 4, title: 'Task in corso di lavorazione', longDescription: '', project: 'quadrato', timestamp: '', status: STATUS_ENUM.IN_PROGRESS },
    { id: 5, title: 'Altro task in progresso', longDescription: '', project: 'quadrato', timestamp: '', status: STATUS_ENUM.IN_PROGRESS },
    { id: 6, title: 'Task completato con successo', longDescription: '', project: 'quadrato', timestamp: '', status: STATUS_ENUM.DONE },
    { id: 7, title: 'Questo task è stato finito', longDescription: '', project: 'quadrato', timestamp: '', status: STATUS_ENUM.DONE },
    { id: 8, title: 'Task portato a termine', longDescription: '', project: 'quadrato', timestamp: '', status: STATUS_ENUM.DONE },
    { id: 9, title: 'Task skippato per il momento', longDescription: '', project: 'quadrato', timestamp: '', status: STATUS_ENUM.SKIPPED },
    { id: 10, title: 'Questo task è stato saltato', longDescription: '', project: 'quadrato', timestamp: '', status: STATUS_ENUM.SKIPPED },
];



function App() {
    // Mostro nascondo testo accanto alle icone
    const [showText, setShowText] = useState(getConfigRepository().getShowText());

    const handleShowTextToggle = () => {
        setShowText((prev) => !prev);
        getConfigRepository().setShowText(!showText);
    };

    // Stato per il tema delle icone
    const [iconTheme, setIconTheme] = useState(getConfigRepository().getIconTheme());

    // Funzione per aggiornare il tema
    const handleThemeChange = (theme) => {
        setIconTheme(theme);
        getConfigRepository().setIconTheme(theme);
    };

    // Stato per abilitare/disabilitare il campo data-ora nei task
    const [dateTimeEnabled, setDateTimeEnabledState] = useState(() => {
        getConfigRepository().getDateTimeEnabled();
    });

    const [showExpired, setShowExpiredFeature] = useState(getConfigRepository().getShowExpired());

    const [showConfig, setShowConfig] = useState(false);

    useEffect(() => {
        getConfigRepository().setShowExpired(showExpired);
    }, [showExpired]);

    const setDateTimeEnabled = (val) => {
        setDateTimeEnabledState(val);
        getConfigRepository().setDateTimeEnabled(val);
    };

    // Stato per filtro progetto
    const [projectFilter, setProjectFilterState] = useState(() => {
        return getConfigRepository().getProjectFilter();
    });
    const setProjectFilter = (val) => {
        setProjectFilterState(val);
        getConfigRepository().setProjectFilter(val);
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

    const [showPopup, setShowPopup] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskProject, setNewTaskProject] = useState();
    const [newTaskDateTime, setNewTaskDateTime] = useState('');
    const [newTaskLongDescription, setNewTaskLongDescription] = useState('');
    const [showHelp, setShowHelp] = useState(false);
    const [zenMode, setZenMode] = useState(() => {
        return getConfigRepository().getZenMode();
    });

    // Funzione per aggiornare la descrizione di un task
    const updateTaskTitle = (id, value, longValue, projectValue, timestampValue, periodicityValue) => {
        setTasks(tasks => {
            const updated = tasks.map(task => {
                let newTimestamp = timestampValue ?? task.timestamp;
                if (typeof newTimestamp === 'string' && newTimestamp.length > 0) {
                    newTimestamp = new Date(newTimestamp).getTime();
                }
                return task.id === id
                    ? {
                        ...task,
                        title: value,
                        longDescription: longValue,
                        project: projectValue ?? task.project,
                        timestamp: newTimestamp,
                        periodicity: periodicityValue ?? task.periodicity
                    }
                    : task;
            });
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
        let timestamp = '';
        if (typeof newTaskDateTime === 'string' && newTaskDateTime.length > 0) {
            timestamp = new Date(newTaskDateTime).getTime();
        }
        const newTask = {
            id: Date.now(),
            title: newTaskTitle,
            longDescription: newTaskLongDescription,
            project: newTaskProject,
            timestamp,
            status: 0,
        };
        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);

        localStorage.setItem('simplanner-tasks', JSON.stringify(updatedTasks));
        handleAddAnotherModal({ addAnother, setShowPopup, setAddAnother, setNewTaskTitle });
    };

    const [showCleanConfirm, setShowCleanConfirm] = useState(false);

    const handleCleanTasks = () => {
        // const updatedTasks = tasks.filter(t => t.status === STATUS_ENUM.TODO || t.status === STATUS_ENUM.IN_PROGRESS);
        const updatedTasks = archiveCompletedAndSkippedTasks({ tasks });
        setTasks(updatedTasks);
        localStorage.setItem('simplanner-tasks', JSON.stringify(updatedTasks));
        setShowCleanConfirm(false);
    };

    const unarchivedTasks = tasks;

    const visible = (() => {
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
        return filtered.filter(t => {
            if (!t.timestamp) return true; // task senza scadenza
            const dt = new Date(t.timestamp);
            if (showExpired && dt < now) return true; // mostra scaduti se abilitato
            return dt >= now && dt <= end;
        });
    })()

    const [addAnother, setAddAnother] = useState(false);

    const VisibleTasks =
        <TaskList
            tasks={visible}
            onTaskClick={handleClick}
            updateTaskTitle={updateTaskTitle}
            editable={editable}
            projectEditable={projectEditable}
            dateTimeEnabled={dateTimeEnabled}
            iconTheme={iconTheme}
        />

    const NewTaskModalView = <Modal title="Nuovo Task" onClick={() => { setShowPopup(false) }} buttons={[
        { label: 'chiudi', onClick: () => setShowPopup(false) },
        { label: 'salva', onClick: () => handleAddTask() },
    ]}  >
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
        <Toggle
            checked={addAnother}
            onChange={setAddAnother}
            label={"Aggiungi un altro task"}
        />
    </Modal>;

    if (zenMode) {
        return <div className="app-container">
            <div style={{ display: "flex", justifyContent: "flex-end", height: "35px", gap: "12px" }}>
                <Toggle
                    checked={zenMode}
                    onChange={setZenMode}
                />
                {showText && <span onClick={() => setZenMode(!zenMode)} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>zen mode</span>}
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
        zenMode,
        setZenMode,
        handleThemeChange,
        iconTheme,
        showConfig,
        setShowConfig,
    }) => {
        // Usa i task passati come prop

        // Gestione colori progetti
        const [projectColors, setProjectColors] = useState(getConfigRepository().getProjectColors());

        const handleColorChange = (project, color) => {
            const newColors = { ...projectColors, [project]: color };
            setProjectColors(newColors);
            getConfigRepository().setProjectColor(project, color);
        };

        const TogglePanel = () => {
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
                    />          <Toggle
                        checked={showText}
                        onChange={handleShowTextToggle}
                        label={"Mostra testo"}
                    />
                </div>
            );
        };

        // Palette Modal state
        const [paletteModalProject, setPaletteModalProject] = useState(null);

        const PaletteModal = ({ project, onClose }) => (
            <Modal title="Scegli un colore" onclick={onClose} icon={<span style={{ width: 24, height: 24, background: projectColors[project] }} />} >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px' }}>
                    {Object.entries(Palette24).map(([name, color]) => (
                        <button
                            key={name}
                            style={{
                                width: 32,
                                height: 32,
                                background: color,
                                border: '2px solid #fff',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                boxShadow: '0 0 2px #0002'
                            }}
                            title={name}
                            onClick={() => {
                                handleColorChange(project, color);
                                onClose();
                            }}
                        />
                    ))}
                </div>
            </Modal>
        );

        const ProjectPanel = () => {
            return tasks && tasks.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                    <ul style={{ margin: '8px 0 0 0', padding: 0, listStyle: 'none' }}>
                        {Array.from(new Set(tasks
                            .map(t => t.project)
                            .filter(p => typeof p === 'string' && p.trim() !== ''))
                        ).map((project, idx) => (
                            <li key={idx} style={{ padding: '2px 0', display: 'flex', alignItems: 'center' }}>
                                <span style={{ marginRight: '8px', flex: '1' }}>{String(project)}</span>
                                <button
                                    style={{
                                        width: 24,
                                        height: 24,
                                        border: 'none',
                                        background: projectColors[String(project)] || '#000000',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        boxShadow: '0 0 2px #0002'
                                    }}
                                    title="Scegli colore"
                                    onClick={() => setPaletteModalProject(project)}
                                />
                            </li>
                        ))}
                    </ul>
                    {paletteModalProject && (
                        <PaletteModal project={paletteModalProject} onClose={() => setPaletteModalProject(null)} />
                    )}
                </div>
            );
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
                            icons={getStatusIcons('default')}
                        />
                        <Toggle
                            checked={iconTheme === 'checked'}
                            onChange={() => handleThemeChange('checked')}
                            label={"Stile con spunta"}
                            icons={getStatusIcons('checked')}
                        />
                        <Toggle
                            checked={iconTheme === 'panda'}
                            onChange={() => handleThemeChange('panda')}
                            label={"Panda"}
                            icons={getStatusIcons('panda')}
                        />
                    </div>
                </div>
            );
        }


        return (
            <>
                <div className="header-bar" style={{ height: "35px" }}>
                    <div className="header-icons">
                        <span onClick={() => setShowHelp(true)}>
                            <HelpIcon />
                        </span>
                        {showText && <span onClick={() => setShowHelp(true)} style={{ cursor: "pointer" }}>
                            help
                        </span>}
                        <span onClick={() => setShowConfig(true)} style={{ cursor: "pointer" }}>
                            <GearIcon />
                        </span>
                        {showText && <span onClick={() => setShowConfig(true)} style={{ cursor: "pointer" }}>
                            config
                        </span>}
                        <Toggle
                            checked={zenMode}
                            onChange={setZenMode}
                            label={""}
                        />
                        {showText && <span onClick={() => setZenMode(!zenMode)} style={{ cursor: "pointer" }}>zen mode</span>}
                    </div>
                </div>
                {/** estrarre un componente modal da questo */}
                {showConfig && (
                    <Modal onClick={() => setShowConfig(false)} title="Configurazioni" icon={<GearIcon />}  >
                        <TabbedContent panels={[
                            { content: <TogglePanel />, title: "Generale" },
                            { content: <ProjectPanel />, title: "Progetti" },
                            { content: <ThemePanel />, title: "Temi" },
                        ]} />
                        <InfoPanel />
                    </Modal>
                )}
            </>
        );
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
        setShowExpired={setShowExpiredFeature}
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
        setShowCleanConfirm={setShowCleanConfirm}
        showText={showText} />;

    const HelpModalView = <HelpModal
        showHelp={showHelp}
        setShowHelp={setShowHelp}
    />;

    const ConfirmModalView = <ConfirmModal
        onClick={() => setShowCleanConfirm(false)}
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
