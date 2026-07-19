import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from "./Modal";
import HelpIcon from './HelpIcon';

type LogoutConfirmModalProps = {
    onClick: () => void;
    onConfirm: () => void;
};

const LogoutConfirmModal = ({ onClick, onConfirm }: LogoutConfirmModalProps) => {
    const { t } = useTranslation();
    return <Modal onClick={onClick} title={t('app.logoutConfirmTitle')} icon={<HelpIcon />} buttons={[
        { label: t('common.cancel'), onClick },
        { label: t('common.confirm'), onClick: onConfirm }
    ]}>
        <p>{t('app.logoutConfirm')}</p>
    </Modal>;
}

export default LogoutConfirmModal;
