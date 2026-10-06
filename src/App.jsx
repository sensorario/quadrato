import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import "./App.css";
import TaskList from "./components/TaskList";
import { STATUS_ENUM, getStatusIcons } from "./utils";
import Toggle from "./components/Toggle";
import TaskProjectSelector from "./components/TaskProjectSelector";
import ConfirmModal from "./components/ConfirmModal";
import HelpModal from "./components/HelpModal";
import { Modal } from "./components/Modal";
import TaskModal from "./components/TaskModal";
import RenameProjectModal from "./components/RenameProjectModal";
import { Palette24 } from "./types/Palette24";
import TabbedContent from "./components/TabbedContent";
import InfoPanel from "./components/InfoPanel";
import { archiveCompletedAndSkippedTasks } from "./functions/archiveCompletedAndSkippedTasks";
import { persistArchivedTasks } from "./functions/persistArchivedTasks";
import { childrenOf, descendantIds, hasOpenDescendants, reconcileAncestors } from "./utils/taskTree";
import { getActiveProjects } from "./functions/getActiveProjects";
import { getConfigRepository } from "./repositories";
import { navigate } from "./Router";
import { Icon, LanguageSwitcher, QuadratoHeader, SGFooter } from "@sensorario/sg-components";
import ExpiredTasks from "./components/ExpiredTasks";
import LogoutConfirmModal from "./components/LogoutConfirmModal";

