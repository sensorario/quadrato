export interface Repository {
    getProjectColors(): any;
    getShowText(): boolean;
    setShowText(value: boolean): void;
    setProjectColor(project: string | number, color: any): void;
    removeProjectColor(project: string): void;
    setIconTheme(theme: string): void;
    getIconTheme(): string;
    setShowExpired(value: boolean): void;
    getShowExpired(): boolean;
    setDateTimeEnabled(value: boolean): void;
    getDateTimeEnabled(): boolean;
    getZenMode(): boolean;
}
