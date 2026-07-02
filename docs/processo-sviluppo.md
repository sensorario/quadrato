# Processo di sviluppo — Quadrato (simplanner)

> Documento generato automaticamente il 2026-07-03.

---

## 1. Workflow di sviluppo

### Comandi principali

```bash
npm run dev          # Avvia Vite in development mode (hot reload)
npm run build        # Bumpa patch version + vite build → dist/
npm run lint         # ESLint su tutto il progetto
npm test             # Esegue Jest (run singola)
npm run test:watch   # Jest in watch mode (sviluppo TDD)
```

### Convenzioni di commit

Il progetto usa commit convenzionali con scope (`gocommit.conf.json`):

```
feat(scope): descrizione breve
fix(scope): descrizione breve
```

Scope comuni: `auth`, `tasks`, `config`, `workspaces`, `routing`, `components`, `build`, `tests`, `deploy`.

Il file `generate-changelog.js` automatizza la generazione di `CHANGELOG.md`.

---

## 2. Struttura dei branch

| Branch | Scopo |
|---|---|
| `next` | Branch principale e di default; usato per il deploy |

---

## 3. Versionamento

La versione è gestita in `package.json` (versione corrente: `1.1.48`).

Il comando `npm run build` esegue:
1. `npm version patch --no-git-tag-version` — incrementa la patch (es. `1.1.47` → `1.1.48`)
2. `vite build` — genera il bundle in `dist/`

La versione è accessibile a runtime tramite la variabile `__APP_VERSION__` iniettata da Vite:

```js
// vite.config.js
define: {
  __APP_VERSION__: JSON.stringify(version),
}
```

---

## 4. Testing

### Filosofia

- I test stanno in `tests/` (non colocati), un file per componente/funzione
- Si usano `render`, `screen`, `fireEvent` di `@testing-library/react`
- I mock di `localStorage` sono definiti inline nei singoli file di test
- Le callback props sono mockate con `jest.fn()`

### Naming convention

```
tests/NomeComponente.test.jsx
tests/NomeFunzione.test.tsx
```

### Copertura attuale

| Test file | Cosa testa |
|---|---|
| `archiveCompletedAndSkippedTasks.test.tsx` | Logica archiviazione, task periodici |
| `EditTaskModal.test.jsx` | Rendering modal, interazione form |
| `Footer.test.tsx` | Rendering footer sticky, click pulsanti |
| `FormatDate.test.jsx` | Formattazione date (oggi, domani, anno diverso) |
| `handleAddAnotherModal.test.jsx` | Comportamento toggle "aggiungi altro" |

---

## 5. Cronologia delle versioni

### v1.2 (2025-12-14) — Backend e autenticazione

Principali cambiamenti:
- Introdotto pattern Repository (`AjaxRepository` + `LocalStorageRepository`)
- Aggiunto modal di login
- Restore del filtro giorni nella task list
- Refactoring modal in componente generico `<Modal>`
- Supporto periodicità per i task

### v1.1 (2025-09-15) — Configurazione e UI

