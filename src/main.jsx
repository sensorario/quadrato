import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import { Router } from './Router.jsx'
import './App.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      {(currentPath) => {
        if (currentPath === '/register') {
          return <RegisterPage />
        }
        return <App />
      }}
    </Router>
  </StrictMode>,
)
