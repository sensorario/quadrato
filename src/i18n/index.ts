import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import it from './locales/it.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import es from './locales/es.json';
import ja from './locales/ja.json';

export const SUPPORTED_LANGUAGES = ['it', 'en', 'fr', 'de', 'es', 'ja'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

const LANGUAGE_STORAGE_KEY = 'simplanner-language';

const savedLanguage = (() => {
    try {
        const value = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        return value && (SUPPORTED_LANGUAGES as readonly string[]).includes(value) ? value : null;
    } catch {
        return null;
    }
})();

i18n
    .use(initReactI18next)
    .init({
        resources: {
            it: { translation: it },
            en: { translation: en },
            fr: { translation: fr },
            de: { translation: de },
            es: { translation: es },
            ja: { translation: ja },
        },
        lng: savedLanguage ?? 'it',
        fallbackLng: 'it',
        interpolation: {
            escapeValue: false,
        },
    });

i18n.on('languageChanged', (lng) => {
    try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
    } catch {
        // localStorage not available
    }
});

export default i18n;
