import React from "react";
import { useVersionNumber } from "./VersionNumber";

export const InfoPanel = () => {
    const versionNumber: string = useVersionNumber();
    return <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '16px' }}>
        <strong>Versione:</strong> v{versionNumber}
        <br />
        <strong>Creato da:</strong> sensorario
        <br />
        <strong>Repository:</strong> <a href="https://github.com/sensorario/quadrato">sensorario/quadrato</a>
    </div>
};

export default InfoPanel;