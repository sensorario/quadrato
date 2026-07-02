# Analisi Architetturale — Quadrato (simplanner)

> Documento generato automaticamente il 2026-07-03.  
> Versione corrente del progetto: **1.1.48**

---

## 1. Panoramica generale

**Quadrato** (nome interno del pacchetto: `simplanner`) è una Single Page Application (SPA) per la gestione di task personali o di team. È pubblicata su GitHub Pages all'indirizzo `https://quadrato.simonegentili.com` e utilizza un backend REST remoto all'indirizzo `https://api.simonegentili.com`.

### Stack tecnologico

| Layer | Tecnologia |
|---|---|
| Framework UI | React 19 + JSX/TSX |
| Build tool | Vite 7 |
| Linguaggi | JSX (App-level), TSX/TS (componenti e tipi) |
| Testing | Jest 29 + `@testing-library/react` |
| Stili | CSS puro (`App.css`, `style.css`) |
| Componenti esterni | `@sensorario/sg-components` |
| Deploy | GitHub Pages (branch `next`) |

---

## 2. Struttura delle cartelle

```
src/
  App.jsx               # Componente radice: stato globale e orchestrazione
  main.jsx              # Entry point React
  Router.jsx            # Router custom senza librerie esterne
  utils.tsx             # STATUS_ENUM e getStatusIcons()
  App.css               # Stili principali
  components/           # Componenti React riutilizzabili
  functions/            # Funzioni con side-effect (accesso al repository)
  handlers/             # Event handler estratti (attualmente vuota)
  pages/                # Pagine gestite dal Router
  repositories/         # Pattern Repository per l'accesso ai dati
  themes/               # Configurazioni grafiche degli stati task
  types/                # Tipi TypeScript condivisi
  utils/                # Utility pure senza side-effect
tests/                  # File di test Jest (non colocati con i sorgenti)
```

---

## 3. Architettura a strati

```
┌─────────────────────────────────────────────────┐
│                     UI Layer                    │
│  App.jsx  →  Router  →  Pages  →  Components   │
├─────────────────────────────────────────────────┤
│                  Domain Layer                   │
│  types/commonTypes.ts  ·  utils.tsx             │
│  utils/  ·  functions/  ·  themes/              │
├─────────────────────────────────────────────────┤
│                 Repository Layer                │
│  Repository (interface)                         │
│  AjaxRepository  ·  LocalStorageRepository      │
│  repositories/index.ts  →  getConfigRepository()│
├─────────────────────────────────────────────────┤
│                   Data Layer                    │
│  localStorage (cache)                           │
│  REST API  https://api.simonegentili.com        │
└─────────────────────────────────────────────────┘
```

---

## 4. Il Router

**File:** `src/Router.jsx`

Il router è implementato senza librerie esterne (no React Router). Utilizza le API native del browser:

- `window.history.pushState()` per la navigazione programmatica
- `PopStateEvent` per notificare il cambio di pagina
- Il componente `<Router>` accetta una funzione `children(currentPath)` (render-prop pattern)

### Rotte gestite

| Pattern | Componente |
|---|---|
| `/register` | `RegisterPage` |
| `/task/:id` | `TaskDetailPage` |
| `/:workspace/:project?` | `App` (con `TaskList`) |
| `*` | Fallback → `App` |

### URL structure

L'URL riflette lo stato dell'applicazione in tempo reale:
- `/{workspace}` — workspace corrente
- `/{workspace}/{progetto}` — filtro per progetto attivo

`App.jsx` usa `syncRouteSegment(index, value)` via `window.history.replaceState()` per mantenere l'URL sincronizzato con lo stato React senza push navigation.

---

## 5. Pattern Repository

**File:** `src/repositories/`

### Interfaccia `Repository`

Definita in `Repository.ts`, espone metodi per:
- **Configurazioni UI**: `getShowText/setShowText`, `getIconTheme/setIconTheme`, `getZenMode/setZenMode`, `getShowExpired/setShowExpired`, `getDateTimeEnabled/setDateTimeEnabled`
- **Task**: `getTasks/setTasks`, `getAllProjects`
- **Colori progetto**: `getProjectColors`, `setProjectColor`, `removeProjectColor`
- **Filtri**: `getProjectFilter/setProjectFilter`, `getProjectGroupable/setProjectGroupable`
- **UI state**: `getActiveTab/setActiveTab`
- **Auth**: `onUnauthorized`, `onAuthenticated`, `logout`

