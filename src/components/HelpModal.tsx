import HelpIcon from "./HelpIcon";

export const HelpModal = ({ setShowHelp }) => ((
    <div className="modal-overlay" onClick={() => setShowHelp(false)}>
        <div
            className="modal"
            onClick={e => e.stopPropagation()}
        >
            <h2><HelpIcon /> Help</h2>
            <h3 style={{ marginTop: '2rem', marginBottom: '0.5rem' }}>Colori:</h3>
            <ul style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <li><strong>nero</strong>: I task normali</li>
                <li><strong style={{ color: 'red' }}>rosso</strong>: I task scaduti</li>
            </ul>
            <h3 style={{ marginTop: '2rem', marginBottom: '0.5rem' }}>Scorciatorie:</h3>
            <ul style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <li><strong>Ctrl+H</strong>: Mostra questa finestra</li>
                <li><strong>Ctrl+N</strong>: Aggiungi un nuovo task</li>
                <li><strong>Ctrl+X</strong>: Cancella tutti i task skippati o completati</li>
                <li><strong>Click su task</strong>: Cambia stato del task</li>
                <li><strong>ESC</strong>: Chiudi popup</li>
            </ul>
            <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Legenda quadrati:</h3>
            <ul style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <li><span style={{ verticalAlign: 'middle', marginRight: 8 }}><svg width="16" height="16"><rect x="1" y="1" width="14" height="14" fill="white" stroke="black" strokeWidth="2" /></svg></span> Da fare</li>
                <li><span style={{ verticalAlign: 'middle', marginRight: 8 }}><svg width="16" height="16"><rect x="1" y="1" width="14" height="14" fill="white" stroke="black" strokeWidth="2" /><circle cx="8" cy="8" r="3" fill="black" /></svg></span> In progress</li>
                <li><span style={{ verticalAlign: 'middle', marginRight: 8 }}><svg width="16" height="16"><rect x="1" y="1" width="14" height="14" fill="white" stroke="black" strokeWidth="2" /><line x1="4" y1="4" x2="12" y2="12" stroke="black" strokeWidth="2" /><line x1="12" y1="4" x2="4" y2="12" stroke="black" strokeWidth="2" /></svg></span> Completato</li>
                <li><span style={{ verticalAlign: 'middle', marginRight: 8 }}><svg width="16" height="16"><rect x="1" y="1" width="14" height="14" fill="black" stroke="black" strokeWidth="2" /></svg></span> Skippato</li>
            </ul>
        </div>
    </div>
));

export default HelpModal;