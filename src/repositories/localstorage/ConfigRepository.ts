class ConfigRepository {
    static PROJECT_COLORS_KEY = 'simplanner-project-colors';
    static SHOW_TEXT_KEY = 'simplanner-show-text';

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
}

export default new ConfigRepository();
