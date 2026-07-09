import { Link } from "../../Router"
import { VersionNumber } from "../VersionNumber";

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
    </div>
}

export default LoginForm;