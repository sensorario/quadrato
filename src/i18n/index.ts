import { createI18n, readLanguageCookie } from '@sensorario/sg-components';
import it from './locales/it.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import es from './locales/es.json';
import ja from './locales/ja.json';

const i18n = createI18n({ resources: { it, en, fr, de, es, ja } });

// One-off move of the language picked before it became the shared
// .simonegentili.com cookie; the cookie wins if another app already set it.
const LEGACY_LANGUAGE_KEY = 'simplanner-language';
try {
    const legacy = localStorage.getItem(LEGACY_LANGUAGE_KEY);
    if (legacy) {
        localStorage.removeItem(LEGACY_LANGUAGE_KEY);
        if (!readLanguageCookie()) i18n.changeLanguage(legacy);
    }
} catch {
    // localStorage not available
}

export default i18n;
