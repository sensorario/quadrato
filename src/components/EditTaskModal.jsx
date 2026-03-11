import React from "react";
import { Modal } from "./Modal";
import HelpIcon from "./HelpIcon";
import TabbedContent from "./TabbedContent";
import { Footer } from "./Footer/index";
import { getConfigRepository } from "../repositories";

const formatDateTimeLocal = (value) => {
    if (!value) return '';
    const date = typeof value === 'number' ? new Date(value) : new Date(value);
    const pad = (n) => String(n).padStart(2, '0');
    // Usa getHours() locale per mostrare quello che l'utente ha immesso
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const parseLocalDateTimeToUTC = (dateTimeString) => {
    if (!dateTimeString) return '';
    // La stringa datetime-local rappresenta il tempo LOCALE dell'utente
    // Creando un Date direttamente, JS lo interpreta come locale
    return new Date(dateTimeString).getTime();
};

const EditTaskModal = ({ value, setValue, longValue, setLongValue, projectValue, setProjectValue, timestampValue, setTimestampValue, periodicityValue, setPeriodicityValue, onClose, onSave, projectEditable, dateTimeEnabled }) => {
    React.useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return <Modal title="Modifica task" icon={<HelpIcon />} onClick={onClose} >
        <TabbedContent panels={[
            {
                title: 'Cosa', content: <>
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
            },
            {
                title: 'Quando', content: dateTimeEnabled && (
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
                            value={formatDateTimeLocal(timestampValue)}
                            onChange={e => setTimestampValue(parseLocalDateTimeToUTC(e.target.value))}
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
            },
            {
                title: 'Progetto', content: projectEditable && (
                    <>
                        <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Progetto</label>
                        <input
                            type="text"
                            value={projectValue}
                            onChange={e => setProjectValue(e.target.value)}
                            style={{ width: '90%', marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '1rem', border: '1px solid #d1d1d1' }}
                            placeholder="Modifica progetto..."
                        />
                        {/** estrai dal local storage simplanner-tasks tutti i progetti di tutti i task e stampali qui sotto */}
                        <div>
                            {(() => {
                                // Use configRepository to get all unique projects
                                const configRepository = getConfigRepository();
                                const uniqueProjects = configRepository.getAllProjects();
                                return uniqueProjects.length > 0
                                    ? uniqueProjects.map(project => <div style={{ padding: '4px 8px', borderBottom: '1px solid #eee', cursor: 'pointer' }} key={project} onClick={() => setProjectValue(project)}>{project}</div>)
                                    : <div style={{ color: '#888' }}>Nessun progetto trovato</div>;
                            })()}
                        </div>
                    </>
                )
            }
        ]} />
        <Footer>
            <button className="modal-close-btn" onClick={onClose}>Annulla</button>
            <button className="modal-close-btn" style={{ background: '#666', color: '#fff' }} onClick={onSave}>Salva</button>
        </Footer>
    </Modal >;
};

export default EditTaskModal;
