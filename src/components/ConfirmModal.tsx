
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from "./Modal";
import { Icon } from '@sensorario/sg-components';

type ConfirmModalProps = {
    setShowCleanConfirm: (val: boolean) => void;
    handleCleanTasks: () => void;
    onClick: () => void;
};

const ConfirmModal = ({ setShowCleanConfirm, handleCleanTasks, onClick }: ConfirmModalProps) => {
    const { t } = useTranslation();
    return <Modal onClick={onClick} title={t('confirmModal.title')} icon={<Icon name="help-circle" size={24} style={{ color: '#7c63c9' }} />} buttons={[
        { label: t('common.cancel'), onClick: () => setShowCleanConfirm(false) },
        { label: t('common.confirm'), onClick: handleCleanTasks }
    ]}>
        <p>{t('confirmModal.message')}</p>
    </Modal>;

}

export default ConfirmModal;