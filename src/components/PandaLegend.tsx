import React, { useState } from 'react';
import { STATUS_PANDA } from '../themes/statusPanda';

const LEGEND = [
    { icon: STATUS_PANDA[0], label: 'Task da fare' },
    { icon: STATUS_PANDA[1], label: 'Task iniziato' },
    { icon: STATUS_PANDA[2], label: 'Task completato' },
    { icon: STATUS_PANDA[3], label: 'Task skippato' },
];

const PandaLegend = () => {
    const [status, setStatus] = useState(0);

    return (
        <div style={{ maxWidth: '340px', width: '90%', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <div
                    onClick={() => setStatus((prev) => (prev + 1) % 4)}
                    role="button"
                    tabIndex={0}
                    title="Clicca per provare"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            setStatus((prev) => (prev + 1) % 4);
                        }
                    }}
                    style={{
                        width: '72px',
                        height: '72px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0
                    }}
                >
                    <div style={{ transform: 'scale(4)' }}>
                        {STATUS_PANDA[status]}
                    </div>
                </div>
                <div className="panda-hint">
                    <span aria-hidden="true">←</span>
                    <span>Clicca per provare</span>
                </div>
            </div>
            <p style={{ margin: '8px 0 16px', fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                Provare Quadrato
            </p>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                textAlign: 'left',
                border: '1px solid #eee',
                borderRadius: '8px',
                padding: '12px 16px'
            }}>
                {LEGEND.map(({ icon, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {icon}
                        <span style={{ fontSize: '14px', color: '#333' }}>{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PandaLegend;
