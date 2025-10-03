import { Repository } from "../Repository";

class ConfigRepository implements Repository {
    getProjectColors() {
        throw new Error("Method not implemented.");
    }
    getShowText(): boolean {
        throw new Error("Method not implemented.");
    }
    setShowText(value: boolean): void {
        throw new Error("Method not implemented.");
    }
    setProjectColor(project: string | number, color: any): void {
        throw new Error("Method not implemented.");
    }
    removeProjectColor(project: string): void {
        throw new Error("Method not implemented.");
    }
}

export default new ConfigRepository();
