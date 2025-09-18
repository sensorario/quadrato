import React, { useEffect } from 'react';

type ModalProps = {
    children: React.ReactNode;
    title: string;
    icon: React.ReactNode;
    onClick: () => void;
};

export const Modal = ({ children, title, icon, onClick }: ModalProps) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClick();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClick]);

    return <div className="modal-overlay" onClick={onClick}>
        <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="icon">
                    {icon}
                </span>
                <h2 className="title">{title}</h2>
            </div>
            <div className="modal-content">{children}</div>
        </div>
    </div>;
};