// Header di autorizzazione da allegare alle richieste autenticate verso l'API
function getAuthHeader() {
    const accessToken = localStorage.getItem("simonegentili.com-access-token");
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

// Riferimento a una settimana nota (lun 5 - dom 11 gennaio 2026) per derivare
// le abbreviazioni dei giorni nella lingua corrente tramite Intl
const WEEKDAY_REFERENCE_DATES = [5, 6, 7, 8, 9, 10, 11].map(
    (day) => new Date(2026, 0, day)
);

function App() {
    const { t, i18n } = useTranslation();

    const NOTIFICATION_WEEKDAYS = WEEKDAY_REFERENCE_DATES.map((date, idx) => ({
        value: idx + 1,
        label: new Intl.DateTimeFormat(i18n.language, {
            weekday: "short",
        }).format(date),
    }));
    // Stato per il token di autenticazione - recupera dal localStorage se presente
    const [token, setToken] = useState(() => {
        return localStorage.getItem("simonegentili.com-access-token");
    });

    // Nome dell'utente autenticato, noto dal login e salvato dal repository
    const [username, setUsername] = useState(() => {
        return getConfigRepository().getUsername();
    });

    // Registra callback per gestire 401 Unauthorized e autenticazione
    useEffect(() => {
        const repository = getConfigRepository();
        repository.onUnauthorized(() => {
            setToken(null);
            setUsername(null);
        });
        repository.onAuthenticated((newToken) => {
            setToken(newToken);
            setUsername(repository.getUsername());
        });
    }, []);

    // Nessun token: la schermata di login vive solo sulla rotta /login
    useEffect(() => {
        if (token === null) {
            navigate("/login");
        }
    }, [token]);

    // Handler per il logout
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        const repo = getConfigRepository();
        if (repo.logout) {
            repo.logout();
        }
        setToken(null);
        setUsername(null);
        setTasks([]);
        // Ricarica la pagina per resettare tutti gli stati
        window.location.reload();
    };

    // Mostro nascondo testo accanto alle icone
    const [showText, setShowText] = useState(
        getConfigRepository().getShowText()
    );

    const handleShowTextToggle = () => {
        const newValue = !showText;
        setShowText(newValue);
        getConfigRepository().setShowText(newValue);
    };

    // Stato per il tema delle icone
    const [iconTheme, setIconTheme] = useState(
        getConfigRepository().getIconTheme()
    );

    // Funzione per aggiornare il tema
    const handleThemeChange = (theme) => {
        setIconTheme(theme);
        getConfigRepository().setIconTheme(theme);
    };

    // Stato per abilitare/disabilitare il campo data-ora nei task
    const [dateTimeEnabled, setDateTimeEnabledState] = useState(() => {
        getConfigRepository().getDateTimeEnabled();
    });

    const [showExpired, setShowExpiredFeature] = useState(
        getConfigRepository().getShowExpired()
    );

    const [showConfig, setShowConfig] = useState(false);

    useEffect(() => {
        getConfigRepository().setShowExpired(showExpired);
    }, [showExpired]);

    const setDateTimeEnabled = (val) => {
        setDateTimeEnabledState(val);
        getConfigRepository().setDateTimeEnabled(val);
    };

    // Funzione per sincronizzare le configurazioni con l'API
    const syncConfigToAPI = () => {
        const token = localStorage.getItem("simonegentili.com-access-token");
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
        const url = "https://api.simonegentili.com/quadrato/data";
        const options = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader(),
            },
            body: JSON.stringify(allConfig),
        };

        fetch(url, options)
            .then((res) => {
                if (res.status === 401) {
                    setToken(null);
                    throw new Error("Unauthorized");
                }
                return res.json();
            })
            .then((json) => {
                console.log("Configurazioni sincronizzate con API:", json);
            })
            .catch((err) => {
                console.error("Errore sincronizzazione configurazioni:", err);
            });
    };

    // Stato per filtro progetto
    const [projectFilter, setProjectFilterState] = useState(() => {
        return getConfigRepository().getProjectFilter();
    });
    const setProjectFilter = (val) => {
        setProjectFilterState(val);
        getConfigRepository().setProjectFilter(val);
        syncConfigToAPI();
    };

    // Stato per abilitare/disabilitare il raggruppamento per progetto
    const [projectGroupable, setProjectGroupableState] = useState(() => {
        return getConfigRepository().getProjectGroupable();
    });

    const setProjectGroupable = (val) => {
        setProjectGroupableState(val);
        getConfigRepository().setProjectGroupable(val);
        syncConfigToAPI();
    };
    // Stato per abilitare/disabilitare la modifica dei task
    const [editable, setEditableState] = useState(() => {
        return getConfigRepository().getProjectGroupable();
    });

    // Wrapper per aggiornare stato e localStorage
    const setEditable = (val) => {
        setEditableState(val);
        getConfigRepository().setProjectGroupable(val);
    };

    // Stato per i task
    const [tasks, setTasks] = useState(() => {
        return getConfigRepository().getTasks();
    });

    const [ws, setWs] = useState("default");
    // workspaces ora è un array di oggetti workspace (non solo nomi)
    const [workspaces, setWorkspaces] = useState([]);
    const [registeredUsersCount, setRegisteredUsersCount] = useState(null);
    const [workspaceFilter, setWorkspaceFilter] = useState("");
    const [deletingWorkspace, setDeletingWorkspace] = useState(null);
    const [editingWorkspaceNotifications, setEditingWorkspaceNotifications] =
        useState(null);
    const [notifDalle, setNotifDalle] = useState("08:00");
    const [notifAlle, setNotifAlle] = useState("17:00");
    const [notifGiorni, setNotifGiorni] = useState([1, 2, 3, 4, 5, 6, 7]);

    const syncRouteSegment = (index, value) => {
        if (typeof window === "undefined") return;

        const segments = window.location.pathname
            .split("/")
            .filter(Boolean)
            .map((part) => decodeURIComponent(part));

        // Usa un array di almeno (index+1) slot, riempiendo con i valori esistenti
        const next = Array.from(
            { length: Math.max(segments.length, index + 1) },
            (_, i) => segments[i] ?? null
        );

        if (value === null || value === undefined) {
            next[index] = null;
        } else {
            next[index] = value;
        }

        // Rimuovi i null dalla fine, poi filtra i null restanti
        while (next.length > 0 && next[next.length - 1] === null) {
            next.pop();
        }

        const cleanSegments = next.filter((s) => s !== null);

        if (cleanSegments.length === 0) {
            return;
        }

        const nextPathname = `/${cleanSegments.map((part) => encodeURIComponent(part)).join("/")}`;
        const nextUrl = `${nextPathname}${window.location.search}${window.location.hash}`;
        const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

        if (nextUrl !== currentUrl) {
            window.history.replaceState({}, "", nextUrl);
        }
    };

    useEffect(() => {
        if (!ws || token === null) return;
        syncRouteSegment(0, ws);
    }, [ws, token]);

    useEffect(() => {
        if (token === null) return;
        syncRouteSegment(
            1,
            projectFilter && projectFilter !== "ALL" ? projectFilter : null
        );
    }, [projectFilter, token]);

    const [showPopup, setShowPopup] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [zenMode, setZenMode] = useState(() => {
        return getConfigRepository().getZenMode();
    });

    // Sincronizza zenMode con il repository quando cambia
    useEffect(() => {
        getConfigRepository().setZenMode(zenMode);
    }, [zenMode]);

    useEffect(() => {
        const accessToken = localStorage.getItem(
            "simonegentili.com-access-token"
        );
        if (!accessToken) {
            setWorkspaces(["default"]);
            return;
        }

        fetch("https://api.simonegentili.com/quadrato/workspaces", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader(),
            },
        })
            .then((res) => {
                if (res.status === 401) {
                    setToken(null);
                    throw new Error("Unauthorized");
                }
                return res.json();
            })
            .then((json) => {
                const list = Array.isArray(json?.workspaces)
                    ? json.workspaces
                    : [];
                setWorkspaces(list);
                // scorri tutti i workspace e quello che ha come chave current, a true setta ws
                const currentWorkspace = list.find(
                    (workspace) => workspace?.current === true
                );
                if (currentWorkspace && currentWorkspace.name) {
                    setWs(currentWorkspace.name);
                }
            })
            .catch(() => {
                setWorkspaces([]);
            });
    }, [token]);

    useEffect(() => {
        fetch("https://api.simonegentili.com/quadrato/users/count")
            .then((res) => res.json())
            .then((json) => {
                if (typeof json?.count === "number") {
                    setRegisteredUsersCount(json.count);
                }
            })
            .catch(() => {});
    }, []);

    // Funzione per aggiornare la descrizione di un task
    const updateTaskTitle = (
        id,
        value,
        longValue,
        projectValue,
        timestampValue,
        periodicityValue
    ) => {
        let putSent = false;
        setTasks((tasks) => {
            const updated = tasks.map((task) => {
                let newTimestamp = timestampValue ?? task.timestamp;

                if (
                    typeof newTimestamp === "string" &&
                    newTimestamp.length > 0
                ) {
                    newTimestamp = new Date(newTimestamp).getTime();
                }

                const taskObj =
                    task.id === id
                        ? {
                              ...task,
                              title: value,
                              longDescription: longValue,
                              project: projectValue ?? task.project,
                              timestamp: newTimestamp,
                              periodicity:
                                  periodicityValue === undefined
                                      ? task.periodicity
                                      : periodicityValue,
                          }
                        : task;

                return taskObj;
            });

            // A new due date may have to push its parents later, and a parent's own
            // due date can't come before its subtasks': the rules apply before saving,
            // so the edited task is sent once, already with its final due date.
            const reconciled = reconcileAncestors(updated, [id]);
            if (!putSent) {
                putSent = true;
                const edited = reconciled.find((task) => task.id === id);
                fetch(`https://api.simonegentili.com/quadrato/task/${id}`, {
                    method: "PUT",
                    body: JSON.stringify(edited),
                    headers: {
                        "Content-Type": "application/json",
                        ...getAuthHeader(),
                    },
                })
                    .then((res) => {
                        if (res.status === 401) {
                            setToken(null);
                            throw new Error("Unauthorized");
                        }
                        return res.json();
                    })
                    .catch(() => {});
                persistChanges(
                    updated.filter((task) => task.id !== id),
                    reconciled.filter((task) => task.id !== id)
                );
            }
            getConfigRepository().setTasks(reconciled);
            return reconciled;
        });
    };

    // Ricarica tutti i dati quando l'API risponde
    useEffect(() => {
        const repository = getConfigRepository();
        if (repository.onDataLoaded) {
            repository.onDataLoaded(() => {
                console.log(
                    "Dati caricati dall'API, aggiornamento interfaccia...."
                );

                // Aggiorna tutti gli stati con i dati dall'API
                const loadedTasks = repository.getTasks();
                if (loadedTasks && loadedTasks.length > 0) {
                    console.log(
                        "Aggiornamento tasks con dati API:",
                        loadedTasks
                    );
                    setTasks(loadedTasks);
                } else {
                    console.log(
                        "Nessun task caricato dall'API, mantenendo lo stato attuale."
                    );
                }

                // Aggiorna il tema delle icone
                const loadedIconTheme = repository.getIconTheme();
                setIconTheme(loadedIconTheme);
                console.log(
                    "Icon theme aggiornato con dati API:",
                    loadedIconTheme
                );

                // Aggiorna showText
                const loadedShowText = repository.getShowText();
                setShowText(loadedShowText);

                // Aggiorna showExpired
                const loadedShowExpired = repository.getShowExpired();
                setShowExpiredFeature(loadedShowExpired);

                // Aggiorna dateTimeEnabled
                const loadedDateTimeEnabled = repository.getDateTimeEnabled();
                setDateTimeEnabledState(loadedDateTimeEnabled);

                // Aggiorna projectGroupable
                const loadedProjectGroupable = repository.getProjectGroupable();
                setProjectGroupableState(loadedProjectGroupable);
                setEditableState(loadedProjectGroupable);

                // Aggiorna projectFilter
                const loadedProjectFilter = repository.getProjectFilter();
                setProjectFilterState(loadedProjectFilter);

                // Aggiorna zenMode
                const loadedZenMode = repository.getZenMode();
                setZenMode(loadedZenMode);
            });
        }
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === "N") {
                e.preventDefault();
                setShowPopup(true);
            }
            if (e.ctrlKey && e.shiftKey && e.key === "X") {
                e.preventDefault();
                const updatedTasks = archiveCompletedAndSkippedTasks({ tasks });
                persistArchivedTasks({
                    originalTasks: tasks,
                    updatedTasks,
                    token,
                }).then(() => setTasks(updatedTasks));
            }
            if (e.ctrlKey && e.shiftKey && e.key === "H") {
                e.preventDefault();
                setShowHelp(true);
            }
            if (e.ctrlKey && e.shiftKey && e.key === "Z") {
                e.preventDefault();
                // Functional update: this listener is registered once, so zenMode here would be stale.
                setZenMode((current) => !current);
            }
            if (e.key === "Escape") {
                if (showHelp) {
                    setShowHelp(false);
                } else if (showPopup) {
                    setShowPopup(false);
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const accessToken = localStorage.getItem(
            "simonegentili.com-access-token"
        );
        if (!accessToken) return;

        // Ricarica i dati quando cambia il workspace
        getConfigRepository().fetchData((tasks) => setTasks(tasks));
    }, [ws]);

    const SYNCED_FIELDS = ["status", "timestamp", "parentId", "position"];

    // Sends each changed task only the fields that actually changed.
    const persistChanges = (before, after) => {
        const previous = new Map(before.map((task) => [task.id, task]));
        after.forEach((task) => {
            const old = previous.get(task.id);
            if (!old || old === task) return;
            const body = {};
            SYNCED_FIELDS.forEach((field) => {
                if ((old[field] ?? null) !== (task[field] ?? null)) body[field] = task[field] ?? null;
            });
            if (Object.keys(body).length === 0) return;
            fetch(`https://api.simonegentili.com/quadrato/task/${task.id}`, {
                method: "PUT",
                body: JSON.stringify(body),
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeader(),
                },
            })
                .then((res) => {
                    if (res.status === 401) {
                        setToken(null);
                        throw new Error("Unauthorized");
                    }
                })
                .catch(() => {});
        });
    };

    const applyChanges = (updated) => {
        persistChanges(tasks, updated);
        setTasks(updated);
        getConfigRepository().setTasks(updated);
    };

    const handleClick = (id) => {
        const task = tasks.find((t) => t.id === id);
        if (!task) return;
        let status = (task.status + 1) % 4;
        // A parent can't be closed by hand while a subtask is still open:
        // it closes by itself when the last one does.
        if (
            (status === STATUS_ENUM.DONE || status === STATUS_ENUM.SKIPPED) &&
            hasOpenDescendants(tasks, id)
        ) {
            status = STATUS_ENUM.TODO;
        }
        const updated = tasks.map((t) => (t.id === id ? { ...t, status } : t));
        applyChanges(
            reconcileAncestors(updated, task.parentId != null ? [task.parentId] : [])
        );
    };

    // A task moves with its subtasks: it may get a new parent (or none) and new
    // positions among its siblings; both the old and the new parent chains are then
    // brought back in line with their subtasks (completion and due dates).
    const handleMoveTask = (id, parentId, siblingIds) => {
        const oldParentId = tasks.find((t) => t.id === id)?.parentId ?? null;
        const positions = new Map(siblingIds.map((siblingId, index) => [siblingId, index]));
        const moved = tasks.map((task) => {
            let next = task;
            if (task.id === id && (task.parentId ?? null) !== parentId) {
                next = { ...next, parentId };
            }
            if (positions.has(task.id) && !task.timestamp && task.position !== positions.get(task.id)) {
                next = { ...next, position: positions.get(task.id) };
            }
            return next;
        });
        applyChanges(
            reconcileAncestors(moved, [parentId, oldParentId].filter((p) => p != null))
        );
    };

    const handleClearDueDates = (ids) => {
        const cleared = tasks.filter((task) => ids.includes(task.id) && task.timestamp);
        const updated = tasks.map((task) =>
            cleared.includes(task) ? { ...task, timestamp: null } : task
        );
        setTasks(updated);
        getConfigRepository().setTasks(updated);

        cleared.forEach((task) => {
            fetch(`https://api.simonegentili.com/quadrato/task/${task.id}`, {
                method: "PUT",
                body: JSON.stringify({ timestamp: null }),
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeader(),
                },
            })
                .then((res) => {
                    if (res.status === 401) {
                        setToken(null);
                        throw new Error("Unauthorized");
                    }
                })
                .catch(() => {});
        });
    };

    const handleArchiveTasks = async (ids) => {
        const selected = tasks.filter((task) => ids.includes(task.id));
        const processed = archiveCompletedAndSkippedTasks({ tasks: selected });
        await persistArchivedTasks({
            originalTasks: selected,
            updatedTasks: processed,
            token,
        });
        // Reload so archived tasks disappear and periodic renewals get their server ids.
        getConfigRepository().fetchData((tasks) => setTasks(tasks));
    };

    const handleDeleteTasks = (ids) => {
        // A task with subtasks can't be deleted (the API refuses it too).
        const deletable = ids.filter((id) => childrenOf(tasks, id).length === 0);
        const parents = tasks
            .filter((task) => deletable.includes(task.id) && task.parentId != null)
            .map((task) => task.parentId);
        const remaining = tasks.filter((task) => !deletable.includes(task.id));
        const updated = reconcileAncestors(remaining, parents);
        persistChanges(remaining, updated);
        setTasks(updated);
        getConfigRepository().setTasks(updated);

        deletable.forEach((id) => {
            fetch(`https://api.simonegentili.com/quadrato/task/${id}`, {
                method: "DELETE",
                headers: getAuthHeader(),
            })
                .then((res) => {
                    if (res.status === 401) {
                        setToken(null);
                        throw new Error("Unauthorized");
                    }
                })
                .catch(() => {});
        });
    };

    const loadOwnProjects = useCallback(async () => {
        const res = await fetch("https://api.simonegentili.com/quadrato/projects", {
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader(),
            },
        });
        if (res.status === 401) {
            setToken(null);
            return [];
        }
        const json = await res.json();
        return Array.isArray(json?.projects) ? json.projects : [];
    }, [token]);

    const handleChangeProject = async (ids, project, workspaceUuid) => {
        const target = workspaceUuid
            ? workspaces.find((workspace) => workspace?.id === workspaceUuid)
            : null;

        // Into another workspace the subtasks go along, otherwise they'd be left
        // behind under a parent that's no longer here. A task whose parent stays
        // becomes top-level over there.
        const movedIds = target
            ? new Set(ids.flatMap((id) => [id, ...descendantIds(tasks, id)]))
            : new Set(ids);
        const moved = tasks.filter(
            (task) =>
                movedIds.has(task.id) &&
                (target || (task.project ?? "") !== project)
        );
        const updated = target
            ? tasks.filter((task) => !movedIds.has(task.id))
            : tasks.map((task) =>
                  moved.includes(task) ? { ...task, project } : task
              );
        setTasks(updated);
        getConfigRepository().setTasks(updated);

        // One at a time: a new project is created by the first task that names it,
        // parallel requests could each create their own copy.
        for (const task of moved) {
            const body = target
                ? {
                      project,
                      workspace: target.name,
                      workspaceUuid: target.id,
                      ...(task.parentId != null && !movedIds.has(task.parentId)
                          ? { parentId: null }
                          : {}),
                  }
                : { project };
            try {
                const res = await fetch(`https://api.simonegentili.com/quadrato/task/${task.id}`, {
                    method: "PUT",
                    body: JSON.stringify(body),
                    headers: {
                        "Content-Type": "application/json",
                        ...getAuthHeader(),
                    },
                });
                if (res.status === 401) {
                    setToken(null);
                    return;
                }
            } catch {
                // keep going with the other tasks
            }
        }
    };

    // The API renames archived tasks too: here only the loaded ones, the colour and the filter follow.
    const handleRenameProject = async (from, to) => {
        const res = await fetch("https://api.simonegentili.com/quadrato/projects", {
            method: "PATCH",
            body: JSON.stringify({ from, to }),
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
        });
        if (res.status === 401) {
            setToken(null);
            return;
        }
        if (!res.ok) return;

        const updated = tasks.map((task) =>
            task.project === from ? { ...task, project: to } : task
        );
        setTasks(updated);
        getConfigRepository().setTasks(updated);

        const color = getConfigRepository().getProjectColors()[from];
        if (color) getConfigRepository().setProjectColor(to, color);
        if (projectFilter === from) setProjectFilter(to);
    };

    const handleCreateParent = async (ids, title, project, workspaceUuid) => {
        const target = workspaceUuid
            ? workspaces.find((workspace) => workspace?.id === workspaceUuid)
            : null;
        const headers = { "Content-Type": "application/json", ...getAuthHeader() };
        const put = async (id, body) => {
            const res = await fetch(`https://api.simonegentili.com/quadrato/task/${id}`, {
                method: "PUT",
                body: JSON.stringify(body),
                headers,
            });
            if (res.status === 401) setToken(null);
            return res.status !== 401;
        };

        // The API only creates tasks in the current workspace: for another one the
        // parent starts here without a project (so none gets created here) and moves below.
        const created = await fetch("https://api.simonegentili.com/quadrato/task", {
            method: "POST",
            body: JSON.stringify({ title, project: target ? "" : project, status: 0, archived: false }),
            headers,
        });
        if (created.status === 401) {
            setToken(null);
            return;
        }
        const parent = (await created.json())?.task;
        if (!parent?.id) return;

        const oldParentIds = tasks
            .filter((task) => ids.includes(task.id) && task.parentId != null)
            .map((task) => task.parentId);
        const nested = reconcileAncestors(
            [
                ...tasks.map((task) =>
                    ids.includes(task.id)
                        ? { ...task, parentId: parent.id, ...(target ? {} : { project }) }
                        : task
                ),
                parent,
            ],
            [parent.id, ...oldParentIds]
        );

        // Sequential, and before the move: the API checks the parent in the current workspace.
        const before = new Map([...tasks, parent].map((task) => [task.id, task]));
        for (const task of nested) {
            const old = before.get(task.id);
            const body = {};
            ["status", "parentId", "project"].forEach((field) => {
                if ((old?.[field] ?? null) !== (task[field] ?? null)) body[field] = task[field] ?? null;
            });
            if (Object.keys(body).length > 0 && !(await put(task.id, body))) return;
        }

        let updated = nested;
        if (target) {
            const movedIds = new Set([parent.id, ...descendantIds(nested, parent.id)]);
            for (const id of movedIds) {
                if (!(await put(id, { project, workspace: target.name, workspaceUuid: target.id }))) return;
            }
            updated = nested.filter((task) => !movedIds.has(task.id));
        }
        setTasks(updated);
        getConfigRepository().setTasks(updated);
    };

    const handleAddTask = (values) => {
        const newTask = {
            // simulate uuid with timestamp and random number
            id: Date.now() + Math.floor(Math.random() * 1000),
            ...values,
            status: 0,
            archived: false,
        };

        const url = "https://api.simonegentili.com/quadrato/task";
        const options = {
            method: "POST",
            headers: {
                "content-type": "application/json",
                ...getAuthHeader(),
            },
            body: JSON.stringify(newTask),
        };

        fetch(url, options)
            .then((res) => {
                if (res.status === 401) {
                    setToken(null);
                    throw new Error("Unauthorized");
                }
                return res.json();
            })
            .then(() => {
                getConfigRepository().fetchData();
            })
            .catch(() => {});
    };

    const [showCleanConfirm, setShowCleanConfirm] = useState(false);

    const handleCleanTasks = async () => {
        const updatedTasks = archiveCompletedAndSkippedTasks({ tasks });
        await persistArchivedTasks({
            originalTasks: tasks,
            updatedTasks,
            token,
        });
        setTasks(updatedTasks);
        setShowCleanConfirm(false);
        window.location.reload();
    };

    const unarchivedTasks = tasks;

    const visible = (() => {
        // Filtra per progetto
        let filtered =
            projectFilter === "ALL"
                ? unarchivedTasks
                : projectFilter === null
                  ? unarchivedTasks.filter((t) => !t.project)
                  : projectFilter
                    ? unarchivedTasks.filter((t) => t.project === projectFilter)
                    : unarchivedTasks;
        // Filtra per range di giorni
        const now = new Date();
        return filtered.filter((t) => {
            if (!t.timestamp) return true; // task senza scadenza
            // Gestisce sia timestamp numerici che stringhe
            const dt =
                typeof t.timestamp === "number"
                    ? new Date(t.timestamp)
                    : new Date(t.timestamp);
            if (showExpired && dt < now) return true; // mostra scaduti se abilitato
            return dt >= now; // mostra tutti i task futuri
        });
    })();

    const VisibleTasks = (
        <TaskList
            tasks={visible}
            onTaskClick={handleClick}
            updateTaskTitle={updateTaskTitle}
            onReorder={handleMoveTask}
            onClearDueDates={handleClearDueDates}
            onArchive={handleArchiveTasks}
            onDelete={handleDeleteTasks}
            onChangeProject={handleChangeProject}
            onCreateParent={token ? handleCreateParent : undefined}
            loadProjects={token ? loadOwnProjects : undefined}
            currentWorkspace={ws}
            workspaces={workspaces}
            workspaceProjects={getActiveProjects(tasks)}
            editable={editable}
            projectEditable={projectGroupable}
            dateTimeEnabled={dateTimeEnabled}
            iconTheme={iconTheme}
            projectFilter={projectFilter}
        />
    );

    const [showChangeWorkspace, setShowChangeWorkspace] = useState(false);
    const [showWorkspaceMembers, setShowWorkspaceMembers] = useState(false);

    const NewTaskModalView = (
        <TaskModal
            mode="create"
            initialValues={{
                project: projectFilter === "ALL" ? "" : projectFilter,
            }}
            onSave={handleAddTask}
            onClose={() => setShowPopup(false)}
            projectEditable={projectGroupable}
            dateTimeEnabled={dateTimeEnabled}
        />
    );

    if (zenMode) {
        return (
            <div className="app-container">
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        flexWrap: "wrap",
                        gap: "12px",
                    }}
                >
                    <Toggle checked={zenMode} onChange={setZenMode} />
                    {showText && (
                        <span
                            onClick={() => setZenMode(!zenMode)}
                            style={{
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            {t("app.zenMode")}
                        </span>
                    )}
                </div>
                {VisibleTasks}
                {showPopup && NewTaskModalView}
            </div>
        );
    }

    const Header = ({
        activeProjects,
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
        );

        const handleColorChange = (project, color) => {
            const newColors = { ...projectColors, [project]: color };
            setProjectColors(newColors);
            getConfigRepository().setProjectColor(project, color);
        };

        const TogglePanel = () => {
            return (
                <div className="tab">
                    <Toggle
                        checked={projectGroupable}
                        onChange={setProjectGroupable}
                        label={t("app.groupToggle")}
                    />
                    <Toggle
                        checked={dateTimeEnabled}
                        onChange={setDateTimeEnabled}
                        label={t("app.dueDateToggle")}
                    />
                    <Toggle
                        checked={showExpired}
                        onChange={setShowExpired}
                        label={t("app.showExpiredToggle")}
                    />{" "}
                    <Toggle
                        checked={showText}
                        onChange={handleShowTextToggle}
                        label={t("app.showTextToggle")}
                    />
                    <div style={{ marginTop: "1rem" }}>
                        <LanguageSwitcher />
                    </div>
                </div>
            );
        };

        // Palette Modal state
        const [paletteModalProject, setPaletteModalProject] = useState(null);
        const [renamingProject, setRenamingProject] = useState(null);

        const PaletteModal = ({ project, onClose }) => (
            <Modal
                title={t("app.chooseColorTitle")}
                onClick={onClose}
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
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        padding: "12px",
                    }}
                >
                    {Object.entries(Palette24).map(([name, color]) => (
                        <button
                            key={name}
                            style={{
                                width: 32,
                                height: 32,
                                background: color,
                                border: "2px solid #fff",
                                cursor: "pointer",
                                boxShadow: "rgb(8 3 3 ) 0px 4px 20px",
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

        const WorkspacePanel = () => {
            return <>...</>;
        };

        const ProjectPanel = () => {
            if (activeProjects.length === 0) {
                return (
                    <p style={{ marginTop: "24px" }}>
                        {t("app.noActiveProjects")}
                    </p>
                );
            }

            return (
                <div style={{ marginTop: "24px" }}>
                    <ul
                        style={{
                            margin: "8px 0 0 0",
                            padding: 0,
                            listStyle: "none",
                        }}
                    >
                        {activeProjects.map((project, idx) => (
                            <li
                                key={idx}
                                style={{
                                    padding: "2px 0",
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <span style={{ marginRight: "8px", flex: "1" }}>
                                    {String(project)}
                                </span>
                                {token && (
                                    <button
                                        type="button"
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            color: "#5480e6",
                                            marginRight: "8px",
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                        title={t("app.renameProjectButton")}
                                        aria-label={t("app.renameProjectButton")}
                                        onClick={() =>
                                            setRenamingProject(String(project))
                                        }
                                    >
                                        <Icon name="edit" size={18} />
                                    </button>
                                )}
                                <button
                                    style={{
                                        width: 24,
                                        height: 24,
                                        border: "none",
                                        background:
                                            projectColors[String(project)] ||
                                            "#000000",
                                        borderRadius: "50%",
                                        cursor: "pointer",
                                        boxShadow: "0 0 2px #0002",
                                    }}
                                    title={t("app.chooseColorButton")}
                                    onClick={() =>
                                        setPaletteModalProject(project)
                                    }
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            );
        };

        const ThemePanel = () => {
            return (
                <div>
                    <strong>{t("app.iconThemeLabel")}</strong>
                    <div style={{ marginTop: "16px" }}>
                        <Toggle
                            checked={iconTheme === "default"}
                            onChange={() => handleThemeChange("default")}
                            label={t("app.defaultTheme")}
                            icons={getStatusIcons("default")}
                        />
                        <Toggle
                            checked={iconTheme === "checked"}
                            onChange={() => handleThemeChange("checked")}
                            label={t("app.checkedTheme")}
                            icons={getStatusIcons("checked")}
                        />
                        <Toggle
                            checked={iconTheme === "panda"}
                            onChange={() => handleThemeChange("panda")}
                            label={t("app.pandaTheme")}
                            icons={getStatusIcons("panda")}
                        />
                    </div>
                    <strong>{t("app.taskTypeLegendLabel")}</strong>
                    <div
                        style={{
                            marginTop: "16px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            }}
                        >
                            <Icon name="sparkle" style={{ color: "#5480e6" }} />
                            <span>{t("app.featureLabel")}</span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            }}
                        >
                            <Icon name="bug" style={{ color: "#e2727d" }} />
                            <span>{t("app.bugLabel")}</span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            }}
                        >
                            <Icon name="credit-card" style={{ color: "#2e9e5b" }} />
                            <span>{t("app.payLabel")}</span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            }}
                        >
                            <Icon name="books" style={{ color: "#9b6bd1" }} />
                            <span>{t("app.spikeLabel")}</span>
                        </div>
                    </div>
                </div>
            );
        };

        return (
            <>
                <div className="header-bar">
                    <div className="header-icons">
                        <span
                            onClick={() => setShowPopup(true)}
                            style={{ cursor: "pointer" }}
                            aria-label={t("footer.addAria")}
                        >
                            <Icon name="plus" size={24} style={{ color: "#444" }} />
                        </span>
                        {showText && (
                            <span
                                onClick={() => setShowPopup(true)}
                                style={{ cursor: "pointer" }}
                            >
                                {t("footer.addLabel")}
                            </span>
                        )}
                        <span
                            onClick={() => setShowCleanConfirm(true)}
                            style={{ cursor: "pointer" }}
                            aria-label={t("footer.cleanAria")}
                        >
                            <Icon name="x" size={24} style={{ color: "#444" }} />
                        </span>
                        {showText && (
                            <span
                                onClick={() => setShowCleanConfirm(true)}
                                style={{ cursor: "pointer" }}
                            >
                                {t("footer.cleanLabel")}
                            </span>
                        )}
                        <span onClick={() => setShowHelp(true)}>
                            <Icon name="help-circle" size={24} style={{ color: "#7c63c9" }} />
                        </span>
                        {showText && (
                            <span
                                onClick={() => setShowHelp(true)}
                                style={{ cursor: "pointer" }}
                            >
                                {t("app.help")}
                            </span>
                        )}
                        <span
                            onClick={() => setShowConfig(true)}
                            style={{ cursor: "pointer" }}
                        >
                            <Icon name="settings" size={24} style={{ color: "#5480e6" }} />
                        </span>
                        {showText && (
                            <span
                                onClick={() => setShowConfig(true)}
                                style={{ cursor: "pointer" }}
                            >
                                {t("app.config")}
                            </span>
                        )}
                        <Toggle
                            checked={zenMode}
                            onChange={setZenMode}
                            label={""}
                        />
                        {showText && (
                            <span
                                onClick={() => {
                                    setZenMode(!zenMode);
                                    // aggiorna anche il repository
                                    getConfigRepository().setZenMode(!zenMode);
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                {t("app.zenMode")}
                            </span>
                        )}
                    </div>
                </div>
                {/** estrarre un componente modal da questo */}
                {showConfig && (
                    <Modal
                        onClick={() => setShowConfig(false)}
                        title={t("app.settingsTitle")}
                        icon={<Icon name="settings" size={24} style={{ color: "#5480e6" }} />}
                    >
                        <TabbedContent
                            id="settings"
                            panels={[
                                {
                                    content: <TogglePanel />,
                                    title: t("app.generalTab"),
                                },
                                {
                                    content: <ProjectPanel />,
                                    title: t("app.projectsTab"),
                                },
                                {
                                    content: <ThemePanel />,
                                    title: t("app.themesTab"),
                                },
                            ]}
                        />
                        <InfoPanel />
                    </Modal>
                )}
                {/* A sibling of the settings modal, not nested in it: an overlay inside another modal's box isn't reliably visible. */}
                {paletteModalProject && (
                    <PaletteModal
                        project={paletteModalProject}
                        onClose={() => setPaletteModalProject(null)}
                    />
                )}
                {renamingProject !== null && (
                    <RenameProjectModal
                        project={renamingProject}
                        onSave={(name) => handleRenameProject(renamingProject, name)}
                        onClose={() => setRenamingProject(null)}
                    />
                )}
            </>
        );
    };

    const activeProjects = getActiveProjects(tasks);

    const HeaderView = (
        <Header
            activeProjects={activeProjects}
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
    );

    const DefinedTaskProject = (
        <TaskProjectSelector
            projects={activeProjects}
            projectFilter={projectFilter}
            setProjectFilter={setProjectFilter}
        />
    );

    const HelpModalView = (
        <HelpModal showHelp={showHelp} setShowHelp={setShowHelp} />
    );

    const ConfirmModalView = (
        <ConfirmModal
            onClick={() => setShowCleanConfirm(false)}
            setShowCleanConfirm={setShowCleanConfirm}
            handleCleanTasks={handleCleanTasks}
        />
    );

    const LogoutConfirmModalView = (
        <LogoutConfirmModal
            onClick={() => setShowLogoutConfirm(false)}
            onConfirm={confirmLogout}
        />
    );

    const openWorkspaceNotifications = (workspace) => {
        setEditingWorkspaceNotifications(workspace);
        setNotifDalle(workspace.dalle || "08:00");
        setNotifAlle(workspace.alle || "17:00");
        setNotifGiorni(
            Array.isArray(workspace.giorni) && workspace.giorni.length > 0
                ? workspace.giorni
                : [1, 2, 3, 4, 5, 6, 7]
        );
    };

    const toggleNotifGiorno = (day) => {
        setNotifGiorni((prev) =>
            prev.includes(day)
                ? prev.filter((d) => d !== day)
                : [...prev, day].sort((a, b) => a - b)
        );
    };

    const saveWorkspaceNotifications = () => {
        const accessToken = localStorage.getItem(
            "simonegentili.com-access-token"
        );
        if (!accessToken || !editingWorkspaceNotifications?.id) {
            setEditingWorkspaceNotifications(null);
            return;
        }

        fetch(
            `https://api.simonegentili.com/quadrato/workspace/${editingWorkspaceNotifications.id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeader(),
                },
                body: JSON.stringify({
                    dalle: notifDalle,
                    alle: notifAlle,
                    giorni: notifGiorni,
                }),
            }
        )
            .then((res) => {
                if (res.status === 401) {
                    setToken(null);
                    throw new Error("Unauthorized");
                }
                return res.json();
            })
            .then((json) => {
                if (json?.workspace) {
                    setWorkspaces((prev) =>
                        prev.map((w) =>
                            w.id === editingWorkspaceNotifications.id
                                ? { ...w, ...json.workspace }
                                : w
                        )
                    );
                }
                setEditingWorkspaceNotifications(null);
            })
            .catch(() => setEditingWorkspaceNotifications(null));
    };

    const deleteWorkspace = () => {
        const workspace = deletingWorkspace;
        setDeletingWorkspace(null);

        fetch(`https://api.simonegentili.com/quadrato/workspace/${workspace.id}`, {
            method: "DELETE",
            headers: getAuthHeader(),
        })
            .then((res) => {
                if (res.status === 401) {
                    setToken(null);
                    throw new Error("Unauthorized");
                }
                return res.json();
            })
            .then((json) => {
                if (!json?.success) return;
                setWorkspaces((prev) =>
                    prev
                        .filter((w) => w.id !== workspace.id)
                        .map((w) =>
                            w.name === "default"
                                ? {
                                      ...w,
                                      tasks_count:
                                          (w.tasks_count ?? 0) +
                                          json.moved_tasks,
                                  }
                                : w
                        )
                );
                if (ws === workspace.name) {
                    setWs("default");
                } else if (ws === "default") {
                    getConfigRepository().fetchData((tasks) => setTasks(tasks));
                }
            })
            .catch(() => {});
    };

    const DeleteWorkspaceModalView = deletingWorkspace && (
        <Modal
            title={t("app.deleteWorkspaceTitle")}
            onClick={() => setDeletingWorkspace(null)}
            buttons={[
                {
                    label: t("common.cancel"),
                    onClick: () => setDeletingWorkspace(null),
                },
                {
                    label: t("common.confirm"),
                    onClick: deleteWorkspace,
                },
            ]}
        >
            <p>
                {t("app.deleteWorkspaceConfirm", {
                    name: deletingWorkspace.name,
                    count: deletingWorkspace.tasks_count ?? 0,
                })}
            </p>
        </Modal>
    );

    const WorkspaceNotificationsModalView = editingWorkspaceNotifications && (
        <Modal
            title={t("app.workspaceNotificationsTitle", {
                name: editingWorkspaceNotifications.name,
            })}
            onClick={() => setEditingWorkspaceNotifications(null)}
            buttons={[
                {
                    label: t("common.save"),
                    onClick: saveWorkspaceNotifications,
                },
                {
                    label: t("app.deleteWorkspace"),
                    onClick: () => {
                        setDeletingWorkspace(editingWorkspaceNotifications);
                        setEditingWorkspaceNotifications(null);
                    },
                },
                {
                    label: t("common.close"),
                    onClick: () => setEditingWorkspaceNotifications(null),
                },
            ]}
        >
            <div className="modal-input-wrapper">
                <label style={{ display: "block", marginBottom: 4 }}>
                    {t("app.from")}
                </label>
                <input
                    type="time"
                    value={notifDalle}
                    onChange={(e) => setNotifDalle(e.target.value)}
                    className="modal-input"
                />
            </div>
            <div className="modal-input-wrapper">
                <label style={{ display: "block", marginBottom: 4 }}>
                    {t("app.to")}
                </label>
                <input
                    type="time"
                    value={notifAlle}
                    onChange={(e) => setNotifAlle(e.target.value)}
                    className="modal-input"
                />
            </div>
            <div
                className="modal-input-wrapper"
                style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
            >
                {NOTIFICATION_WEEKDAYS.map(({ value, label }) => (
                    <label
                        key={value}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={notifGiorni.includes(value)}
                            onChange={() => toggleNotifGiorno(value)}
                        />
                        {label}
                    </label>
                ))}
            </div>
        </Modal>
    );

    const ChangeWorkspaceModalView = (() => {
        // Il workspace default è sempre in cima, gli altri ordinati per IN_PROGRESS decrescente, poi TODO decrescente
        const sortedWorkspaces = [...workspaces].sort((a, b) => {
            const aIsDefault = a.name === "default";
            const bIsDefault = b.name === "default";
            if (aIsDefault !== bIsDefault) {
                return aIsDefault ? -1 : 1;
            }
            const aInProgress =
                a.tasks_by_status && a.tasks_by_status["IN_PROGRESS"]
                    ? a.tasks_by_status["IN_PROGRESS"]
                    : 0;
            const bInProgress =
                b.tasks_by_status && b.tasks_by_status["IN_PROGRESS"]
                    ? b.tasks_by_status["IN_PROGRESS"]
                    : 0;
            if (aInProgress !== bInProgress) {
                return bInProgress - aInProgress;
            }
            const aTodo =
                a.tasks_by_status && a.tasks_by_status["TODO"]
                    ? a.tasks_by_status["TODO"]
                    : 0;
            const bTodo =
                b.tasks_by_status && b.tasks_by_status["TODO"]
                    ? b.tasks_by_status["TODO"]
                    : 0;
            return bTodo - aTodo;
        });

        const filteredWorkspaces = sortedWorkspaces.filter((workspace) =>
            (workspace?.name || "")
                .toLowerCase()
                .includes(workspaceFilter.trim().toLowerCase())
        );

        return (
            <Modal
                title={t("app.changeWorkspaceTitle")}
                onClick={() => setShowChangeWorkspace(false)}
            >
                <div className="modal-input-wrapper">
                    <input
                        type="text"
                        value={workspaceFilter}
                        onChange={(e) => setWorkspaceFilter(e.target.value)}
                        placeholder={t("app.workspaceNamePlaceholder")}
                        className="modal-input"
                    />
                </div>
                <div className="modal-input-wrapper workspace-buttons">
                    {filteredWorkspaces.map((workspace) => {
                        // Stati da mostrare sempre, anche se 0, inclusi ARCHIVED
                        const allStates = [
                            "TODO",
                            "IN_PROGRESS",
                            "DONE",
                            "SKIPPED",
                            "ARCHIVED",
                        ];
                        const stats = allStates.map((state) => ({
                            state,
                            count:
                                workspace.tasks_by_status &&
                                workspace.tasks_by_status[state]
                                    ? workspace.tasks_by_status[state]
                                    : 0,
                        }));
                        const hasLockOrEdit =
                            workspace.name === "default" ||
                            Boolean(workspace.id);
                        const iconCount =
                            (workspace.shared ? 1 : 0) +
                            (hasLockOrEdit ? 1 : 0);
                        return (
                            <div
                                key={workspace.id || workspace.name}
                                style={{
                                    marginBottom: 8,
                                    display: "flex",
                                    flexDirection: "column",
                                    rowGap: 8,
                                }}
                            >
                                <div style={{ position: "relative" }}>
                                    <button
                                        type="button"
                                        className={`modal-close-btn${workspace.name === ws ? " workspace-current" : ""}`}
                                        style={{
                                            marginBottom: 0,
                                            minWidth: 120,
                                            textAlign: "left",
                                            paddingRight:
                                                iconCount > 0
                                                    ? `${0.75 + iconCount * 1.75}rem`
                                                    : undefined,
                                        }}
                                        onClick={() => {
                                            const accessToken =
                                                localStorage.getItem(
                                                    "simonegentili.com-access-token"
                                                );
                                            if (accessToken) {
                                                fetch(
                                                    "https://api.simonegentili.com/quadrato/workspace/current",
                                                    {
                                                        method: "POST",
                                                        headers: {
                                                            "Content-Type":
                                                                "application/json",
                                                            ...getAuthHeader(),
                                                        },
                                                        body: JSON.stringify({
                                                            name: workspace.name,
                                                        }),
                                                    }
                                                )
                                                    .then(() => {
                                                        setWs(workspace.name);
                                                        setProjectFilter("ALL");
                                                        setWorkspaceFilter("");
                                                        setShowChangeWorkspace(
                                                            false
                                                        );
                                                    })
                                                    .catch(() => {
                                                        setWs(workspace.name);
                                                        setProjectFilter("ALL");
                                                        setWorkspaceFilter("");
                                                        setShowChangeWorkspace(
                                                            false
                                                        );
                                                    });
                                            } else {
                                                setWs(workspace.name);
                                                setProjectFilter("ALL");
                                                setWorkspaceFilter("");
                                                setShowChangeWorkspace(false);
                                            }
                                        }}
                                    >
                                        {workspace.name} (
                                        {/* The tasks in the list: archived ones have their own column. */}
                                        {stats
                                            .filter(({ state }) => state !== "ARCHIVED")
                                            .reduce((sum, { count }) => sum + count, 0)})
                                    </button>
                                    {iconCount > 0 && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                right: 12,
                                                top: 0,
                                                bottom: 0,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                            }}
                                        >
                                            {workspace.shared && (
                                                <div
                                                    title={t(
                                                        "app.sharedWorkspace"
                                                    )}
                                                >
                                                    <Icon name="users" size={24} style={{ color: "#5480e6" }} />
                                                </div>
                                            )}
                                            {workspace.name === "default" ? (
                                                <div
                                                    title={t(
                                                        "app.defaultWorkspaceNoNotifications"
                                                    )}
                                                    style={{
                                                        cursor: "not-allowed",
                                                    }}
                                                >
                                                    <Icon name="lock" size={16} style={{ color: "#7c8aa8" }} />
                                                </div>
                                            ) : (
                                                workspace.id && (
                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openWorkspaceNotifications(
                                                                workspace
                                                            );
                                                        }}
                                                        role="button"
                                                        tabIndex={0}
                                                        title={t(
                                                            "app.notificationSettings"
                                                        )}
                                                        style={{
                                                            cursor: "pointer",
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key ===
                                                                    "Enter" ||
                                                                e.key === " "
                                                            ) {
                                                                openWorkspaceNotifications(
                                                                    workspace
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <Icon name="edit" size={16} style={{ color: "#5480e6" }} />
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div
                                    className="workspace-stats"
                                    style={{
                                        fontSize: "13px",
                                        color: "#444",
                                        marginLeft: 16,
                                        alignItems: "flex-end",
                                        flexWrap: "wrap",
                                        gap: 16,
                                        rowGap: 8,
                                    }}
                                >
                                    {stats.map(({ state, count }) => (
                                        <span
                                            key={state}
                                            style={{
                                                minWidth: 60,
                                                textAlign: "center",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: "11px",
                                                    color: "#888",
                                                    marginBottom: 2,
                                                }}
                                            >
                                                {state}
                                            </span>
                                            <span
                                                style={{
                                                    fontWeight: "bold",
                                                    fontSize: "15px",
                                                }}
                                            >
                                                {count}
                                            </span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                    {filteredWorkspaces.length === 0 &&
                        workspaceFilter.trim().length > 0 && (
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => {
                                    const newWorkspaceName =
                                        workspaceFilter.trim();
                                    const accessToken = localStorage.getItem(
                                        "simonegentili.com-access-token"
                                    );

                                    const finalize = () => {
                                        setWs(newWorkspaceName);
                                        setProjectFilter("ALL");
                                        setWorkspaces((prev) =>
                                            prev.some(
                                                (w) =>
                                                    w.name === newWorkspaceName
                                            )
                                                ? prev
                                                : [
                                                      ...prev,
                                                      {
                                                          name: newWorkspaceName,
                                                      },
                                                  ]
                                        );
                                        setWorkspaceFilter("");
                                        setShowChangeWorkspace(false);
                                    };

                                    if (!accessToken) {
                                        finalize();
                                        return;
                                    }

                                    fetch(
                                        "https://api.simonegentili.com/quadrato/workspaces",
                                        {
                                            method: "POST",
                                            headers: {
                                                "Content-Type":
                                                    "application/json",
                                                ...getAuthHeader(),
                                            },
                                            body: JSON.stringify({
                                                name: newWorkspaceName,
                                            }),
                                        }
                                    )
                                        .then(() => {
                                            // Set as current workspace
                                            return fetch(
                                                "https://api.simonegentili.com/quadrato/workspace/current",
                                                {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type":
                                                            "application/json",
                                                        ...getAuthHeader(),
                                                    },
                                                    body: JSON.stringify({
                                                        name: newWorkspaceName,
                                                    }),
                                                }
                                            );
                                        })
                                        .then(() => finalize())
                                        .catch(() => finalize());
                                }}
                            >
                                {t("app.saveNewWorkspace")}
                            </button>
                        )}
                </div>
            </Modal>
        );
    })();

    const addMemberHandler = () => {
        const emailInput = document.querySelector('.modal-input[type="email"]');
        const email = emailInput ? emailInput.value.trim() : "";
        const accessToken = localStorage.getItem(
            "simonegentili.com-access-token"
        );
        if (!email || !accessToken) {
            return;
        }

        fetch("https://api.simonegentili.com/quadrato/workspace/members", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader(),
            },
            body: JSON.stringify({ workspace: ws, email }),
        })
            .then(() => {
                if (emailInput) {
                    emailInput.value = "";
                }
                setShowWorkspaceMembers(false);
            })
            .catch(() => {
                if (emailInput) {
                    emailInput.value = "";
                }
                setShowWorkspaceMembers(false);
            });
    };

    const WorkspaceMembersModalView = (
        <Modal
            title={t("app.workspaceMembersTitle")}
            onClick={() => setShowWorkspaceMembers(false)}
            buttons={[
                {
                    label: t("app.inviteButton"),
                    onClick: () => addMemberHandler(),
                },
                {
                    label: t("common.close"),
                    onClick: () => setShowWorkspaceMembers(false),
                },
            ]}
        >
            <div className="modal-input-wrapper">
                <input
                    type="email"
                    placeholder={t("app.memberEmailPlaceholder")}
                    className="modal-input"
                />
            </div>
        </Modal>
    );

    const visibleTasks = (() => {
        let filtered =
            projectFilter === "ALL"
                ? unarchivedTasks
                : projectFilter === null
                  ? unarchivedTasks.filter((t) => !t.project)
                  : projectFilter
                    ? unarchivedTasks.filter((t) => t.project === projectFilter)
                    : unarchivedTasks;
        const now = new Date();
        return filtered.filter((t) => {
            if (!t.timestamp) return true;
            // Gestisce sia timestamp numerici che stringhe
            const dt =
                typeof t.timestamp === "number"
                    ? new Date(t.timestamp)
                    : new Date(t.timestamp);
            if (showExpired && dt < now) return true;
            return dt >= now; // mostra tutti i task futuri
        });
    })();

    return (
        <>
            {token && (
                <QuadratoHeader
                    username={username}
                    onLogin={() => navigate("/login")}
                    onLogout={handleLogout}
                />
            )}

            <div className="foo">
                <div className="app-container">
                    <div
                        className="sticky-header"
                        style={{
                            marginBottom: "8px",
                            position: "sticky",
                            top: 0,
                            zIndex: 100,
                            backgroundColor: "white",
                        }}
                    >
                        <div className="workspace-wrapper">
                            <div
                                className="workspaces-container clickable  "
                                onClick={() => setShowChangeWorkspace(true)}
                            >
                                {t("app.workspaceLabel", { name: ws })}
                            </div>
                            {registeredUsersCount !== null && (
                                <div className="registered-users-count">
                                    {t("app.registeredUsersCount", {
                                        count: registeredUsersCount,
                                    })}
                                </div>
                            )}
                            {ws != "default" && (
                                <div
                                    className="workspace-members"
                                    onClick={() =>
                                        setShowWorkspaceMembers(true)
                                    }
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === "Enter" ||
                                            e.key === " "
                                        ) {
                                            setShowWorkspaceMembers(true);
                                        }
                                    }}
                                >
                                    <Icon name="users" size={24} style={{ color: "#5480e6" }} />
                                </div>
                            )}
                            {HeaderView}
                        </div>
                        {projectGroupable && DefinedTaskProject}
                    </div>

                    <ExpiredTasks />

                    <TaskList
                        tasks={visibleTasks}
                        onTaskClick={handleClick}
                        updateTaskTitle={updateTaskTitle}
                        onReorder={handleMoveTask}
                        onClearDueDates={handleClearDueDates}
                        onArchive={handleArchiveTasks}
                        onDelete={handleDeleteTasks}
                        onChangeProject={handleChangeProject}
                        onCreateParent={token ? handleCreateParent : undefined}
                        loadProjects={token ? loadOwnProjects : undefined}
                        currentWorkspace={ws}
                        workspaces={workspaces}
                        workspaceProjects={getActiveProjects(tasks)}
                        editable={editable}
                        projectEditable={projectGroupable}
                        dateTimeEnabled={dateTimeEnabled}
                        iconTheme={iconTheme}
                        projectFilter={projectFilter}
                    />
                    {showHelp && HelpModalView}
                    {showPopup && NewTaskModalView}
                    {showCleanConfirm && ConfirmModalView}
                    {showLogoutConfirm && LogoutConfirmModalView}
                    {showChangeWorkspace && ChangeWorkspaceModalView}
                    {showWorkspaceMembers && WorkspaceMembersModalView}
                    {editingWorkspaceNotifications &&
                        WorkspaceNotificationsModalView}
                    {deletingWorkspace && DeleteWorkspaceModalView}
                </div>
                <SGFooter />
            </div>
        </>
    );
}

export default App;
