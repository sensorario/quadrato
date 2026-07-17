import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from './Modal.js'

export const RegisteredRedirectModal = () => {
    const { t } = useTranslation()
    const [secondsLeft, setSecondsLeft] = useState(10)

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            window.location.href = '/';
        }, 10000);

        const intervalId = setInterval(() => {
            setSecondsLeft((s) => Math.max(s - 1, 0))
        }, 1000);

        return () => {
            clearTimeout(timeoutId)
            clearInterval(intervalId)
        }
    }, [])

    return <Modal title={t('registeredModal.title')} onClick={() => { window.location.href = '/' }} buttons={[{ label: t('registeredModal.goHome'), onClick: () => { window.location.href = '/' } }]}>
        <div>
            {t('registeredModal.body', { seconds: secondsLeft })}
        </div>
    </Modal>
}

export default RegisteredRedirectModal
