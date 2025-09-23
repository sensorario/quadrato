import React from "react";

export const InfoPanel = () => {
    return <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '16px' }}>
        <strong>Versione:</strong> v1.1
        <br />
        <strong>Creato da:</strong> sensorario
        <br />
        <strong>Repository:</strong> <a href="https://github.com/sensorario/quadrato">sensorario/quadrato</a>
    </div>
};

export default InfoPanel;