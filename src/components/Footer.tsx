import React from 'react';

type FooterProps = {
    setShowPopup: (show: boolean) => void;
    setShowCleanConfirm: (show: boolean) => void;
    showText: boolean;
};

const Footer = ({ setShowPopup, setShowCleanConfirm, showText }: FooterProps) => {
    return <div className="sticky-footer" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', margin: '24px 0', position: 'sticky', bottom: 0, background: '#fff', padding: '8px 0', borderTop: '1px solid #ddd' }}>
        <button
            className="plus-icon"
            aria-label="Aggiungi nuovo task"
            onClick={() => setShowPopup(true)}
            type="button"
            style={{ border: 'none', background: 'none', padding: 0 }}
        >
            {/* Todo creare componente icona plus */}
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="15" fill="#f0f0f0" stroke="#888" strokeWidth="1" />
                <line x1="16" y1="10" x2="16" y2="22" stroke="#444" strokeWidth="1" />
                <line x1="10" y1="16" x2="22" y2="16" stroke="#444" strokeWidth="1" />
            </svg>
        </button>
        {showText && <span style={{ cursor: "pointer" }} onClick={() => setShowPopup(true)}>
            aggiungi
        </span>}
        <button
            className="clean-icon"
            aria-label="Pulisci task"
            onClick={() => setShowCleanConfirm(true)}
            type="button"
            style={{ border: 'none', background: 'none', padding: 0 }}
        >
            {/* Todo creare componente icona pulisci */}
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="15" fill="#f0f0f0" stroke="#888" strokeWidth="1" />
                <line x1="10" y1="10" x2="22" y2="22" stroke="#444" strokeWidth="1" />
                <line x1="22" y1="10" x2="10" y2="22" stroke="#444" strokeWidth="1" />
            </svg>
        </button>
        {showText && <span style={{ cursor: "pointer" }} onClick={() => setShowCleanConfirm(true)}>
            archivia
        </span>}
    </div>
};

export default Footer;