import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { STATUS_PANDA } from '../themes/statusPanda';
import CurvedArrowIcon from './CurvedArrowIcon';

const PandaLegend = () => {
    const { t } = useTranslation();
    const [status, setStatus] = useState(0);

    const LEGEND = [
        { icon: STATUS_PANDA[0], label: t('pandaLegend.todo') },
        { icon: STATUS_PANDA[1], label: t('pandaLegend.inProgress') },
        { icon: STATUS_PANDA[2], label: t('pandaLegend.done') },
        { icon: STATUS_PANDA[3], label: t('pandaLegend.skipped') },
    ];

    return (
        <div style={{ maxWidth: '340px', width: '90%', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                <div
                    onClick={() => setStatus((prev) => (prev + 1) % 4)}
                    role="button"
                    tabIndex={0}
                    title={t('pandaLegend.clickToTry')}
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
                    <CurvedArrowIcon />
                    <span>{t('pandaLegend.clickToTry')}</span>
                </div>
            </div>
            <p style={{ margin: '8px 0 16px', fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                {t('pandaLegend.tryQuadrato')}
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
