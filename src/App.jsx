import React, { useState, useEffect } from 'react'
import './App.css'
import TaskList from './components/TaskList'
import { STATUS_ENUM, getStatusIcons } from './utils'
import Toggle from './components/Toggle'
import TaskProjectSelector from './components/TaskProjectSelector'
import Footer from './components/Footer'
import ConfirmModal from './components/ConfirmModal'
import HelpModal from './components/HelpModal'
import { LoginModal } from './components/LoginModal'
import GearIcon from './components/GearIcon'
import HelpIcon from './components/HelpIcon'
import { Modal } from './components/Modal'
import { Palette24 } from './types/Palette24'
import TabbedContent from './components/TabbedContent'
import InfoPanel from './components/InfoPanel'
import { handleAddAnotherModal } from './utils/handleAddAnotherModal'
import { archiveCompletedAndSkippedTasks } from './functions/archiveCompletedAndSkippedTasks'
import { getConfigRepository } from './repositories'
import UsersIcon from './components/UsersIcon'
import LoginForm from './components/LoginForm'
import { SGFooter } from '@sensorario/sg-components'

function App() {
  // Stato per il token di autenticazione - recupera dal localStorage se presente
  const [token, setToken] = useState(() => {
    return localStorage.getItem('simplanner-access-token')
  })

  // Stato per gestire la cancellazione del login
  const [loginCancelled, setLoginCancelled] = useState(false)

  // Registra callback per gestire 401 Unauthorized e autenticazione
  useEffect(() => {
    const repository = getConfigRepository()
    repository.onUnauthorized(() => {
      setToken(null)
    })
    repository.onAuthenticated((newToken) => {
      setToken(newToken)
    })
  }, [])

  // Handler per il login
  const handleLogin = (username, password) => {
    getConfigRepository()
      .authenticate(username, password)
      .catch((err) => {
        alert('Login fallito: ' + err.message)
      })
  }

  // Handler per la cancellazione del login
  const handleCancelLogin = () => {
    setLoginCancelled(true)
  }

  // Handler per il logout
  const handleLogout = () => {
    if (window.confirm('Sei sicuro di voler uscire? Tutti i dati locali verranno rimossi.')) {
      const repo = getConfigRepository()
      if (repo.logout) {
        repo.logout()
      }
      setToken(null)
      setTasks([])
      // Ricarica la pagina per resettare tutti gli stati
      window.location.reload()
    }
  }

  // Mostro nascondo testo accanto alle icone
  const [showText, setShowText] = useState(getConfigRepository().getShowText())

  const handleShowTextToggle = () => {
    const newValue = !showText
    setShowText(newValue)
    getConfigRepository().setShowText(newValue)
  }

  // Stato per il tema delle icone
  const [iconTheme, setIconTheme] = useState(
    getConfigRepository().getIconTheme()
  )

  // Funzione per aggiornare il tema
  const handleThemeChange = (theme) => {
    setIconTheme(theme)
    getConfigRepository().setIconTheme(theme)
  }

  // Stato per abilitare/disabilitare il campo data-ora nei task
  const [dateTimeEnabled, setDateTimeEnabledState] = useState(() => {
    getConfigRepository().getDateTimeEnabled()
  })

  const [showExpired, setShowExpiredFeature] = useState(
    getConfigRepository().getShowExpired()
  )

  const [showConfig, setShowConfig] = useState(false)

  useEffect(() => {
    getConfigRepository().setShowExpired(showExpired)
  }, [showExpired])

  const setDateTimeEnabled = (val) => {
    setDateTimeEnabledState(val)
    getConfigRepository().setDateTimeEnabled(val)
  }

  // Funzione per sincronizzare le configurazioni con l'API
  const syncConfigToAPI = () => {
    const token = localStorage.getItem('simplanner-access-token');
    if (!token) {
      return; // Non sincronizzare se non c'è token
    }

    const repository = getConfigRepository();

    // Recupera tutte le configurazioni correnti
    const allConfig = {
      "simplanner-tasks": repository.getTasks(),
      "simplanner-project-colors": repository.getProjectColors(),
      "simplanner-show-text": repository.getShowText(),
      "simplanner-icon-theme": repository.getIconTheme(),
      "simplanner-show-expired": repository.getShowExpired(),
      "simplanner-dateTime-enabled": repository.getDateTimeEnabled(),
      "simplanner-zen-mode": repository.getZenMode(),
      "simplanner-project-filter": repository.getProjectFilter(),
      "simplanner-project-groupable": repository.getProjectGroupable(),
      //"simplanner-config-tab": repository.getActiveTab()
    };

    // Invia PUT con tutte le configurazioni
    const url = 'https://api.simonegentili.com/quadrato/data';
    const options = {
      method: 'PUT',
      headers: {
        'authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(allConfig)
    };

    fetch(url, options)
      .then(res => res.json())
      .then(json => {
        console.log('Configurazioni sincronizzate con API:', json);
      })
      .catch(err => {
        console.error('Errore sincronizzazione configurazioni:', err);
      });
  }

  // Stato per filtro progetto
  const [projectFilter, setProjectFilterState] = useState(() => {
    return getConfigRepository().getProjectFilter()
  })
  const setProjectFilter = (val) => {
    setProjectFilterState(val)
    getConfigRepository().setProjectFilter(val)
    syncConfigToAPI()
  }

  // Stato per abilitare/disabilitare il raggruppamento per progetto
  const [projectGroupable, setProjectGroupableState] = useState(() => {
    return getConfigRepository().getProjectGroupable()
  })

  const setProjectGroupable = (val) => {
    setProjectGroupableState(val)
    getConfigRepository().setProjectGroupable(val)
    syncConfigToAPI()
  }
  // Stato per abilitare/disabilitare la modifica dei task
  const [editable, setEditableState] = useState(() => {
    return getConfigRepository().getProjectGroupable()
  })

  // Wrapper per aggiornare stato e localStorage
  const setEditable = (val) => {
    setEditableState(val)
    getConfigRepository().setProjectGroupable(val)
  }

  // Stato per i task
  const [tasks, setTasks] = useState(() => {
    return getConfigRepository().getTasks()
  })


  const [ws, setWs] = useState('default');
  // workspaces ora è un array di oggetti workspace (non solo nomi)
  const [workspaces, setWorkspaces] = useState([])
  const [workspaceFilter, setWorkspaceFilter] = useState('')

  const syncRouteSegment = (index, value) => {
    if (typeof window === 'undefined') return

    const segments = window.location.pathname
      .split('/')
      .filter(Boolean)
      .map((part) => decodeURIComponent(part))

    // Usa un array di almeno (index+1) slot, riempiendo con i valori esistenti
    const next = Array.from({ length: Math.max(segments.length, index + 1) }, (_, i) => segments[i] ?? null)

    if (value === null || value === undefined) {
      next[index] = null
    } else {
      next[index] = value
    }

    // Rimuovi i null dalla fine, poi filtra i null restanti
    while (next.length > 0 && next[next.length - 1] === null) {
      next.pop()
    }

    const cleanSegments = next.filter((s) => s !== null)

    if (cleanSegments.length === 0) {
      return
    }

    const nextPathname = `/${cleanSegments.map((part) => encodeURIComponent(part)).join('/')}`
    const nextUrl = `${nextPathname}${window.location.search}${window.location.hash}`
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`

    if (nextUrl !== currentUrl) {
      window.history.replaceState({}, '', nextUrl)
    }
  }

  useEffect(() => {
    if (!ws) return
    syncRouteSegment(0, ws)
  }, [ws])

  useEffect(() => {
    syncRouteSegment(1, projectFilter && projectFilter !== 'ALL' ? projectFilter : null)
  }, [projectFilter])

  const [showPopup, setShowPopup] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskProject, setNewTaskProject] = useState()
  const [newTaskDateTime, setNewTaskDateTime] = useState('')
  const [newTaskLongDescription, setNewTaskLongDescription] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [zenMode, setZenMode] = useState(() => {
    return getConfigRepository().getZenMode()
  })

  // Sincronizza zenMode con il repository quando cambia
  useEffect(() => {
    getConfigRepository().setZenMode(zenMode)
  }, [zenMode])

  useEffect(() => {
    const accessToken = localStorage.getItem('simplanner-access-token')
    if (!accessToken) {
      setWorkspaces(['default'])
      return
    }

    fetch('https://api.simonegentili.com/quadrato/workspaces', {
      method: 'GET',
      headers: {
        authorization: accessToken,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((json) => {
        const list = Array.isArray(json?.workspaces) ? json.workspaces : []
        setWorkspaces(list)
        // scorri tutti i workspace e quello che ha come chave current, a true setta ws
        const currentWorkspace = list.find(
          (workspace) => workspace?.current === true
        )
        if (currentWorkspace && currentWorkspace.name) {
          setWs(currentWorkspace.name)
        }
      })
      .catch(() => {
        setWorkspaces([])
      })
  }, [token])

  // Funzione per aggiornare la descrizione di un task
  const updateTaskTitle = (
    id,
    value,
    longValue,
    projectValue,
    timestampValue,
    periodicityValue
  ) => {
    let putSent = false
    setTasks((tasks) => {
      const updated = tasks.map((task) => {
        let newTimestamp = timestampValue ?? task.timestamp

        if (typeof newTimestamp === 'string' && newTimestamp.length > 0) {
          newTimestamp = new Date(newTimestamp).getTime()
        }

        const taskObj = task.id === id
          ? {
            ...task,
            title: value,
            longDescription: longValue,
            project: projectValue ?? task.project,
            timestamp: newTimestamp,
            periodicity: periodicityValue ?? task.periodicity,
          }
          : task;

        // Send PUT request to update the task on the server
        if (task.id === id && !putSent) {
          putSent = true
          const url = `https://api.simonegentili.com/quadrato/task/${task.id}`;
          const options = {
            method: 'PUT',
            body: JSON.stringify(taskObj),
            headers: {
              authorization: token,
              'Content-Type': 'application/json'
            }
          }
          fetch(url, options)
            .then(res => res.json())
            .then(json => {
              console.log({ json })
            });
        }

        return taskObj;
      })

      getConfigRepository().setTasks(updated)
      return updated
    })
  }

  // Ricarica tutti i dati quando l'API risponde
  useEffect(() => {
    const repository = getConfigRepository()
    if (repository.onDataLoaded) {
      repository.onDataLoaded(() => {
        console.log('Dati caricati dall\'API, aggiornamento interfaccia....')

        // Aggiorna tutti gli stati con i dati dall'API
        const loadedTasks = repository.getTasks()
        if (loadedTasks && loadedTasks.length > 0) {
          console.log('Aggiornamento tasks con dati API:', loadedTasks)
          setTasks(loadedTasks)
        } else {
          console.log('Nessun task caricato dall\'API, mantenendo lo stato attuale.')
        }

        // Aggiorna il tema delle icone
        const loadedIconTheme = repository.getIconTheme()
        setIconTheme(loadedIconTheme)
        console.log('Icon theme aggiornato con dati API:', loadedIconTheme)

        // Aggiorna showText
        const loadedShowText = repository.getShowText()
        setShowText(loadedShowText)

        // Aggiorna showExpired
        const loadedShowExpired = repository.getShowExpired()
        setShowExpiredFeature(loadedShowExpired)

        // Aggiorna dateTimeEnabled
        const loadedDateTimeEnabled = repository.getDateTimeEnabled()
        setDateTimeEnabledState(loadedDateTimeEnabled)

        // Aggiorna projectGroupable
        const loadedProjectGroupable = repository.getProjectGroupable()
        setProjectGroupableState(loadedProjectGroupable)
        setEditableState(loadedProjectGroupable)

        // Aggiorna projectFilter
        const loadedProjectFilter = repository.getProjectFilter()
        setProjectFilterState(loadedProjectFilter)

        // Aggiorna zenMode
        const loadedZenMode = repository.getZenMode()
        setZenMode(loadedZenMode)
      })
    }
  }, [])

  useEffect(() => {
    setNewTaskProject(projectFilter === 'ALL' ? '' : projectFilter)
  }, [projectFilter])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'N') {
        e.preventDefault()
        setShowPopup(true)
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'X') {
        e.preventDefault()
        const updatedTasks = archiveCompletedAndSkippedTasks({ tasks })
        setTasks(updatedTasks)
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'H') {
        e.preventDefault()
        setShowHelp(true)
      }
      if (e.key === 'Escape') {
        if (showHelp) {
          setShowHelp(false)
        } else if (showPopup) {
          setShowPopup(false)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const accessToken = localStorage.getItem('simplanner-access-token')
    if (!accessToken) return

    // Ricarica i dati quando cambia il workspace
    getConfigRepository().fetchData(tasks => setTasks(tasks))
  }, [ws])

  const handleClick = (id) => {
    setTasks((tasks) => {
      const updated = tasks.map((task) => {
        if (task.id === id) {
          const updatedTask = { ...task, status: (task.status + 1) % 4 };

          // Send PUT request to update the task status on the server
          const url = `https://api.simonegentili.com/quadrato/task/${task.id}`;
          const options = {
            method: 'PUT',
            body: JSON.stringify(updatedTask),
            headers: {
              authorization: token,
              'Content-Type': 'application/json'
            }
          }
          fetch(url, options)
            .then(res => res.json())
            .then(json => {
              console.log({ json })
            });

          return updatedTask;
        }
        return task;
      })
      getConfigRepository().setTasks(updated)
      return updated
    })
  }

  const handleAddTask = () => {
    if (newTaskTitle.trim() === '') return
    let timestamp = '';

    if (typeof newTaskDateTime === 'string' && newTaskDateTime.length > 0) {
      timestamp = new Date(newTaskDateTime).getTime()
    }

    const newTask = {
      // simulate uuid with timestamp and random number
      id: Date.now() + Math.floor(Math.random() * 1000),
      title: newTaskTitle,
      longDescription: newTaskLongDescription,
      project: newTaskProject,
      timestamp,
      status: 0,
      archived: false,
      periodicity: null,
    }


    const url = 'https://api.simonegentili.com/quadrato/task';
    const options = {
      method: 'POST',
      headers: {
        authorization: token,
        'content-type': 'application/json'
      },
      body: JSON.stringify(newTask)
    };

    fetch(url, options)
      .then(res => res.json())
      .then(() => {
        getConfigRepository().fetchData()
      });

    handleAddAnotherModal({
      addAnother,
      setShowPopup,
      setAddAnother,
      setNewTaskTitle,
    })
  }

  const [showCleanConfirm, setShowCleanConfirm] = useState(false)

  const handleCleanTasks = () => {
    const willArchivedTasts = tasks.filter(
      (t) => t.status === STATUS_ENUM.DONE || t.status === STATUS_ENUM.SKIPPED
    );
    willArchivedTasts.forEach(task => {
      const url = `https://api.simonegentili.com/quadrato/task/${task.id}`;
      const options = {
        method: 'PUT',
        body: JSON.stringify({ archived: true }),
        headers: {
          authorization: token,
          'Content-Type': 'application/json'
        }
      }
      fetch(url, options)
        .then(res => res.json())
        .then(json => {
          console.log({ json })
        });
    });

    const updatedTasks = archiveCompletedAndSkippedTasks({ tasks })
    setTasks(updatedTasks)
    getConfigRepository().setTasks(updatedTasks)
    setShowCleanConfirm(false)
  }

  const unarchivedTasks = tasks

  const visible = (() => {
    // Filtra per progetto
    let filtered =
      projectFilter === 'ALL'
        ? unarchivedTasks
        : projectFilter === null
          ? unarchivedTasks.filter((t) => !t.project)
          : projectFilter
            ? unarchivedTasks.filter((t) => t.project === projectFilter)
            : unarchivedTasks
    // Filtra per range di giorni
    const now = new Date()
    return filtered.filter((t) => {
      if (!t.timestamp) return true // task senza scadenza
      // Gestisce sia timestamp numerici che stringhe
      const dt = typeof t.timestamp === 'number' ? new Date(t.timestamp) : new Date(t.timestamp)
      if (showExpired && dt < now) return true // mostra scaduti se abilitato
      return dt >= now // mostra tutti i task futuri
    })
  })()

  const [addAnother, setAddAnother] = useState(false)

  const VisibleTasks = (
    <TaskList
      tasks={visible}
      onTaskClick={handleClick}
      updateTaskTitle={updateTaskTitle}
      editable={editable}
      projectEditable={projectGroupable}
      dateTimeEnabled={dateTimeEnabled}
      iconTheme={iconTheme}
    />
  )

  const [showChangeWorkspace, setShowChangeWorkspace] = useState(false)
  const [showWorkspaceMembers, setShowWorkspaceMembers] = useState(false)

  const NewTaskModalView = (
    <Modal
      title="Nuovo Task"
      onClick={() => {
        setShowPopup(false)
      }}
      buttons={[
        { label: 'chiudi', onClick: () => setShowPopup(false) },
        { label: 'salva task', onClick: () => handleAddTask() },
      ]}
    >
      <div className="modal-input-wrapper">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Titolo del task"
          className="modal-input"
          autoFocus
          onFocus={(e) => e.currentTarget.classList.add('input-focus')}
          onBlur={(e) => e.currentTarget.classList.remove('input-focus')}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddTask()
            } else if (e.key === 'Escape') {
              setShowPopup(false)
            }
          }}
        />
      </div>
      <div className="modal-long-description">
        <textarea
          value={newTaskLongDescription}
          onChange={(e) => setNewTaskLongDescription(e.target.value)}
          placeholder="Descrizione del task"
          className="modal-input"
        />
      </div>
      {projectGroupable && (
        <div className="modal-input-wrapper">
          <input
            type="text"
            value={newTaskProject}
            onChange={(e) => setNewTaskProject(e.target.value)}
            placeholder="Progetto (opzionale)"
            className="modal-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddTask()
              }
            }}
          />
        </div>
      )}
      {dateTimeEnabled && (
        <div className="modal-input-wrapper">
          <input
            type="datetime-local"
            value={newTaskDateTime}
            onChange={(e) => setNewTaskDateTime(e.target.value)}
            className="modal-input"
          />
        </div>
      )}
      <Toggle
        checked={addAnother}
        onChange={setAddAnother}
        label={'Aggiungi un altro task'}
      />
    </Modal>
  )

  if (zenMode) {
    return (
      <div className="app-container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            height: '35px',
            gap: '12px',
          }}
        >
          <Toggle checked={zenMode} onChange={setZenMode} />
          {showText && (
            <span
              onClick={() => setZenMode(!zenMode)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              zen mode
            </span>
          )}
        </div>
        {VisibleTasks}
        {showPopup && NewTaskModalView}
      </div>
    )
  }

  const Header = ({
    tasks,
    setShowHelp,
    projectGroupable,
    setProjectGroupable,
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
    const [projectColors, setProjectColors] = useState(
      getConfigRepository().getProjectColors()
    )

    const handleColorChange = (project, color) => {
      const newColors = { ...projectColors, [project]: color }
      setProjectColors(newColors)
      getConfigRepository().setProjectColor(project, color)
    }

    const TogglePanel = () => {
      return (
        <div className="tab">
          <Toggle
            checked={projectGroupable}
            onChange={setProjectGroupable}
            label={'Raggruppa'}
          />
          <Toggle
            checked={dateTimeEnabled}
            onChange={setDateTimeEnabled}
            label={'Con scadenza'}
          />
          <Toggle
            checked={showExpired}
            onChange={setShowExpired}
            label={'Mostra scaduti'}
          />{' '}
          <Toggle
            checked={showText}
            onChange={handleShowTextToggle}
            label={'Mostra testo'}
          />
        </div>
      )
    }

    // Palette Modal state
    const [paletteModalProject, setPaletteModalProject] = useState(null)

    const PaletteModal = ({ project, onClose }) => (
      <Modal
        title="Scegli un colore"
        onclick={onClose}
        icon={
          <span
            style={{
              width: 24,
              height: 24,
              background: projectColors[project],
            }}
          />
        }
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            padding: '12px',
          }}
        >
          {Object.entries(Palette24).map(([name, color]) => (
            <button
              key={name}
              style={{
                width: 32,
                height: 32,
                background: color,
                border: '2px solid #fff',
                cursor: 'pointer',
                boxShadow: 'rgb(8 3 3 ) 0px 4px 20px',
              }}
              title={name}
              onClick={() => {
                handleColorChange(project, color)
                onClose()
              }}
            />
          ))}
        </div>
      </Modal>
    )

    const WorkspacePanel = () => {
      return <>...</>
    }

    const ProjectPanel = () => {
      return (
        tasks &&
        tasks.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <ul style={{ margin: '8px 0 0 0', padding: 0, listStyle: 'none' }}>
              {Array.from(
                new Set(
                  tasks
                    .map((t) => t.project)
                    .filter((p) => typeof p === 'string' && p.trim() !== '')
                )
              ).map((project, idx) => (
                <li
                  key={idx}
                  style={{
                    padding: '2px 0',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ marginRight: '8px', flex: '1' }}>
                    {String(project)}
                  </span>
                  <button
                    style={{
                      width: 24,
                      height: 24,
                      border: 'none',
                      background: projectColors[String(project)] || '#000000',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      boxShadow: '0 0 2px #0002',
                    }}
                    title="Scegli colore"
                    onClick={() => setPaletteModalProject(project)}
                  />
                </li>
              ))}
            </ul>
            {paletteModalProject && (
              <PaletteModal
                project={paletteModalProject}
                onClose={() => setPaletteModalProject(null)}
              />
            )}
          </div>
        )
      )
    }

    const ThemePanel = () => {
      return (
        <div>
          <strong>Tema icone:</strong>
          <div style={{ marginTop: '16px' }}>
            <Toggle
              checked={iconTheme === 'default'}
              onChange={() => handleThemeChange('default')}
              label={'Tema di default'}
              icons={getStatusIcons('default')}
            />
            <Toggle
              checked={iconTheme === 'checked'}
              onChange={() => handleThemeChange('checked')}
              label={'Stile con spunta'}
              icons={getStatusIcons('checked')}
            />
            <Toggle
              checked={iconTheme === 'panda'}
              onChange={() => handleThemeChange('panda')}
              label={'Panda'}
              icons={getStatusIcons('panda')}
            />
          </div>
        </div>
      )
    }

    return (
      <>
        <div className="header-bar" style={{ height: '35px' }}>
          <div className="header-icons">
            <span onClick={() => setShowHelp(true)}>
              <HelpIcon />
            </span>
            {showText && (
              <span
                onClick={() => setShowHelp(true)}
                style={{ cursor: 'pointer' }}
              >
                help
              </span>
            )}
            <span
              onClick={() => setShowConfig(true)}
              style={{ cursor: 'pointer' }}
            >
              <GearIcon />
            </span>
            {showText && (
              <span
                onClick={() => setShowConfig(true)}
                style={{ cursor: 'pointer' }}
              >
                config
              </span>
            )}
            <Toggle checked={zenMode} onChange={setZenMode} label={''} />
            {showText && (
              <span
                onClick={() => {
                  setZenMode(!zenMode)
                  // aggiorna anche il repository
                  getConfigRepository().setZenMode(!zenMode)
                }}
                style={{ cursor: 'pointer' }}
              >
                zen mode
              </span>
            )}
            {token && (
              <button
                onClick={handleLogout}
                style={{
                  padding: '4px 12px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
              >
                Logout.
              </button>
            )}
          </div>
        </div>
        {/** estrarre un componente modal da questo */}
        {showConfig && (
          <Modal
            onClick={() => setShowConfig(false)}
            title="Configurazioni"
            icon={<GearIcon />}
          >
            <TabbedContent
              panels={[
                { content: <TogglePanel />, title: 'Generale' },
                { content: <ProjectPanel />, title: 'Progetti' },
                { content: <ThemePanel />, title: 'Temi' },
              ]}
            />
            <InfoPanel />
          </Modal>
        )}
      </>
    )
  }

  const HeaderView = (
    <Header
      tasks={tasks}
      setShowHelp={setShowHelp}
      editable={editable}
      setEditable={setEditable}
      projectGroupable={projectGroupable}
      setProjectGroupable={setProjectGroupable}
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
    />
  )

  const DefinedTaskProject = (
    <TaskProjectSelector
      tasks={tasks}
      projectFilter={projectFilter}
      setProjectFilter={setProjectFilter}
    />
  )

  const FooterView = (
    <Footer
      setShowPopup={setShowPopup}
      setShowCleanConfirm={setShowCleanConfirm}
      showText={showText}
    />
  )

  const HelpModalView = (
    <HelpModal showHelp={showHelp} setShowHelp={setShowHelp} />
  )

  const ConfirmModalView = (
    <ConfirmModal
      onClick={() => setShowCleanConfirm(false)}
      setShowCleanConfirm={setShowCleanConfirm}
      handleCleanTasks={handleCleanTasks}
    />
  )

  const ChangeWorkspaceModalView = (
    (() => {
      const filteredWorkspaces = workspaces.filter((workspace) =>
        (workspace?.name || '').toLowerCase().includes(workspaceFilter.trim().toLowerCase())
      )

      return (
        <Modal
          title="Change Workspace"
          onClick={() => setShowChangeWorkspace(false)}
        >
          <div className="modal-input-wrapper">
            <input
              type="text"
              value={workspaceFilter}
              onChange={(e) => setWorkspaceFilter(e.target.value)}
              placeholder="Nome workspace"
              className="modal-input"
            />
          </div>
          <div className="modal-input-wrapper workspace-buttons">
            {filteredWorkspaces.map((workspace) => (
              <div key={workspace.id || workspace.name} style={{ marginBottom: 8 }}>
                <button
                  type="button"
                  className="modal-close-btn"
                  style={{ marginBottom: 4 }}
                  onClick={() => {
                    const accessToken = localStorage.getItem('simplanner-access-token')
                    if (accessToken) {
                      fetch('https://api.simonegentili.com/quadrato/workspace/current', {
                        method: 'POST',
                        headers: {
                          authorization: accessToken,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ name: workspace.name }),
                      })
                        .then(() => {
                          setWs(workspace.name)
                          setProjectFilter('ALL')
                          setWorkspaceFilter('')
                          setShowChangeWorkspace(false)
                        })
                        .catch(() => {
                          setWs(workspace.name)
                          setProjectFilter('ALL')
                          setWorkspaceFilter('')
                          setShowChangeWorkspace(false)
                        })
                    } else {
                      setWs(workspace.name)
                      setProjectFilter('ALL')
                      setWorkspaceFilter('')
                      setShowChangeWorkspace(false)
                    }
                  }}
                >
                  {workspace.name}
                </button>
                <div style={{ fontSize: '12px', color: '#444', marginLeft: 8 }}>
                  <span>Totale: {workspace.tasks_count ?? 0}</span>
                  {workspace.tasks_by_status && (
                    <span style={{ marginLeft: 8 }}>
                      {Object.entries(workspace.tasks_by_status).map(([status, count]) => (
                        <span key={status} style={{ marginRight: 8 }}>{status}: {count}</span>
                      ))}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {filteredWorkspaces.length === 0 && workspaceFilter.trim().length > 0 && (
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => {
                  const newWorkspaceName = workspaceFilter.trim()
                  const accessToken = localStorage.getItem('simplanner-access-token')

                  const finalize = () => {
                    setWs(newWorkspaceName)
                    setProjectFilter('ALL')
                    setWorkspaces((prev) =>
                      prev.some(w => w.name === newWorkspaceName)
                        ? prev
                        : [...prev, { name: newWorkspaceName }]
                    )
                    setWorkspaceFilter('')
                    setShowChangeWorkspace(false)
                  }

                  if (!accessToken) {
                    finalize()
                    return
                  }

                  fetch('https://api.simonegentili.com/quadrato/workspaces', {
                    method: 'POST',
                    headers: {
                      authorization: accessToken,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: newWorkspaceName }),
                  })
                    .then(() => {
                      // Set as current workspace
                      return fetch('https://api.simonegentili.com/quadrato/workspace/current', {
                        method: 'POST',
                        headers: {
                          authorization: accessToken,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ name: newWorkspaceName }),
                      })
                    })
                    .then(() => finalize())
                    .catch(() => finalize())
                }}
              >
                salva nuovo workspace
              </button>
            )}
          </div>
        </Modal>
      )
    })()
  )

  const addMemberHandler = () => {
    const emailInput = document.querySelector('.modal-input[type="email"]')
    const email = emailInput ? emailInput.value.trim() : ''
    const accessToken = localStorage.getItem('simplanner-access-token')
    if (!email || !accessToken) {
      return
    }

    fetch('https://api.simonegentili.com/quadrato/workspace/members', {
      method: 'POST',
      headers: {
        authorization: accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ workspace: ws, email }),
    })
      .then(() => {
        if (emailInput) {
          emailInput.value = ''
        }
        setShowWorkspaceMembers(false)
      })
      .catch(() => {
        if (emailInput) {
          emailInput.value = ''
        }
        setShowWorkspaceMembers(false)
      })
  }

  const WorkspaceMembersModalView = (
    <Modal
      title="Membri workspace"
      onClick={() => setShowWorkspaceMembers(false)}
      buttons={[
        { label: 'invita', onClick: () => addMemberHandler() },
        { label: 'chiudi', onClick: () => setShowWorkspaceMembers(false) },
      ]}
    >
      <div className="modal-input-wrapper">
        <input
          type="email"
          placeholder="email membro"
          className="modal-input"
        />
      </div>
    </Modal>
  )

  const visibleTasks = (() => {
    let filtered =
      projectFilter === 'ALL'
        ? unarchivedTasks
        : projectFilter === null
          ? unarchivedTasks.filter((t) => !t.project)
          : projectFilter
            ? unarchivedTasks.filter((t) => t.project === projectFilter)
            : unarchivedTasks
    const now = new Date()
    return filtered.filter((t) => {
      if (!t.timestamp) return true
      // Gestisce sia timestamp numerici che stringhe
      const dt = typeof t.timestamp === 'number' ? new Date(t.timestamp) : new Date(t.timestamp)
      if (showExpired && dt < now) return true
      return dt >= now // mostra tutti i task futuri
    })
  })()

  return (
    <div className="foo">
      <div className="app-container">

        <div className="sticky-header" style={{
          marginBottom: '8px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'white'
        }}>
          <div className="workspace-wrapper">
            <div className="workspaces-container clickable  " onClick={() => setShowChangeWorkspace(true)}>workspace: {ws}</div>
            {ws != 'default' && <div
              className="workspace-members"
              onClick={() => setShowWorkspaceMembers(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setShowWorkspaceMembers(true)
                }
              }}
            >
              <UsersIcon />
            </div>}
            {HeaderView}
          </div>
          {projectGroupable && DefinedTaskProject}
        </div>

        <TaskList
          tasks={visibleTasks}
          onTaskClick={handleClick}
          updateTaskTitle={updateTaskTitle}
          editable={editable}
          projectEditable={projectGroupable}
          dateTimeEnabled={dateTimeEnabled}
          iconTheme={iconTheme}
        />
        {FooterView}
        {showHelp && HelpModalView}
        {showPopup && NewTaskModalView}
        {showCleanConfirm && ConfirmModalView}
        {showChangeWorkspace && ChangeWorkspaceModalView}
        {showWorkspaceMembers && WorkspaceMembersModalView}
        {token === null && !loginCancelled && (
          <LoginModal
            onClose={handleCancelLogin}
            onLogin={handleLogin}
          />
        )}
        {token === null && loginCancelled && (
          <LoginForm
            onClick={() => setLoginCancelled(false)}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          />
        )}
      </div>
      <SGFooter />
    </div>
  )
}

export default App
