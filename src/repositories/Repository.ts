export interface Repository {
    getProjectColors(): any;
    getShowText(): boolean;
    setShowText(value: boolean): void;
    setProjectColor(project: string | number, color: any): void;
    removeProjectColor(project: string): void;
}
