export const HelpModal = ({ setShowHelp }) => ((
    <div className="modal-overlay" onClick={() => setShowHelp(false)}>
        <div
            className="modal"
            onClick={e => e.stopPropagation()}
        >
            <h2>Scorciatoie</h2>
            <ul style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <li><strong>Ctrl+H</strong>: Mostra questa finestra</li>
                <li><strong>Ctrl+N</strong>: Aggiungi un nuovo task</li>
                <li><strong>Ctrl+X</strong>: Cancella tutti i task skippati o completati</li>
                <li><strong>Click su task</strong>: Cambia stato del task</li>
                <li><strong>ESC</strong>: Chiudi popup</li>
            </ul>
        </div>
    </div>
));

export default HelpModal;