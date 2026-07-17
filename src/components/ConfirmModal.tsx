
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from "./Modal";
import HelpIcon from './HelpIcon';

type ConfirmModalProps = {
    setShowCleanConfirm: (val: boolean) => void;
    handleCleanTasks: () => void;
    onClick: () => void;
};

const ConfirmModal = ({ setShowCleanConfirm, handleCleanTasks, onClick }: ConfirmModalProps) => {
    const { t } = useTranslation();
    return <Modal onClick={onClick} title={t('confirmModal.title')} icon={<HelpIcon />} buttons={[
        { label: t('common.cancel'), onClick: () => setShowCleanConfirm(false) },
        { label: t('common.confirm'), onClick: handleCleanTasks }
    ]}>
        <p>{t('confirmModal.message')}</p>
    </Modal>;

}

export default ConfirmModal;