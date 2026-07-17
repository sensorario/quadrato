import { useTranslation } from "react-i18next";
import HelpIcon from "./HelpIcon";
import { Modal } from "./Modal";
import TabbedContent from "./TabbedContent";
import { STATUS_PANDA } from './../themes/statusPanda';
import InfoPanel from "./InfoPanel";

export const HelpModal = ({ setShowHelp }: { setShowHelp: (show: boolean) => void }) => {
    const { t } = useTranslation();

    const ColorsPanel = () => (
        <div>
            <ul style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <li><strong>{t('helpModal.blackLabel')}</strong>: {t('helpModal.blackDesc')}</li>
                <li><strong style={{ color: 'red' }}>{t('helpModal.redLabel')}</strong>: {t('helpModal.redDesc')}</li>
            </ul>
        </div>
    );

    const ShortcutsPanel = () => (
        <div>
            <ul style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <li><strong>Ctrl + Shift + N</strong>: {t('helpModal.shortcutNewTask')}</li>
                <li><strong>Ctrl + Shift + X</strong>: {t('helpModal.shortcutArchive')}</li>
                <li><strong>Ctrl + Shift + H</strong>: {t('helpModal.shortcutHelp')}</li>
                <li><strong>Esc</strong>: {t('helpModal.shortcutClose')}</li>
            </ul>
        </div>
    );

    const LegendPanel = () => (
        <div>
            <p>{t('helpModal.legendIntro')}</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
                {STATUS_PANDA[0]}
                <span>{t('helpModal.todo')}</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
                {STATUS_PANDA[1]}
                <span>{t('helpModal.inProgress')}</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
                {STATUS_PANDA[2]}
                <span>{t('helpModal.done')}</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
                {STATUS_PANDA[3]}
                <span>{t('helpModal.skipped')}</span>
            </div>
        </div>
    );

    return <Modal title={t('helpModal.title')} icon={<HelpIcon />} onClick={() => setShowHelp(false)} >
        <TabbedContent panels={[
            { title: t('helpModal.colorsTab'), content: <ColorsPanel /> },
            { title: t('helpModal.shortcutsTab'), content: <ShortcutsPanel /> },
            { title: t('helpModal.legendTab'), content: <LegendPanel /> }
        ]} />
        <InfoPanel />
    </Modal>

};

export default HelpModal;