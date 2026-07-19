import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ModalProps = {
    children: React.ReactNode;
    title: string;
    icon?: React.ReactNode;
    onClick: () => void;
    buttons?: { label: string; onClick: () => void }[];
    footer?: React.ReactNode;
};

// Deve combaciare con la durata di .modal-closing / .modal-overlay-closing in App.css
const CLOSE_ANIMATION_MS = 220;

export const Modal = ({ children, title, icon, onClick, buttons, footer }: ModalProps) => {
    const { t } = useTranslation();
    const [closing, setClosing] = useState(false);

    const closeWith = (callback: () => void) => {
        if (closing) return;
        setClosing(true);
        setTimeout(callback, CLOSE_ANIMATION_MS);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeWith(onClick);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClick]);

    return <div
        className={`modal-overlay${closing ? ' modal-overlay-closing' : ''}`}
        onClick={() => closeWith(onClick)}
    >
        <div className={`modal${closing ? ' modal-closing' : ''}`} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {icon && <span className="icon">{icon}</span>}
                <h2 className="title" style={{ flex: 1 }}>{title}</h2>
                <button
                    type="button"
                    className="modal-dismiss-btn"
                    aria-label={t('common.close')}
                    onClick={() => closeWith(onClick)}
                    disabled={closing}
                >
                    &times;
                </button>
            </div>
            <div className="modal-content">{children}</div>
            {buttons && <div className="modal-footer">
                {buttons.map((button, index) => (
                    <button key={index} onClick={() => closeWith(button.onClick)} disabled={closing} className='modal-close-btn'>
                        {button.label}
                    </button>
                ))}
            </div>}
            {footer && <div className="modal-footer">{footer}</div>}
        </div>
    </div>;
};