Principali cambiamenti:
- `<TabbedContent>` estratto in componente separato
- Palette colori per i progetti (issue #5, #6)
- `<InfoPanel>` nel pannello configurazione
- Zen mode funzionante
- Keyboard shortcuts (`Ctrl+Shift+N/X/H`)
- Tema icone in tempo reale

### Unreleased (verso v1.3)

Principali aggiornamenti in corso:
- Swagger/OpenAPI per le integrazioni
- Nuova gestione localStorage nella autenticazione
- Ricarica pagina dopo archiviazione task
- Task scaduti visibili nella home
- Statistiche workspace
- Routing: progetto incluso nell'URL
- Componente `<LoginForm>` dedicato
- `<ExpiredTasks>` con link a workspace

---

## 6. Convenzioni del codice

### Componenti

| Tipo | Estensione | Dove |
|---|---|---|
| Componenti semplici | `.jsx` | `src/components/` (root) |
| Componenti con TypeScript | `.tsx` | `src/components/` (root) |
| Componenti con sotto-struttura | `index.tsx` | `src/components/NomeComponente/` |

### Tipi

- Si usa `type` (non `interface`) per le Props
- I tipi condivisi tra più componenti stanno in `src/types/commonTypes.ts`
- I tipi locali a un singolo file restano nel file

### Repository

- Accesso sempre tramite `getConfigRepository()` — mai istanziare direttamente
- `AjaxRepository` è un singletone di modulo (istanza esportata)
- `LocalStorageRepository` è mantenuta come alternativa (attivabile da `repositories/index.ts`)

### Stili

- CSS puro, nessun CSS-in-JS
- Stili inline via `React.CSSProperties` per stili dipendenti da stato
- Classi CSS in `App.css` e `style.css` per layout e componenti statici

---

## 7. Flusso dati end-to-end

```
1. Mount App
   └── AjaxRepository costruttore
         ├── legge token da localStorage
         ├── se token → fetchData() → GET /quadrato/data
         │       └── merge dati API in this.data
         │       └── copia in localStorage (cache)
         │       └── chiama onDataLoaded callback
         └── se no token → mostra LoginForm

2. onDataLoaded callback in App.jsx
   └── aggiorna tutti gli useState con i dati dell'API
       (tasks, iconTheme, showText, showExpired, ...)

3. Interazione utente (es. click task)
   └── handleClick(id)
         ├── aggiorna stato React locale
         ├── setTasks → getConfigRepository().setTasks(updated)
         │       └── AjaxRepository.setTasks → this.data[tasks] = ...
         │                                   → syncToServer() (solo se hash cambiato)
         └── PUT /quadrato/task/:id

4. Modifica task via EditTaskModal
   └── updateTaskTitle(id, ...)
         ├── aggiorna stato React
         ├── setTasks → repo.setTasks(updated)
         └── PUT /quadrato/task/:id

5. Archiviazione (Ctrl+Shift+X o click ×)
   └── archiveCompletedAndSkippedTasks({ tasks })
         ├── marca archived=true per DONE e SKIPPED
         ├── crea nuovo task per i periodici DONE
         ├── repo.setTasks(allTasks)
         └── PUT /quadrato/task/:id per ciascun task archiviato
         └── window.location.reload()
```

---

## 8. API endpoints e responsabilità

```
AjaxRepository
├── constructor()
│     └── fetchData()  →  GET  /quadrato/data
├── authenticate()     →  POST /quadrato/authenticate
├── syncToServer()     →  PUT  /quadrato/config
│     (chiamata automatica dopo ogni set*)
└── setAccessToken()   →  fetchData() (ricarica dopo login)

App.jsx (direttamente)
├── handleAddTask()    →  POST /quadrato/task
│                          + fetchData() dopo
├── handleClick()      →  PUT  /quadrato/task/:id
├── updateTaskTitle()  →  PUT  /quadrato/task/:id
├── handleCleanTasks() →  PUT  /quadrato/task/:id (per ogni archiviato)
└── syncConfigToAPI()  →  PUT  /quadrato/data (config completa)
```

---

## 9. Punti di estensione e TODO tecnici noti

I commenti `// @todo` presenti nel codice documentano le aree di miglioramento pianificate:

| Riferimento | Descrizione |
|---|---|
| `@todo #38` | Spostare tipi in file comune |
| `@todo #44` | Estrarre tipo task e fix dateTime → timestamp |
| `@todo #45` | Definire tipo URL |
| Footer.tsx | Estrarre componenti icone `plus-icon` e `clean-icon` |

---

## 10. Sicurezza

- Il token JWT viene salvato in `localStorage` (accessibile a JS) **e** come cookie `HttpOnly`-equivalent con flag `Secure` e `SameSite=Strict` sul dominio `.simonegentili.com`
- Le password non sono mai loggare o salvate localmente
- Il campo password nel `LoginModal` usa `type="password"`
- I link esterni nelle descrizioni dei task usano `rel="noopener noreferrer"` (protezione da tab-napping)
- La serializzazione del HTML nelle descrizioni usa `dangerouslySetInnerHTML` solo per la sostituzione di URL (rischio XSS limitato ai contenuti inseriti dall'utente stesso)
