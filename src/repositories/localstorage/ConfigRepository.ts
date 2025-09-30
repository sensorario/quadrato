class ConfigRepository {
    static PROJECT_COLORS_KEY = 'simplanner-project-colors';

    getProjectColors() {
        try {
            const saved = localStorage.getItem(ConfigRepository.PROJECT_COLORS_KEY);
            return saved ? JSON.parse(saved) : "{}";
        } catch (e) {
            console.error('Failed to parse project colors from localStorage', e);
            return "{}";
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
}

export default new ConfigRepository();
