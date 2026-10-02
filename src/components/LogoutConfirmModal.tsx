import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from "./Modal";
import { Icon } from '@sensorario/sg-components';

type LogoutConfirmModalProps = {
    onClick: () => void;
    onConfirm: () => void;
};

const LogoutConfirmModal = ({ onClick, onConfirm }: LogoutConfirmModalProps) => {
    const { t } = useTranslation();
    return <Modal onClick={onClick} title={t('app.logoutConfirmTitle')} icon={<Icon name="help-circle" size={24} style={{ color: '#7c63c9' }} />} buttons={[
        { label: t('common.cancel'), onClick },
        { label: t('common.confirm'), onClick: onConfirm }
    ]}>
        <p>{t('app.logoutConfirm')}</p>
    </Modal>;
}

export default LogoutConfirmModal;