### Implementazioni

#### `AjaxRepository` (attiva)
- Recupera tutti i dati da `GET /quadrato/data` al mount
- Sincronizza i cambiamenti locali via `PUT /quadrato/config`
- Aggiorna singoli task via `PUT /quadrato/task/:id`
- Gestisce autenticazione: token JWT salvato in `localStorage` e cookie di dominio `.simonegentili.com`
- Implementa hash-diff per evitare sync inutili (`calculateHash / hasDataChanged`)
- Notifica il componente padre tramite callback `onDataLoaded`, `onUnauthorized`, `onAuthenticated`
- Usa `localStorage` come cache offline (tutte le chiavi `simplanner-*`)

#### `LocalStorageRepository` (disabilitata)
- Legge e scrive direttamente da/su `localStorage`
- Nessuna autenticazione richiesta
- Supporta multi-chiave: scansiona tutte le chiavi `simplanner-tasks*` per `getAllProjects()`

### Selezione implementazione

```ts
// src/repositories/index.ts
import AjaxRepository from './AjaxRepository';

export function getConfigRepository() {
    return AjaxRepository; // singletone di modulo
}
```

---

## 6. Chiavi localStorage

| Chiave | Tipo | Descrizione |
|---|---|---|
| `simplanner-tasks` | `Task[]` (JSON) | Lista task (cache locale) |
| `simplanner-project-colors` | `Record<string,string>` | Colori associati ai progetti |
| `simplanner-show-text` | `boolean` | Mostrare testo accanto alle icone |
| `simplanner-icon-theme` | `string` | Tema icone: `default`, `checked`, `panda` |
| `simplanner-show-expired` | `boolean` | Mostrare task scaduti |
| `simplanner-dateTime-enabled` | `boolean` | Abilitare campo data/ora |
| `simplanner-zen-mode` | `boolean` | Modalità zen (interfaccia minimalista) |
| `simplanner-project-filter` | `string\|null` | Filtro progetto attivo |
| `simplanner-project-groupable` | `boolean` | Raggruppamento per progetto |
| `simplanner-config-tab` | `string` | Tab attiva nel pannello configurazione |
| `simonegentili.com-access-token` | `string` | JWT di autenticazione |

---

## 7. Tipi principali (`src/types/commonTypes.ts`)

```ts
type Periodicity = { number: string; unit: string };

type Task = {
    id: number;
    title: string;
    longDescription?: string;
    project?: string;
    timestamp?: string | number;    // milliseconds epoch o ISO string
    status: number;                 // STATUS_ENUM
    archived?: boolean;
    periodicity?: Periodicity;
};
```

### Enumerazione stati task (`src/utils.tsx`)

```ts
enum STATUS_ENUM {
    TODO = 0,
    IN_PROGRESS = 1,
    DONE = 2,
    SKIPPED = 3
}
```

Il ciclo di vita di un task è circolare: ogni click su un task avanza lo stato `(status + 1) % 4`.

---

## 8. Componenti UI

### `App.jsx` — Componente radice

È il centro dell'applicazione. Gestisce tutto lo stato globale con `useState`/`useEffect`:

**Stato gestito:**
- `token` — JWT di autenticazione
- `tasks` — lista completa dei task
- `projectFilter` — filtro progetto attivo (`null` = senza progetto, `'ALL'` = tutti)
- `projectGroupable` — mostrare/nascondere il raggruppamento
- `editable` — abilitare la modifica inline
- `dateTimeEnabled` — abilitare le scadenze
- `showExpired` — mostrare task scaduti
- `showText` — testo accanto alle icone
- `iconTheme` — tema icone (`default|checked|panda`)
- `zenMode` — modalità zen
- `ws` + `workspaces` — workspace corrente e lista workspace
- `showPopup`, `showHelp`, `showCleanConfirm` — visibilità modal

