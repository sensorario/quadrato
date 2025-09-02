const ConfirmModal = ({ setShowCleanConfirm, handleCleanTasks }) => {
    return <div className="modal-overlay" onClick={() => setShowCleanConfirm(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Conferma pulizia</h2>
            <p>Vuoi davvero archiviare tutti i task completati o skippati?</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                <button className="modal-close-btn" onClick={() => setShowCleanConfirm(false)}>Annulla</button>
                <button className="modal-close-btn" style={{ background: '#666666', color: '#fff' }} onClick={handleCleanTasks}>Conferma</button>
            </div>
        </div>
    </div>;
}

export default ConfirmModal;