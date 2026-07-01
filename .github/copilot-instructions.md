# Copilot Instructions — Quadrato (simplanner)

## Stack tecnico

- **Framework**: React 19 + Vite 7
- **Linguaggi**: JSX per componenti App-level, TSX/TS per componenti e tipi, misto JS/TS nel progetto
- **Test**: Jest 29 + `@testing-library/react`, file di test in `tests/` (non colocati)
- **Stili**: CSS puro (`App.css`, `style.css`), nessun CSS-in-JS
- **Componenti esterni**: `@sensorario/sg-components`

## Struttura cartelle

```
src/
  components/    # Componenti React (.jsx o .tsx)
  functions/     # Funzioni pure con side-effect (es. archivio task)
  handlers/      # Event handler estratti
  pages/         # Pagine (usate da Router.jsx)
  repositories/  # Pattern Repository per l'accesso ai dati
  themes/        # Oggetti di configurazione per temi icone
  types/         # Tipi TypeScript condivisi (commonTypes.ts, Palette24.ts)
  utils/         # Utility pure senza side-effect
tests/           # Test Jest, un file per componente/funzione
```

## Pattern Repository

- `Repository.ts` definisce l'interfaccia `Repository`
- `LocalStorageRepository.ts` e `AjaxRepository.ts` sono le implementazioni
- `repositories/index.ts` esporta `getConfigRepository()` che restituisce l'implementazione attiva
- Usare sempre `getConfigRepository()` per accedere al repository, mai istanziare direttamente

## Tipi principali (`src/types/commonTypes.ts`)

- `Task`: `{ id, title, longDescription?, project?, timestamp?, status, archived?, periodicity? }`
- `Periodicity`: `{ number: string; unit: string }`
- `STATUS_ENUM`: `TODO=0, IN_PROGRESS=1, DONE=2, SKIPPED=3` (definito in `src/utils.tsx`)

## Convenzioni componenti

- Componenti semplici: file `.jsx` nella root di `components/`
- Componenti con logica TypeScript: file `.tsx`
- Componenti con sotto-struttura: cartella dedicata con `index.tsx` (es. `Footer/index.tsx`, `LoginForm/index.tsx`)
- Props tipizzate con `type` (non `interface`) in `commonTypes.ts` quando condivise

## Convenzioni test

- I test stanno in `tests/`, non colocati con i sorgenti
- Usare `@testing-library/react`: `render`, `screen`, `fireEvent`
- Mock di `localStorage` tramite helper locali nel file di test
- Naming: `NomeComponente.test.jsx` o `.test.tsx`
- Usare `jest.fn()` per mock di callback props

## Chiavi localStorage

Prefisso `simplanner-` per tutte le chiavi:
- `simplanner-tasks*` — task (possono avere suffissi per progetto)
- `simplanner-project-colors`, `simplanner-show-text`, `simplanner-icon-theme`
- `simplanner-show-expired`, `simplanner-dateTime-enabled`, `simplanner-zen-mode`
- `simplanner-project-filter`, `simplanner-project-groupable`

## Autenticazione

- Token salvato in `localStorage` con chiave `simonegentili.com-access-token`
- Gestita tramite `onUnauthorized` e `onAuthenticated` callback sul repository
- `AjaxRepository` è il backend attivo (supporta autenticazione)

## Note operative

- `npm run dev` — avvia Vite in development
- `npm test` / `npm run test:watch` — esegue Jest
- `npm run build` — bumpa la patch version e builda con Vite
- Il progetto è pubblicato su GitHub Pages
