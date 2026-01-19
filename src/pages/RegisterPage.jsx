import React, { useState } from 'react';
import { Link } from '../Router';
import { Modal } from '../components/Modal';

export const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [showModal, setShowModal] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email.trim() && email.includes('@')) {
            setShowModal(true);
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
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        marginBottom: '15px'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                >
                    Registrati
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
                    title="Ci stiamo lavorando"
                    onClick={() => setShowModal(false)}
                    buttons={[
                        { label: 'Annulla', onClick: () => setShowModal(false) }
                    ]}
                >
                    <p style={{ fontSize: '16px', color: '#666', margin: '0' }}>
                        La funzionalità di registrazione sarà presto disponibile!
                    </p>
                </Modal>
            )}
        </div>
    );
};

export default RegisterPage;
