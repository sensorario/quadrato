import React, { useState } from 'react';
import { Modal } from './Modal';

type LoginModalProps = {
    onClose: () => void;
    onLogin: (username: string, password: string) => void;
};

export const LoginModal = ({ onClose, onLogin }: LoginModalProps) => {
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
            title="Autenticazione"
            onClick={onClose}
            buttons={[
                { label: 'Annulla', onClick: onClose },
                { label: 'Login', onClick: handleLogin }
            ]}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                    <label htmlFor="username" style={{ display: 'block', marginBottom: '8px' }}>
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Inserisci username"
                        style={{ width: '100%', padding: '8px' }}
                        autoFocus
                    />
                </div>
                <div>
                    <label htmlFor="password" style={{ display: 'block', marginBottom: '8px' }}>
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Inserisci password"
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
            </div>
        </Modal>
    );
};
