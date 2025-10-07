
import { Repository } from '../Repository';

class ConfigRepository implements Repository {
    static PROJECT_COLORS_KEY = 'simplanner-project-colors';
    static SHOW_TEXT_KEY = 'simplanner-show-text';
    static ICON_THEME_KEY = 'simplanner-icon-theme';
    static SHOW_EXPIRED_KEY = 'simplanner-show-expired';
    static DATE_TIME_ENABLED_KEY = 'simplanner-dateTime-enabled';

    getProjectColors() {
        try {
            const saved = localStorage.getItem(ConfigRepository.PROJECT_COLORS_KEY);
            return saved ? JSON.parse(saved) : "{}";
        } catch (e) {
            console.error('Failed to parse project colors from localStorage', e);
            return "{}";
        }
    }

    getShowText() {
        try {
            const saved = localStorage.getItem(ConfigRepository.SHOW_TEXT_KEY);
            return saved ? JSON.parse(saved) : false;
        } catch (e) {
            console.log({ e });
            return true;
        }
    }

    setShowText(value: boolean) {
        localStorage.setItem(ConfigRepository.SHOW_TEXT_KEY, JSON.stringify(value));
    }

    setShowExpired(value: boolean) {
        localStorage.setItem(ConfigRepository.SHOW_EXPIRED_KEY, JSON.stringify(value));
    }

    getShowExpired() {
        try {
            const saved = localStorage.getItem(ConfigRepository.SHOW_EXPIRED_KEY);
            return saved ? JSON.parse(saved) : false;
        } catch (e) {
            console.log({ e });
            return false;
        }
    }

    setProjectColor(project: string | number, color: any) {
        const colors = this.getProjectColors();
        colors[project] = color;
        localStorage.setItem(ConfigRepository.PROJECT_COLORS_KEY, JSON.stringify(colors));
    }

    removeProjectColor(project: string) {
        const colors = this.getProjectColors();
        delete colors[project];
        localStorage.setItem(ConfigRepository.PROJECT_COLORS_KEY, JSON.stringify(colors));
    }

    setIconTheme(theme: string): void {
        localStorage.setItem(ConfigRepository.ICON_THEME_KEY, theme);
    }

    getIconTheme(): string {
        return localStorage.getItem(ConfigRepository.ICON_THEME_KEY) || 'default';
    }

    getDateTimeEnabled(): boolean {
        try {
            const saved = localStorage.getItem(ConfigRepository.DATE_TIME_ENABLED_KEY);
            return saved ? JSON.parse(saved) : false;
        } catch (e) {
            console.log({ e });
            return false;
        }
    }

    setDateTimeEnabled(value: boolean): void {
        localStorage.setItem(ConfigRepository.DATE_TIME_ENABLED_KEY, JSON.stringify(value));
    }
}

export default new ConfigRepository();
