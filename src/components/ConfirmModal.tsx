
import React from 'react';
import { Modal } from "./Modal";
import HelpIcon from './HelpIcon';

type ConfirmModalProps = {
    setShowCleanConfirm: (val: boolean) => void;
    handleCleanTasks: () => void;
    onClick: () => void;
};

const ConfirmModal = ({ setShowCleanConfirm, handleCleanTasks, onClick }: ConfirmModalProps) => {
    return <Modal onClick={onClick} title={"Conferma pulizia"} icon={<HelpIcon />}>
        <p>Vuoi davvero archiviare tutti i task completati o skippati?</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button className="modal-close-btn" onClick={() => setShowCleanConfirm(false)}>Annulla</button>
            <button className="modal-close-btn" style={{ background: '#666666', color: '#fff' }} onClick={handleCleanTasks}>Conferma</button>
        </div>
    </Modal>;

}

export default ConfirmModal;