
import React from 'react';
import { Modal } from "./Modal";
import HelpIcon from './HelpIcon';

type ConfirmModalProps = {
    setShowCleanConfirm: (val: boolean) => void;
    handleCleanTasks: () => void;
    onClick: () => void;
};

const ConfirmModal = ({ setShowCleanConfirm, handleCleanTasks, onClick }: ConfirmModalProps) => {
    return <Modal onClick={onClick} title={"Conferma pulizia"} icon={<HelpIcon />} buttons={[
        { label: "Annulla", onClick: () => setShowCleanConfirm(false) },
        { label: "Conferma", onClick: handleCleanTasks }
    ]}>
        <p>Vuoi davvero archiviare tutti i task completati o skippati?</p>
    </Modal>;

}

export default ConfirmModal;