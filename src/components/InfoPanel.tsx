import React from "react";
import { useTranslation } from "react-i18next";
import { useVersionNumber } from "./VersionNumber";

export const InfoPanel = () => {
    const { t } = useTranslation();
    const versionNumber: string = useVersionNumber();
    return <div style={{ fontSize: '13px', color: '#666', textAlign: 'center', marginTop: '16px' }}>
        <strong>{t('infoPanel.version')}</strong> v{versionNumber}
        <br />
        <strong>{t('infoPanel.createdBy')}</strong> sensorario
        <br />
        <strong>{t('infoPanel.repository')}</strong> <a href="https://github.com/sensorario/quadrato">sensorario/quadrato</a>
    </div>
};

export default InfoPanel;