
import React from "react";

const EditTaskModal = ({ value, setValue, longValue, setLongValue, onClose, onSave }) => (
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
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="modal-close-btn" onClick={onClose}>Annulla</button>
                <button className="modal-close-btn" style={{ background: '#666', color: '#fff' }} onClick={onSave}>Salva</button>
            </div>
        </div>
    </div>
);

export default EditTaskModal;
