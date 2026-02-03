import React from "react";
import { Repository } from "./Repository";

class LocalStorageRepository implements Repository {
    static PROJECT_COLORS_KEY = "simplanner-project-colors";
    static SHOW_TEXT_KEY = "simplanner-show-text";
    static ICON_THEME_KEY = "simplanner-icon-theme";
    static SHOW_EXPIRED_KEY = "simplanner-show-expired";
    static DATE_TIME_ENABLED_KEY = "simplanner-dateTime-enabled";
    static ZEN_MODE_KEY = "simplanner-zen-mode";
    static PROJECT_FILTER_KEY = "simplanner-project-filter";
    static PROJECT_GROUPABLE = "simplanner-project-groupable";

    setAccessToken(token: string | null): void {
        /** localstorage does not require access token */
    }

    requireAuthentication(): boolean {
        return false;
    }

    /**
     * Returns a list of unique project names from all tasks in localStorage (across all 'simplanner-tasks*' keys)
     */
    getAllProjects(): string[] {
        let projects: string[] = [];
        Object.keys(localStorage)
            .filter(key => key.startsWith('simplanner-tasks'))
            .forEach(key => {
                try {
                    const tasks = JSON.parse(localStorage.getItem(key)!);
                    if (Array.isArray(tasks)) {
                        tasks.forEach((task: any) => {
                            if (task.project) projects.push(task.project);
                        });
                    }
                } catch (e) {
                    console.error('Errore nel parsing dei task:', e);
                }
            });
        return Array.from(new Set(projects));
    }

    getProjectColors() {
        try {
            const saved = localStorage.getItem(LocalStorageRepository.PROJECT_COLORS_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error("Failed to parse project colors from localStorage", e);
            return {};
        }
    }

    getTasks(): any[] {
        try {
            const saved = localStorage.getItem("simplanner-tasks");
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to parse tasks from localStorage", e);
            return [];
        }
    }

    getTasksFromKey(key: string): any[] {
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error(`Failed to parse tasks from localStorage key ${key}`, e);
            return [];
        }
    }

    setProjectEditable(val: boolean) {
        localStorage.setItem("simplanner-project-editable", JSON.stringify(val));
    }

    getProjectEditable() {
        try {
            const saved = localStorage.getItem("simplanner-project-editable");
            return saved ? JSON.parse(saved) : false;
        } catch (e) {
            console.error("Failed to parse project editability from localStorage", e);
            return false;
        }
    }

    getShowText() {
        try {
            const saved = localStorage.getItem(LocalStorageRepository.SHOW_TEXT_KEY);
            return saved ? JSON.parse(saved) : false;
        } catch (e) {
            console.log({ e });
            return true;
        }
    }

    setShowText(value: boolean) {
        localStorage.setItem(LocalStorageRepository.SHOW_TEXT_KEY, JSON.stringify(value));
    }

    setShowExpired(value: boolean) {
        localStorage.setItem(LocalStorageRepository.SHOW_EXPIRED_KEY, JSON.stringify(value));
    }

    getShowExpired() {
        try {
            const saved = localStorage.getItem(LocalStorageRepository.SHOW_EXPIRED_KEY);
            return saved ? JSON.parse(saved) : false;
        } catch (e) {
            console.log({ e });
            return false;
        }
    }

    setProjectColor(project: string | number, color: any) {
        const colors = this.getProjectColors();
        colors[project] = color;
        localStorage.setItem(LocalStorageRepository.PROJECT_COLORS_KEY, JSON.stringify(colors));
    }

    removeProjectColor(project: string) {
        const colors = this.getProjectColors();
        delete colors[project];
        localStorage.setItem(LocalStorageRepository.PROJECT_COLORS_KEY, JSON.stringify(colors));
    }

    setIconTheme(theme: string): void {
        localStorage.setItem(LocalStorageRepository.ICON_THEME_KEY, theme);
    }

    getIconTheme(): string {
        return localStorage.getItem(LocalStorageRepository.ICON_THEME_KEY) || "default";
    }

    getDateTimeEnabled(): boolean {
        try {
            const saved = localStorage.getItem(LocalStorageRepository.DATE_TIME_ENABLED_KEY);
            return saved ? JSON.parse(saved) : false;
        } catch (e) {
            console.log({ e });
            return false;
        }
    }

    setDateTimeEnabled(value: boolean): void {
        localStorage.setItem(LocalStorageRepository.DATE_TIME_ENABLED_KEY, JSON.stringify(value));
    }

    getZenMode(): boolean {
        try {
            const saved = localStorage.getItem(LocalStorageRepository.ZEN_MODE_KEY);
            return saved ? JSON.parse(saved) : false;
        } catch (e) {
            console.log({ e });
            return false;
        }
    }

    setZenMode(value: boolean): void {
        localStorage.setItem(LocalStorageRepository.ZEN_MODE_KEY, JSON.stringify(value));
    }

    getProjectFilter(): string | null {
        try {
            const saved = localStorage.getItem(LocalStorageRepository.PROJECT_FILTER_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.log({ e });
            return null;
        }
    }

    setProjectFilter(val: string | null): void {
        localStorage.setItem(LocalStorageRepository.PROJECT_FILTER_KEY, JSON.stringify(val));
    }

    setTasks(tasks: any[]): void {
        localStorage.setItem("simplanner-tasks", JSON.stringify(tasks));
    }

    setActiveTab(index: React.SetStateAction<number>): void {
        localStorage.setItem('simplanner-config-tab', String(index));
    }

    getActiveTab(): string | null {
        try {
            const saved = localStorage.getItem('simplanner-config-tab');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error("Failed to parse active tab from localStorage", e);
            return null;
        }
    }

    onUnauthorized(callback: () => void): void {
        // this.onUnauthorizedCallback = callback;
    }

    onAuthenticated(callback: (token: string) => void): void {
        // this.onAuthenticatedCallback = callback;
    }
}

export default new LocalStorageRepository();
