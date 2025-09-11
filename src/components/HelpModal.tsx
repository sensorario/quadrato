import HelpIcon from "./HelpIcon";
import { Modal } from "./Modal";

export const HelpModal = ({ setShowHelp }) => ((
    <Modal title={"Help"} icon={<HelpIcon />} onclick={() => setShowHelp(false)}>
        <h3 style={{ marginTop: '2rem', marginBottom: '0.5rem' }}>Colori:</h3>
        <ul style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <li><strong>nero</strong>: I task normali</li>
            <li><strong style={{ color: 'red' }}>rosso</strong>: I task scaduti</li>
        </ul>
        <h3 style={{ marginTop: '2rem', marginBottom: '0.5rem' }}>Scorciatorie:</h3>
        <ul style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <li><strong>Ctrl+Shift+H</strong>: Mostra questa finestra</li>
            <li><strong>Ctrl+Shift+N</strong>: Aggiungi un nuovo task</li>
            <li><strong>Ctrl+Shift+X</strong>: Cancella tutti i task skippati o completati</li>
            <li><strong>Click su task</strong>: Cambia stato del task</li>
            <li><strong>ESC</strong>: Chiudi popup</li>
        </ul>
        <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Legenda quadrati:</h3>
        <ul style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <li><span style={{ verticalAlign: 'middle', marginRight: 8 }}><svg width="18" height="18"><rect x="1" y="1" width="16" height="16" fill="white" stroke="black" strokeWidth="2" /></svg></span> Da fare</li>
            <li><span style={{ verticalAlign: 'middle', marginRight: 8 }}><svg width="18" height="18"><rect x="1" y="1" width="16" height="16" fill="white" stroke="black" strokeWidth="2" /><circle cx="9" cy="9" r="3" fill="black" /></svg></span> In progress</li>
            <li><span style={{ verticalAlign: 'middle', marginRight: 8 }}><svg width="18" height="18"><rect x="1" y="1" width="16" height="16" fill="white" stroke="black" strokeWidth="2" /><line x1="5" y1="5" x2="13" y2="13" stroke="black" strokeWidth="2" /><line x1="13" y1="5" x2="5" y2="13" stroke="black" strokeWidth="2" /></svg></span> Completato</li>
            <li><span style={{ verticalAlign: 'middle', marginRight: 8 }}><svg width="18" height="18"><rect x="1" y="1" width="16" height="16" fill="black" stroke="black" strokeWidth="2" /></svg></span> Skippato</li>
        </ul>
    </Modal>
));

export default HelpModal;