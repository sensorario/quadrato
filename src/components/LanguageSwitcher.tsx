import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n';

const LANGUAGE_NAMES: Record<string, string> = {
    it: 'Italiano',
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    es: 'Español',
    ja: '日本語',
};

export const LanguageSwitcher = ({ style }: { style?: CSSProperties }) => {
    const { i18n } = useTranslation();

    return (
        <select
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            aria-label="Language"
            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer', ...style }}
        >
            {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{LANGUAGE_NAMES[lang]}</option>
            ))}
        </select>
    );
};

export default LanguageSwitcher;
