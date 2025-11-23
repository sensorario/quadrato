
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
    setProjectEditable(value: boolean): void;
    getProjectEditable(): boolean;

    // tasks
    removeProjectColor(project: string): void;
    getZenMode(): boolean;

    // project filter
    setProjectEditable(value: boolean): void;
    getProjectEditable(): boolean;

    // active tab
    setActiveTab(index: React.SetStateAction<number>): void;
    getActiveTab(): string | null;

    // filters
    setProjectFilter(value: string): void;
    getProjectFilter(): string | null;

}