**Logica di business integrata:**
- `handleClick(id)` — cicla lo stato del task e invia `PUT /task/:id`
- `handleAddTask()` — crea un nuovo task via `POST /quadrato/task`
- `handleCleanTasks()` — archivia task completati/skippati via `PUT /task/:id` per ciascuno
- `updateTaskTitle(id, ...)` — aggiorna titolo/descrizione/progetto/scadenza di un task
- `syncConfigToAPI()` — invia `PUT /quadrato/data` con tutta la configurazione corrente
- `syncRouteSegment(index, value)` — aggiorna l'URL senza navigazione

**Keyboard shortcuts:**
| Combinazione | Azione |
|---|---|
| `Ctrl+Shift+N` | Apre il popup nuovo task |
| `Ctrl+Shift+X` | Archivia task completati e skippati |
| `Ctrl+Shift+H` | Apre l'help |
| `Esc` | Chiude modal aperti |

---

### `TaskList.tsx`

Renderizza la lista dei task visibili. Responsabilità:
- Filtra i task archiviati
- Ordina per scadenza (task con data prima, poi senza data)
- Gestisce l'hover e il click inline per l'editing
- Mostra stato task tramite icone SVG (tema configurabile)
- Mostra scadenza tramite `<FormatDate>`
- Mostra colore progetto (quadratino SVG colorato)
- Apre `<EditTaskModal>` per la modifica
- Naviga a `/task/:id` per il dettaglio

---

### `EditTaskModal.jsx`

Modal a tab per la modifica di un task esistente. Struttura:
- **Tab "Cosa"**: titolo breve + descrizione lunga (textarea auto-resize)
- **Tab "Quando"** (se `dateTimeEnabled`): periodicità + scadenza con shortcut rapide (+1g, +2g, domani, settimana prossima, mese prossimo)
- **Tab "Dove"** (se `projectEditable`): selezione o inserimento del progetto

---

### `Modal.tsx`

Componente generico per overlay modal. Caratteristiche:
- Backdrop click → chiudi
- `Escape` key → chiudi
- Slot per `title`, `icon`, `children`, `buttons` (array di `{ label, onClick }`)

---

### `TabbedContent.tsx`

Sistema di tab riutilizzabile. Persiste il tab attivo nel repository (`getActiveTab/setActiveTab`). Accetta `panels: { title, content }[]`.

---

### `FormatDate.tsx`

Formatta una data relativa al giorno corrente:
- Stessa giornata → `HH:MM`
- Domani → `domani`
- Stesso anno → `DD/MM`
- Anno diverso → `DD/MM/YYYY`

Accetta un parametro opzionale `systemDate` per facilitare i test.

---

### `TaskProjectSelector.tsx`

Barra di navigazione per filtro progetto. Mostra:
- "tutti i task" (filter = `'ALL'`)
- "nessun progetto" (filter = `null`)
- Un link per ogni progetto unico trovato nei task non archiviati

Mostra anche il numero di versione dell'app (da `package.json`).

---

### `ExpiredTasks.jsx`

Recupera i task scaduti da `GET /quadrato/workspaces` (campo `expired_tasks`). Mostra:
- Lista task scaduti con nome workspace (cliccabile per cambiare workspace)
- Link al dettaglio del task

Usa un `setTimeout(1000)` come debounce prima della fetch.

---

### `Footer.tsx` (sticky)

Barra fissa in basso con:
- Pulsante **+** → apre modal nuovo task
- Pulsante **×** → apre modal conferma archiviazione

---

### `Footer/index.tsx` (wrapper)

Wrapper generico di layout per il footer di un modal (`display: flex, justify-content: right`).

---

### `ConfirmModal.tsx`

Modal di conferma per l'archiviazione di task completati/skippati. Pulsanti: "Annulla" e "Conferma".

---

### `HelpModal.tsx`

Modal di aiuto con tre tab:
- **Colori**: spiegazione dei colori (nero = normale, rosso = scaduto)
- **Shortcuts**: elenco keyboard shortcuts
- **Legenda**: significato delle icone panda per ogni stato

---

### `LoginForm/index.tsx`

Pagina di benvenuto a schermo intero (z-index: 10000). Mostra:
- Titolo "Quadrato"
- Pulsante "Login" → apre `LoginModal`
- Link "Registrati" → naviga a `/register`
- Numero di versione

---

