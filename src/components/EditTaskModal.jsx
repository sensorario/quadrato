
import React from "react";

const EditTaskModal = ({ value, setValue, longValue, setLongValue, projectValue, setProjectValue, dateTimeValue, setDateTimeValue, onClose, onSave, projectEditable, dateTimeEnabled }) => (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Modifica task</h2>
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
            {projectEditable && (
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
            )}
            {dateTimeEnabled && (
                <>
                    <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Scadenza</label>
                    <input
                        type="datetime-local"
                        value={dateTimeValue}
                        onChange={e => setDateTimeValue(e.target.value)}
                        style={{ width: '90%', marginBottom: '0.5rem', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '1rem', border: '1px solid #d1d1d1' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                        <button type="button" style={{ fontSize: '0.95em', padding: '6px 14px', borderRadius: 6, border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }} onClick={e => {
                            e.preventDefault();
                            const d = new Date();
                            d.setUTCDate(d.getUTCDate() + 1);
                            d.setUTCHours(8, 0, 0, 0);
                            setDateTimeValue(d.toISOString().slice(0, 16));
                        }}>domani</button>
                        <button type="button" style={{ fontSize: '0.95em', padding: '6px 14px', borderRadius: 6, border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }} onClick={e => {
                            e.preventDefault();
                            const d = new Date();
                            const day = d.getUTCDay();
                            const daysToMonday = ((8 - day) % 7) || 7;
                            d.setUTCDate(d.getUTCDate() + daysToMonday);
                            d.setUTCHours(8, 0, 0, 0);
                            setDateTimeValue(d.toISOString().slice(0, 16));
                        }}>settimana prossima</button>
                        <button type="button" style={{ fontSize: '0.95em', padding: '6px 14px', borderRadius: 6, border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }} onClick={e => {
                            e.preventDefault();
                            const d = new Date();
                            d.setUTCMonth(d.getUTCMonth() + 1);
                            d.setUTCDate(1);
                            // Trova il primo lunedì del mese prossimo
                            while (d.getUTCDay() !== 1) {
                                d.setUTCDate(d.getUTCDate() + 1);
                            }
                            d.setUTCHours(8, 0, 0, 0);
                            setDateTimeValue(d.toISOString().slice(0, 16));
                        }}>mese prossimo</button>
                    </div>
                </>
            )}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="modal-close-btn" onClick={onClose}>Annulla</button>
                <button className="modal-close-btn" style={{ background: '#666', color: '#fff' }} onClick={onSave}>Salva</button>
            </div>
        </div>
    </div>
);

export default EditTaskModal;
