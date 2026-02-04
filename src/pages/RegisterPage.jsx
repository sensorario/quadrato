import React, { useState } from 'react';
import { Link } from '../Router';
import { Modal } from '../components/Modal';

export const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (email.trim() && email.includes('@')) {
            setIsLoading(true);
            try {
                const response = await fetch('https://api.simonegentili.com/quadrato/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });

                if (response.status === 405) {
                    setModalMessage('Ci sono stati problemi con la registrazione. La funzionalità non è al momento disponibile.');
                    setShowModal(true);
                } else if (response.ok) {
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 10000);

                    let secondsLeft = 10;
                    const intervalId = setInterval(() => {
                        secondsLeft -= 1;
                        setModalMessage(`Registrazione avviata con successo! Controlla la tua email. Verrai reindirizzato alla home page tra ${secondsLeft} secondi.`);
                        setShowModal(true);
                        if (secondsLeft <= 0) {
                            clearInterval(intervalId);
                        }
                    }, 1000);
                } else {
                    try {
                        const data = await response.json();
                        setModalMessage(data.message || 'Si è verificato un errore durante la registrazione.');
                    } catch (jsonError) {
                        setModalMessage(`Errore ${response.status}: ${response.statusText || 'Si è verificato un errore durante la registrazione.'}`);
                    }
                    setShowModal(true);
                }
            } catch (error) {
                console.error('Errore durante la registrazione:', error);
                setModalMessage('Errore di connessione. Riprova più tardi.');
                setShowModal(true);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#f5f5f5'
        }}>
            <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>Registrazione</h1>

            <form onSubmit={handleSubmit} style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                width: '400px',
                maxWidth: '90%'
            }}>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="email" style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#333'
                    }}>
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Inserisci la tua email"
                        required
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '16px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: isLoading ? '#6c757d' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        marginBottom: '15px'
                    }}
                    onMouseOver={(e) => !isLoading && (e.target.style.backgroundColor = '#218838')}
                    onMouseOut={(e) => !isLoading && (e.target.style.backgroundColor = '#28a745')}
                >
                    {isLoading ? 'Invio in corso...' : 'Registrati'}
                </button>

                <Link
                    to="/"
                    style={{
                        display: 'block',
                        textAlign: 'center',
                        padding: '10px',
                        color: '#007bff',
                        textDecoration: 'none',
                        fontSize: '14px'
                    }}
                >
                    Hai già un account? Accedi
                </Link>
            </form>

            {showModal && (
                <Modal
                    title="Registrazione"
                    onClick={() => setShowModal(false)}
                    buttons={[
                        {
                            label: 'Chiudi', onClick: () => {
                                document.location.href = '/';
                            }
                        }
                    ]}
                >
                    <p style={{ fontSize: '16px', color: '#666', margin: '0' }}>
                        {modalMessage}
                    </p>
                </Modal >
            )
            }
        </div >
    );
};

export default RegisterPage;
