import React from 'react';

export const useVersionNumber = () => '1.2.2';

export const VersionNumber: React.FC = () => {
    const version = useVersionNumber();
    return <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '16px' }}>
        <strong>Versione:</strong> v{version}
    </div>;
};