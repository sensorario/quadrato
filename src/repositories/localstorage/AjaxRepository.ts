import React from "react";
import { Repository } from "../Repository";

class ConfigRepository implements Repository {
    private apiData: any = null;

    constructor() {
        fetch('https://api.simonegentili.com/quadrato')
            .then(res => res.json())
            .then(data => {
                this.apiData = data;
                console.log('Fetched data from api.simonegentili.com:', data);
                console.log({ apiData: this.apiData });
            })
            .catch(err => {
                console.error('Error fetching from api.simonegentili.com:', err);
            });
    }

    requireAttention(): boolean {
        return true;
    }

    getShowText(): boolean {
        console.log("Waiting for apiData to be fetched...");
        const start = Date.now();

        const id = setInterval(() => {
            console.log("Checking apiData...", this.apiData);
            if (this.apiData !== null) {
                console.log("apiData is now available:", this.apiData);
                clearInterval(id);
                return this.apiData.showText;
            }
        }, 100);

        console.log("Fetched apiData in getShowText:", this.apiData);
        console.log("Method getShowText not implemented.");
        return false;
    }

    getAllProjects(): string[] {
        console.log("Method getAllProjects not implemented.");


        // esegui una chiamata GET ad example.com e scrivi a console il json restituito


        return [];
    }

    setShowText(value: boolean): void {
        console.log("Method setShowText not implemented.");
    }

    setProjectColor(project: string | number, color: any): void {
        console.log("Method setProjectColor not implemented.");
    }

    getProjectColors() {
        console.log("Method getProjectColors not implemented.");
    }

    setIconTheme(theme: string): void {
        console.log("Method setIconTheme not implemented.");
    }

    getIconTheme(): string {
        console.log("Method getIconTheme not implemented.");
        return '';
    }

    setShowExpired(value: boolean): void {
        console.log("Method setShowExpired not implemented.");
    }

    getShowExpired(): boolean {
        console.log("Method getShowExpired not implemented.");
        return false;
    }

    setDateTimeEnabled(value: boolean): void {
        console.log("Method setDateTimeEnabled not implemented.");
    }

    getDateTimeEnabled(): boolean {
        console.log("Method getDateTimeEnabled not implemented.");
        return false;
    }

    setProjectEditable(value: unknown): void {
        console.log("Method setProjectEditable not implemented.");
    }

    getProjectEditable(): boolean {
        console.log("Method getProjectEditable not implemented.");
        return false;
    }

    removeProjectColor(project: string): void {
        console.log("Method removeProjectColor not implemented.");
    }

    getZenMode(): boolean {
        console.log("Method getZenMode not implemented.");
        return false;
    }

    setActiveTab(index: React.SetStateAction<number>): void {
        console.log("Method setActiveTab not implemented.");
    }

    getActiveTab(): string | null {
        console.log("Method getActiveTab not implemented.");
        return null;
    }

    setProjectFilter(value: string): void {
        console.log("Method setProjectFilter not implemented.");
    }

    getProjectFilter(): string | null {
        console.log("Method getProjectFilter not implemented.");
        return null;
    }

    getAllTasks(): string[] {
        console.error("Method not implemented.");
        return [];
    }
}

export default new ConfigRepository();
