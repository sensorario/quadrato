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

// Deve combaciare con la durata di .modal-closing / .modal-backdrop-closing in App.css
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

    // Not sg-components' class names (modal-overlay, modal-header, modal-content, modal-footer):
    // its stylesheet styles those for its own dialog and would leak into this one, e.g. the
    // body's overflow: hidden, which kept long content from scrolling.
    return <div
        className={`modal-backdrop${closing ? ' modal-backdrop-closing' : ''}`}
        onClick={() => closeWith(onClick)}
    >
        <div className={`modal${closing ? ' modal-closing' : ''}`} onClick={e => e.stopPropagation()}>
            <div className="modal-head" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
            <div className="modal-body">{children}</div>
            {buttons && <div className="modal-foot">
                {buttons.map((button, index) => (
                    <button key={index} onClick={() => closeWith(button.onClick)} disabled={closing} className='modal-close-btn'>
                        {button.label}
                    </button>
                ))}
            </div>}
            {footer && <div className="modal-foot">{footer}</div>}
        </div>
    </div>;
};