### `LoginModal.tsx`

Modal con form username + password. Invia le credenziali via `AjaxRepository.authenticate()`. Link a `/register` per i nuovi utenti.

---

### `Toggle.jsx`

Componente toggle switch riutilizzabile. Props: `checked`, `onChange`, `label`, `icons` (opzionale, array di nodi React da mostrare accanto al toggle).

---

### `VersionNumber.tsx`

Legge la versione dalla variabile globale `__APP_VERSION__` iniettata da Vite al momento del build. Espone sia il componente `<VersionNumber />` che il hook `useVersionNumber()`.

---

### `InfoPanel.tsx`

Pannello informativo con versione, autore (`sensorario`) e link al repository GitHub.

---

### `GearIcon.jsx`, `HelpIcon.tsx`, `EditIcon.jsx`, `LogoIcon.jsx`, `PlayIcon.tsx`, `UsersIcon.tsx`

Icone SVG inline. Sono componenti puri senza logica.

---

## 9. Pagine

### `TaskDetailPage.tsx`

Pagina di dettaglio per un singolo task. Mostra tutti i campi del task (titolo, stato, progetto, scadenza, periodicità, descrizione lunga, ID).

Caratteristiche notevoli:
- Recupera il task prima tramite `repo.onDataLoaded()` (via API), poi con fallback diretto su `localStorage`
- Identificazione del task per `id` o `uuid` (flessibile)
- Componente `<Breadcrumb>` per la navigazione indietro (workspace → progetto → dettaglio)
- Supporta la navigazione back sia per workspace che per progetto

### `RegisterPage.jsx`

Pagina di registrazione. Invia `POST /quadrato/register` con l'email dell'utente (che diventa anche username). Gestisce i feedback con un `Modal` e redirige alla home dopo 10 secondi in caso di successo.

---

## 10. Temi icone

Il tema delle icone è configurabile globalmente. Tre opzioni disponibili:

| Tema | Descrizione |
|---|---|
| `default` | Quadrati SVG: vuoto=TODO, punto=IN_PROGRESS, X=DONE, pieno=SKIPPED |
| `checked` | Come default ma DONE mostra una spunta verde |
| `panda` | Facce panda: vuoto=TODO, naso=IN_PROGRESS, occhi+naso=DONE, pieno=SKIPPED |

La selezione avviene tramite `getStatusIcons(theme)` in `utils.tsx`, che restituisce un array indicizzato per `STATUS_ENUM`.

---

## 11. Funzioni e utility

### `archiveCompletedAndSkippedTasks` (`src/functions/`)

