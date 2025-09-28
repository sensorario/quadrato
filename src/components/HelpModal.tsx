import HelpIcon from "./HelpIcon";
import { Modal } from "./Modal";
import TabbedContent from "./TabbedContent";
import { STATUS_PANDA } from './../themes/statusPanda';
import InfoPanel from "./InfoPanel";

export const HelpModal = ({ setShowHelp }: { setShowHelp: (show: boolean) => void }) => {
    const ColorsPanel = () => (
        <div>
            <ul style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <li><strong>nero</strong>: I task normali</li>
                <li><strong style={{ color: 'red' }}>rosso</strong>: I task scaduti</li>
            </ul>
        </div>
    );

    const ShortcutsPanel = () => (
        <div>
            <ul style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <li><strong>Ctrl + Shift + N</strong>: Nuovo task</li>
                <li><strong>Ctrl + Shift + X</strong>: Archivia completati e skippati</li>
                <li><strong>Ctrl + Shift + H</strong>: Mostra help</li>
                <li><strong>Esc</strong>: Chiudi modale help o nuovo task</li>
            </ul>
        </div>
    );

    const LegendPanel = () => (
        <div>
            <p>I panda rappresentano lo stato del task.</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
                {STATUS_PANDA[0]}
                <span>Task da fare</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
                {STATUS_PANDA[1]}
                <span>Task iniziato</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
                {STATUS_PANDA[2]}
                <span>Task completato</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
                {STATUS_PANDA[3]}
                <span>Task skippato</span>
            </div>
        </div>
    );

    return <Modal title={"Help"} icon={<HelpIcon />} onClick={() => setShowHelp(false)} >
        <TabbedContent panels={[
            { title: "Colori", content: <ColorsPanel /> },
            { title: "Shortcuts", content: <ShortcutsPanel /> },
            { title: "Legenda", content: <LegendPanel /> }
        ]} />
        <InfoPanel />
    </Modal>

};

export default HelpModal;