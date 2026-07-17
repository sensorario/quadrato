import { useTranslation } from "react-i18next";
import { Link } from "../../Router"
import { VersionNumber } from "../VersionNumber";
import PandaLegend from "../PandaLegend";
import LanguageSwitcher from "../LanguageSwitcher";

const LoginForm = ({
    onClick,
    onMouseOver,
    onMouseOut
}: {
    onClick: () => void;
    onMouseOver: () => void;
    onMouseOut: () => void;
}) => {
    const { t } = useTranslation();
    const FREE_FEATURES: string[] = t('loginForm.features', { returnObjects: true }) as unknown as string[];
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
        <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
            <LanguageSwitcher />
        </div>
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
                {t('loginForm.loginButton')}
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
                {t('loginForm.registerButton')}
            </Link>
        </div>
        <PandaLegend />
        <div style={{
            border: '2px solid #28a745',
            borderRadius: '8px',
            padding: '24px 32px',
            maxWidth: '340px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
            <h2 style={{ margin: 0, color: '#28a745', fontSize: '24px' }}>{t('loginForm.freeTitle')}</h2>
            <p style={{ margin: '4px 0 16px', color: '#666', fontSize: '14px' }}>
                {t('loginForm.freeSubtitle')}
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