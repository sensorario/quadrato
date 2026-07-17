import React from 'react';
import { STATUS_PANDA } from '../themes/statusPanda';

const LEGEND = [
    { icon: STATUS_PANDA[0], label: 'Task da fare' },
    { icon: STATUS_PANDA[1], label: 'Task iniziato' },
    { icon: STATUS_PANDA[2], label: 'Task completato' },
    { icon: STATUS_PANDA[3], label: 'Task skippato' },
];

const PandaLegend = () => {
    return (
        <div style={{ maxWidth: '340px', width: '90%', textAlign: 'center' }}>
            <div style={{
                width: '72px',
                height: '72px',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ transform: 'scale(4)' }}>
                    {STATUS_PANDA[2]}
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
