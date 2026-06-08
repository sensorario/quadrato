import React from 'react';

declare const __APP_VERSION__: string;

export const useVersionNumber = () => __APP_VERSION__;

export const VersionNumber: React.FC = () => {
    const version = useVersionNumber();
    return <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '16px' }}>
        <strong>Versione:</strong> v{version}
    </div>;
};