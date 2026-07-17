import { Link } from "../../Router"
import { VersionNumber } from "../VersionNumber";
import DemoTaskList from "../DemoTaskList";

const FREE_FEATURES = [
    'Task illimitati: crea, modifica ed elimina senza limiti',
    'Task periodici e ricorrenti',
    'Gestione progetti con filtri e colori personalizzati',
    'Workspace multipli e condivisibili con altri utenti',
    'Notifiche configurabili per workspace',
    'Modalità zen per la concentrazione',
    'Temi icone personalizzabili',
    'Scorciatoie da tastiera',
]

const LoginForm = ({
    onClick,
    onMouseOver,
    onMouseOut
}: {
    onClick: () => void;
    onMouseOver: () => void;
    onMouseOut: () => void;
}) => {
    return <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '30px',
        overflowY: 'auto',
        padding: '30px 0',
        zIndex: 10000
    }}>
        <h1 style={{ fontSize: '48px', color: '#333' }}>Quadrato</h1>
        <div style={{ display: 'flex', gap: '20px' }}>
            <button
                onClick={onClick}
                style={{
                    padding: '12px 24px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                }}
                onMouseOver={onMouseOver}
                onMouseOut={onMouseOut}
            >
                Login
            </button>
            <Link
                to="/register"
                style={{
                    padding: '12px 24px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    display: 'inline-block'
                }}
            >
                Registrati
            </Link>
        </div>
        <DemoTaskList />
        <div style={{
            border: '2px solid #28a745',
            borderRadius: '8px',
            padding: '24px 32px',
            maxWidth: '340px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
            <h2 style={{ margin: 0, color: '#28a745', fontSize: '24px' }}>Free</h2>
            <p style={{ margin: '4px 0 16px', color: '#666', fontSize: '14px' }}>
                Tutte le funzionalità, senza costi
            </p>
            <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                {FREE_FEATURES.map((feature) => (
                    <li key={feature} style={{ fontSize: '14px', color: '#333' }}>
                        ✓ {feature}
                    </li>
                ))}
            </ul>
        </div>
    </div>
}

export default LoginForm;