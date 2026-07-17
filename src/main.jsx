import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import App from './App.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import LostPasswordPage from './pages/LostPasswordPage.jsx'
import TaskDetailPage from './pages/TaskDetailPage.tsx'
import { Router } from './Router.jsx'
import './App.css'
import { RegisteredRedirectModal } from './components/RegisteredRedirectModal.jsx'
import '../node_modules/@sensorario/sg-components/dist/sg-components.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Router>
            {(currentPath) => {
                if (currentPath === '/lost-password') {
                    return <LostPasswordPage />
                }

                if (currentPath === '/register') {
                    return <RegisterPage />
                }

                if (currentPath === '/login') {
                    return <LoginPage />
                }

                const taskDetailMatch = currentPath.match(/^\/task\/([\w-]+)$/)
                if (taskDetailMatch) {
                    return <TaskDetailPage taskId={taskDetailMatch[1]} />
                }

                if (currentPath === '/registered') {
                    return <RegisteredRedirectModal />
                }

                return <App />
            }}
        </Router>
    </StrictMode>,
)
