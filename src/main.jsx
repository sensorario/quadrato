import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import { Router } from './Router.jsx'
import './App.css'
import { Modal } from './components/Modal.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      {(currentPath) => {
        if (currentPath === '/register') {
          return <RegisterPage />
        }

        if (currentPath === '/registered') {
          // tra 10 secondi reindirizza alla home
          setTimeout(() => {
            window.location.href = '/';
          }, 10000);

          // modifica il messaggio ogni secondo
          let secondsLeft = 10;
          const intervalId = setInterval(() => {
            secondsLeft -= 1;
            if (secondsLeft <= 0) {
              clearInterval(intervalId);
            }
          }, 1000);

          return <Modal title="Registrazione avvenuta con successo!" onClick={() => { window.location.href = '/' }} buttons={[{ label: 'Vai alla home', onClick: () => { window.location.href = '/' } }]}>
            <div>
              La registrazione è completata con successo! Controlla la tua email per ulteriori istruzioni.
              Tra {secondsLeft} secondi verrai reindirizzato automaticamente alla home page.
            </div>
          </Modal>
        }

        return <App />
      }}
    </Router>
  </StrictMode>,
)