Archivia i task `DONE` e `SKIPPED`. Logica speciale per task con periodicità:
- Se un task `DONE` ha `periodicity` + `timestamp`, viene creato un nuovo task con:
  - Nuovo `id` (`Date.now() + random`)
  - `status = TODO`
  - Nuova scadenza calcolata dalla data corrente (non dall'ultima scadenza)
  - Unità supportate: `minuti`, `giorni`, `settimane`, `mesi`, `anni`

### `sortByDate` (`src/utils/filterTaskByVisibilityRange.tsx`)

Ordina i task mettendo prima quelli con scadenza (ordinati cronologicamente), poi quelli senza scadenza. Gestisce sia timestamp numerici che stringhe ISO.

### `handleAddAnotherModal` (`src/utils/handleAddAnotherModal.tsx`)

Gestisce il comportamento del toggle "Aggiungi un altro task" nel modal di creazione:
- Se `addAnother = false`: chiude il popup e resetta il titolo
- Se `addAnother = true`: mantiene il popup aperto e resetta solo il titolo

---

## 12. API REST

Base URL: `https://api.simonegentili.com`

| Metodo | Endpoint | Descrizione |
|---|---|---|
| `POST` | `/quadrato/authenticate` | Login con `{ username, password }` → ritorna `{ token }` |
| `POST` | `/quadrato/register` | Registrazione con `{ email }` |
| `GET` | `/quadrato/data` | Recupera tutta la configurazione e i task |
| `PUT` | `/quadrato/data` | Aggiorna tutta la configurazione |
| `PUT` | `/quadrato/config` | Aggiorna solo la configurazione (senza task) |
| `POST` | `/quadrato/task` | Crea un nuovo task |
| `PUT` | `/quadrato/task/:id` | Aggiorna un task esistente |
| `GET` | `/quadrato/workspaces` | Lista workspace + task scaduti (`expired_tasks`) |
| `POST` | `/quadrato/workspace/current` | Imposta il workspace corrente |

**Autenticazione:** Header `Authorization: <token>` (JWT senza prefisso `Bearer`).

---

## 13. Autenticazione e flusso di login

```
Utente apre l'app
        │
        ▼
localStorage ha token?
    ├── SÌ → AjaxRepository.fetchData() → carica dati
    └── NO → mostra <LoginForm>
                    │
                    ├── click "Login" → <LoginModal> → authenticate(user, pass)
                    │                       │
                    │                       └── POST /authenticate
                    │                               │
                    │                       token salvato in localStorage
                    │                       + cookie .simonegentili.com
                    │                       + onAuthenticated callback
                    │                               │
                    └── click "Registrati" → /register → <RegisterPage>
```

Il logout:
1. Chiede conferma tramite `window.confirm()`
2. Chiama `repo.logout()` (rimuove token da localStorage e cookie)
3. Resetta `tasks` a `[]`
4. Ricarica la pagina

---

## 14. Gestione workspace

I workspace sono contesti separati per i task. L'utente autenticato può avere più workspace.

- La lista viene caricata da `GET /quadrato/workspaces` al mount (solo se autenticato)
- Il workspace corrente viene determinato dal campo `current: true` nella risposta
- Il nome del workspace è il primo segmento dell'URL: `/{workspace}`
- Il cambio workspace ricarica i dati tramite `AjaxRepository.fetchData()`
- Esiste un pannello per aggiungere membri a un workspace

---

## 15. Filtraggio e visibilità dei task

La variabile `visible` in `App.jsx` applica in sequenza:

1. **Filtro per progetto** (`projectFilter`):
   - `'ALL'` → tutti i task
   - `null` → solo task senza progetto
   - `'NomeProgetto'` → solo task di quel progetto

2. **Filtro temporale** (se `dateTimeEnabled`):
   - Task senza scadenza → sempre visibili
   - Task con scadenza futura → visibili
   - Task scaduti → visibili solo se `showExpired = true`

3. **Filtro archiviati**: `TaskList` filtra ulteriormente i task `archived = true`

---

## 16. Zen Mode

In zen mode l'interfaccia è ridotta al minimo:
- Nasconde `Header` (configurazione, selettore progetto, workspace)
- Mostra solo il toggle zen mode, la `TaskList` e il `Modal` nuovo task
- Lo stato viene persistito nel repository

---

## 17. Pipeline di test

**Framework:** Jest 29 + `@testing-library/react`  
**Configurazione:** `jest.config.cjs`, `jest.setup.js`, `setupTests.cjs`  
**Mock:** `__mocks__/styleMock.js` per i file CSS

### File di test esistenti

| File | Componente/funzione testata |
|---|---|
| `tests/archiveCompletedAndSkippedTasks.test.tsx` | `archiveCompletedAndSkippedTasks` |
| `tests/EditTaskModal.test.jsx` | `EditTaskModal` |
| `tests/Footer.test.tsx` | `Footer` (sticky) |
| `tests/FormatDate.test.jsx` | `FormatDate` |
| `tests/handleAddAnotherModal.test.jsx` | `handleAddAnotherModal` |

### Comandi

```bash
npm test              # esegue tutti i test
npm run test:watch    # watch mode
```

---

## 18. Build e deploy

```bash
npm run dev     # Vite dev server
npm run build   # bumpa patch version + vite build
npm run lint    # ESLint
```

Il build bumpa automaticamente la patch version in `package.json` via `npm version patch --no-git-tag-version`. La versione viene iniettata nel bundle come `__APP_VERSION__` tramite la configurazione `define` di Vite (`vite.config.js`).

Il deploy avviene su GitHub Pages (branch `next` → homepage `https://sensorario.github.io/quadrato`).

---

## 19. Swagger / OpenAPI

**File:** `swagger.yaml`

Documentazione API disponibile per le integrazioni esterne, aggiunta nella versione unreleased (2026-06-17).
