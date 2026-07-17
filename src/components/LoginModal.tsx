import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import { Link } from '../Router';

type LoginModalProps = {
    onClose: () => void;
    onLogin: (username: string, password: string) => void;
};

export const LoginModal = ({ onClose, onLogin }: LoginModalProps) => {
    const { t } = useTranslation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        if (username.trim() && password.trim()) {
            onLogin(username, password);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <Modal
            title={t('loginModal.title')}
            onClick={onClose}
            buttons={[
                { label: t('common.cancel'), onClick: onClose },
                { label: t('loginModal.loginButton'), onClick: handleLogin }
            ]}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                    <label htmlFor="username" style={{ display: 'block', marginBottom: '8px' }}>
                        {t('loginModal.username')}
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={t('loginModal.usernamePlaceholder')}
                        style={{ width: '100%', padding: '8px' }}
                        autoFocus
                    />
                </div>
                <div>
                    <label htmlFor="password" style={{ display: 'block', marginBottom: '8px' }}>
                        {t('loginModal.password')}
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={t('loginModal.passwordPlaceholder')}
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginTop: '8px', textAlign: 'center' }}>
                    <Link
                        to="/register"
                        style={{
                            color: '#007bff',
                            textDecoration: 'none',
                            fontSize: '14px'
                        }}
                    >
                        {t('loginModal.noAccount')}
                    </Link>
                </div>
            </div>
        </Modal>
    );
};
