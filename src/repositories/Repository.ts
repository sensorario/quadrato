
import React from "react";

export interface Repository {
    // projects
    getAllProjects(): string[];
    // shot text close to icons
    setShowText(value: boolean): void;
    getShowText(): boolean;

    // project colors
    setProjectColor(project: string | number, color: any): void;
    getProjectColors(): any;

    // themes
    setIconTheme(theme: string): void;
    getIconTheme(): string;

    // tasks
    setShowExpired(value: boolean): void;
    getShowExpired(): boolean;

    // tasks
    setDateTimeEnabled(value: boolean): void;
    getDateTimeEnabled(): boolean;

    // tasks
    setProjectGroupable(value: boolean): void;
    getProjectGroupable(): boolean;

    // tasks
    removeProjectColor(project: string): void;
    getZenMode(): boolean;
    setZenMode(value: boolean): void;

    // project filter
    setProjectGroupable(value: boolean): void;
    getProjectGroupable(): boolean;

    // active tab
    setActiveTab(id: string, index: React.SetStateAction<number>): void;
    getActiveTab(id: string): string | null;

    // filters
    setProjectFilter(value: string): void;
    getProjectFilter(): string | null;

    // events
    onUnauthorized(callback: () => void): void;

    // logout
    logout?(): void;
}
