
import { Modal } from "./Modal";
import HelpIcon from "./HelpIcon";
import TabbedContent from "./TabbedContent";

const EditTaskModal = ({ value, setValue, longValue, setLongValue, projectValue, setProjectValue, timestampValue, setTimestampValue, periodicityValue, setPeriodicityValue, onClose, onSave, projectEditable, dateTimeEnabled }) => {
    const Footer = () => <div style={{ display: 'flex', gap: '1rem', justifyContent: 'right' }}>
        <button className="modal-close-btn" onClick={onClose}>Annulla</button>
        <button className="modal-close-btn" style={{ background: '#666', color: '#fff' }} onClick={onSave}>Salva</button>
    </div>

    const Testo = () => <>
        <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Titolo breve</label>
        <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            autoFocus
            style={{ width: '90%', marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '1rem', border: '1px solid #d1d1d1' }}
            onKeyDown={e => {
                if (e.key === 'Enter') onSave();
                if (e.key === 'Escape') onClose();
            }}
        />
        <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Descrizione lunga</label>
        <textarea
            value={longValue}
            onChange={e => setLongValue(e.target.value)}
            style={{ width: '90%', minHeight: '60px', marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '1rem', border: '1px solid #d1d1d1', resize: 'vertical' }}
        />
    </>

    const Tempo = () => {
        return dateTimeEnabled && (
            <>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Periodicità</label>
                <div className="periodo">
                    ripeti ogni <input
                        type="number"
                        min="1"
                        value={periodicityValue.number}
                        onChange={e => setPeriodicityValue({ ...periodicityValue, number: e.target.value })}
                        style={{ width: '50px', margin: '0 0.5rem', padding: '0.25rem 0.5rem', borderRadius: '8px', fontSize: '1rem', border: '1px solid #d1d1d1' }}
                    />
                    <select
                        value={periodicityValue.unit}
                        onChange={e => setPeriodicityValue({ ...periodicityValue, unit: e.target.value })}
                        style={{ padding: '0.25rem 0.5rem', borderRadius: '8px', fontSize: '1rem', border: '1px solid #d1d1d1' }}>
                        <option value="minuti">minuti</option>
                        <option value="giorni">giorni</option>
                        <option value="settimane">settimane</option>
                        <option value="mesi">mesi</option>
                        <option value="anni">anni</option>
                    </select>
                </div>
                <div style={{ height: '1rem' }}></div>
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Lascia vuoto per nessuna scadenza</div>
                <div style={{ height: '0.5rem' }}>
                </div>
                <hr />
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Scadenza</label>
                <input
                    type="datetime-local"
                    value={typeof timestampValue === 'number' ? new Date(timestampValue).toISOString().slice(0, 16) : timestampValue}
                    onChange={e => setTimestampValue(new Date(e.target.value).getTime())}
                    style={{ width: '90%', marginBottom: '0.5rem', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '1rem', border: '1px solid #d1d1d1' }}
                />
                <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                    <button type="button" style={{ fontSize: '0.95em', padding: '6px 14px', borderRadius: 6, border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }} onClick={e => {
                        e.preventDefault();
                        const d = new Date();
                        d.setUTCDate(d.getUTCDate() + 1);
                        d.setUTCHours(8, 0, 0, 0);
                        setTimestampValue(d.getTime());
                    }}>domani</button>
                    <button type="button" style={{ fontSize: '0.95em', padding: '6px 14px', borderRadius: 6, border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }} onClick={e => {
                        e.preventDefault();
                        const d = new Date();
                        const day = d.getUTCDay();
                        const daysToMonday = ((8 - day) % 7) || 7;
                        d.setUTCDate(d.getUTCDate() + daysToMonday);
                        d.setUTCHours(8, 0, 0, 0);
                        setTimestampValue(d.getTime());
                    }}>settimana prossima</button>
                    <button type="button" style={{ fontSize: '0.95em', padding: '6px 14px', borderRadius: 6, border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }} onClick={e => {
                        e.preventDefault();
                        const d = new Date();
                        d.setUTCMonth(d.getUTCMonth() + 1);
                        d.setUTCDate(1);
                        while (d.getUTCDay() !== 1) {
                            d.setUTCDate(d.getUTCDate() + 1);
                        }
                        d.setUTCHours(8, 0, 0, 0);
                        setTimestampValue(d.getTime());
                    }}>mese prossimo</button>
                </div>
            </>
        )
    }

    const Progetto = () => {
        return projectEditable && (
            <>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Progetto</label>
                <input
                    type="text"
                    value={projectValue}
                    onChange={e => setProjectValue(e.target.value)}
                    style={{ width: '90%', marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '1rem', border: '1px solid #d1d1d1' }}
                    placeholder="Modifica progetto..."
                />
            </>
        )
    }

    return <Modal title="Modifica task!!" icon={<HelpIcon />} onclick={onClose} >
        <TabbedContent panels={[
            { title: 'Cosa', content: <Testo /> },
            { title: 'Quando', content: <Tempo /> },
            { title: 'Progetto', content: <Progetto /> },
        ]} />
        <Footer />
    </Modal >;
};

export default EditTaskModal;
