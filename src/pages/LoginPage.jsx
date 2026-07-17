import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { navigate } from '../Router'
import { getConfigRepository } from '../repositories'
import { LoginModal } from '../components/LoginModal'
import LoginForm from '../components/LoginForm'
import { SetPasswordModal } from '@sensorario/sg-components'

const LoginPage = () => {
    const { t } = useTranslation()
    const [showCredentials, setShowCredentials] = useState(false)
    const [showSetPasswordModal, setShowSetPasswordModal] = useState(false)

    // Chi è già autenticato non deve vedere la schermata di login
    useEffect(() => {
        if (localStorage.getItem('simonegentili.com-access-token')) {
            navigate('/')
        }
    }, [])

    const handleLogin = (username, password) => {
        getConfigRepository()
            .authenticate(username, password)
            .then(({ isTemporaryPassword }) => {
                if (isTemporaryPassword) {
                    setShowCredentials(false)
                    setShowSetPasswordModal(true)
                } else {
                    navigate('/')
                }
            })
            .catch((err) => {
                alert(t('loginPage.loginFailed', { message: err.message }))
            })
    }

    const handleSetNewPassword = (newPassword) => {
        getConfigRepository()
            .updatePassword(newPassword)
            .then(() => {
                getConfigRepository().logout()
                setShowSetPasswordModal(false)
                window.location.href = '/login'
            })
            .catch((err) => {
                alert(t('loginPage.passwordUpdateFailed', { message: err.message }))
            })
    }

    return (
        <>
            {!showCredentials && (
                <LoginForm
                    onClick={() => setShowCredentials(true)}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                />
            )}
            {showCredentials && (
                <LoginModal
                    onClose={() => setShowCredentials(false)}
                    onLogin={handleLogin}
                />
            )}
            {showSetPasswordModal && (
                <SetPasswordModal
                    open
                    onClose={() => setShowSetPasswordModal(false)}
                    onSubmit={handleSetNewPassword}
                />
            )}
        </>
    )
}

export default LoginPage
