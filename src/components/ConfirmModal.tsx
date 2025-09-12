import { Modal } from "./Modal";

const ConfirmModal = ({ setShowCleanConfirm, handleCleanTasks }) => {
    return <Modal onClose={() => setShowCleanConfirm(false)} title={"Conferma pulizia"}>
        <p>Vuoi davvero archiviare tutti i task completati o skippati?</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button className="modal-close-btn" onClick={() => setShowCleanConfirm(false)}>Annulla</button>
            <button className="modal-close-btn" style={{ background: '#666666', color: '#fff' }} onClick={handleCleanTasks}>Conferma</button>
        </div>
    </Modal>;

}

export default ConfirmModal;