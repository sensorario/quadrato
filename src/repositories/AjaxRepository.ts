import { Repository } from "./Repository";

interface QuadratoData {
    "simplanner-tasks": any[];
    "simplanner-project-colors": Record<string, string>;
    "simplanner-show-text": boolean;
    "simplanner-icon-theme": string;
    "simplanner-show-expired": boolean;
    "simplanner-dateTime-enabled": boolean;
    "simplanner-zen-mode": boolean;
    "simplanner-project-filter": string | null;
    "simplanner-project-groupable": boolean;
    "simplanner-config-tab": string;
}

class AjaxRepository implements Repository {
    private lastSyncedHash: string = "";
    private accessToken: string | null = null;
    private isDataLoaded: boolean = false;
    private onDataLoadedCallback: (() => void) | null = null;
    private onUnauthorizedCallback: (() => void) | null = null;
    private onAuthenticatedCallback: ((token: string) => void) | null = null;
    private data: QuadratoData = {
        "simplanner-tasks": [],
        "simplanner-project-colors": {},
        "simplanner-show-text": true,
        "simplanner-icon-theme": "light",
        "simplanner-show-expired": false,
        "simplanner-dateTime-enabled": true,
        "simplanner-zen-mode": false,
        "simplanner-project-filter": null,
        "simplanner-project-groupable": true,
        "simplanner-config-tab": "0",
    };

    constructor() {
        this.lastSyncedHash = this.calculateHash();
        // Recupera il token dal localStorage se presente
        const savedToken = localStorage.getItem('simplanner-access-token');
        if (savedToken) {
            this.accessToken = savedToken;
            this.fetchData();
            // Notifica che siamo già autenticati
            if (this.onAuthenticatedCallback) {
                this.onAuthenticatedCallback(savedToken);
            }
        }
    }

    /**
     * Calcola un hash semplice del JSON per rilevare modifiche
     */
    private calculateHash(): string {
        return JSON.stringify(this.data);
    }

    /**
     * Verifica se i dati sono stati modificati dall'ultimo sync
     */
    private hasDataChanged(): boolean {
        const currentHash = this.calculateHash();
        return currentHash !== this.lastSyncedHash;
    }

    /**
     * Registra un callback da chiamare quando i dati sono caricati dall'API
     */
    onDataLoaded(callback: () => void): void {
        this.onDataLoadedCallback = callback;
        // Se i dati sono già caricati, chiama subito il callback
        if (this.isDataLoaded) {
            callback();
        }
    }

    /**
     * Registra un callback da chiamare quando si riceve 401 Unauthorized
     */
    onUnauthorized(callback: () => void): void {
        this.onUnauthorizedCallback = callback;
    }

    /**
     * Registra un callback da chiamare quando l'autenticazione ha successo
     */
    onAuthenticated(callback: (token: string) => void): void {
        this.onAuthenticatedCallback = callback;
    }

    public fetchData(callback?: (tasks: any[]) => void): void {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (this.accessToken) {
            headers['Authorization'] = `${this.accessToken}`;
        }

        fetch('https://api.simonegentili.com/quadrato/data', {
            method: 'GET',
            headers: headers
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                return res.json();
            })
            .then(apiData => {
                // Merge i dati dall'API con i default
                this.data = {
                    "simplanner-tasks": apiData["simplanner-tasks"] || apiData.tasks || this.data["simplanner-tasks"],
                    "simplanner-project-colors": apiData["simplanner-project-colors"] || apiData.projectColors || this.data["simplanner-project-colors"],
                    "simplanner-show-text": apiData["simplanner-show-text"] ?? apiData.showText ?? this.data["simplanner-show-text"],
                    "simplanner-icon-theme": apiData["simplanner-icon-theme"] || apiData.iconTheme || this.data["simplanner-icon-theme"],
                    "simplanner-show-expired": apiData["simplanner-show-expired"] ?? apiData.showExpired ?? this.data["simplanner-show-expired"],
                    "simplanner-dateTime-enabled": apiData["simplanner-dateTime-enabled"] ?? apiData.dateTimeEnabled ?? this.data["simplanner-dateTime-enabled"],
                    "simplanner-zen-mode": apiData["simplanner-zen-mode"] ?? apiData.zenMode ?? this.data["simplanner-zen-mode"],
                    "simplanner-project-filter": apiData["simplanner-project-filter"] ?? apiData.projectFilter ?? this.data["simplanner-project-filter"],
                    "simplanner-project-groupable": apiData["simplanner-project-groupable"] ?? apiData.projectGroupable ?? this.data["simplanner-project-groupable"],
                    "simplanner-config-tab": apiData["simplanner-config-tab"] ?? apiData.activeTab ?? this.data["simplanner-config-tab"]
                };

                if (callback) {
                    callback(this.data["simplanner-tasks"]);
                }

                // Aggiorna l'hash dopo il caricamento
                this.lastSyncedHash = this.calculateHash();
                this.isDataLoaded = true;

                // oer ogni chiave di data, salva il valore nel localStorage per caching
                Object.keys(this.data).forEach(key => {
                    const value = (this.data as any)[key];
                    // Salva oggetti e array con JSON.stringify, stringhe e primitivi così come sono
                    if (typeof value === 'object' && value !== null) {
                        localStorage.setItem(key, JSON.stringify(value));
                    } else if (typeof value === 'string') {
                        localStorage.setItem(key, value);
                    } else {
                        localStorage.setItem(key, String(value));
                    }
                });

                // Chiama il callback se registrato
                if (this.onDataLoadedCallback) {
                    this.onDataLoadedCallback();
                }
            })
            .catch(err => {
                console.error('Error fetching from api.simonegentili.com:', err);
                this.isDataLoaded = true;
            });
    }

    private syncToServer(): void {
        // Sincronizza solo se i dati sono stati modificati
        if (!this.hasDataChanged()) {
            return;
        }

        if (!this.isDataLoaded) {
            return;
        }

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (this.accessToken) {
            headers['Authorization'] = `${this.accessToken}`;
        }

        // fare una PUT a /quadrato/settings cui passare tutti i valori delle configurazini
        fetch('https://api.simonegentili.com/quadrato/config', {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(this.data)
        })
            .then(res => {
                if (res.status === 401) {
                    // Unauthorized
                    if (this.onUnauthorizedCallback) {
                        this.onUnauthorizedCallback();
                    }
                    throw new Error('Unauthorized');
                }

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                return res.json();
            })
            .then(responseData => {
                console.log("Data synced successfully:", responseData);
                // Aggiorna l'hash dopo la sincronizzazione
                this.lastSyncedHash = this.calculateHash();
            })
            .catch(err => {
                console.error('Error syncing data to server:', err);
            });
    }

    setAccessToken(token: string | null): void {
        this.accessToken = token;
        // Salva il token nel localStorage
        if (token) {
            localStorage.setItem('simplanner-access-token', token);
        } else {
            localStorage.removeItem('simplanner-access-token');
        }
        // Ricarica i dati con il nuovo token
        this.fetchData();
    }

    requireAuthentication(): boolean {
        return true;
    }

    /**
     * Effettua l'autenticazione con username e password
     */
    authenticate(username: string, password: string): Promise<void> {
        return fetch('https://api.simonegentili.com/quadrato/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        })
            .then(res => {
                if (res.status === 200) {
                    return res.json();
                } else {
                    throw new Error(`Authentication failed: ${res.status}`);
                }
            })
            .then(data => {
                const token = data.token || data.access_token;
                if (token) {
                    this.setAccessToken(token);
                    if (this.onAuthenticatedCallback) {
                        this.onAuthenticatedCallback(token);
                    }
                } else {
                    throw new Error('No token in response');
                }
            });
    }

    // ========== UI Settings ==========

    getShowText(): boolean {
        return this.data["simplanner-show-text"];
    }

    setShowText(value: boolean): void {
        this.data["simplanner-show-text"] = value;
        this.syncToServer();
    }

    getShowExpired(): boolean {
        return this.data["simplanner-show-expired"];
    }

    setShowExpired(value: boolean): void {
        this.data["simplanner-show-expired"] = value;
        this.syncToServer();
    }

    getDateTimeEnabled(): boolean {
        return this.data["simplanner-dateTime-enabled"];
    }

    setDateTimeEnabled(value: boolean): void {
        this.data["simplanner-dateTime-enabled"] = value;
        this.syncToServer();
    }

    getZenMode(): boolean {
        return this.data["simplanner-zen-mode"];
    }

    setZenMode(value: boolean): void {
        this.data["simplanner-zen-mode"] = value;
        this.syncToServer();
    }

    getProjectGroupable(): boolean {
        return this.data["simplanner-project-groupable"];
    }

    setProjectGroupable(value: boolean): void {
        this.data["simplanner-project-groupable"] = value;
        this.syncToServer();
    }

    // ========== Projects ==========

    getAllProjects(): string[] {
        const tasks = this.data["simplanner-tasks"];
        const projects: string[] = [];
        tasks.forEach((task: any) => {
            if (task.project && !projects.includes(task.project)) {
                projects.push(task.project);
            }
        });
        return projects;
    }

    getProjectColors(): Record<string, string> {
        return this.data["simplanner-project-colors"];
    }

    setProjectColor(project: string | number, color: string): void {
        this.data["simplanner-project-colors"] = {
            ...this.data["simplanner-project-colors"],
            [String(project)]: color
        };
        // Force sync by resetting the last synced hash
        this.lastSyncedHash = "";
        this.syncToServer();
    }

    removeProjectColor(project: string): void {
        delete this.data["simplanner-project-colors"][project];
        this.syncToServer();
    }

    getProjectFilter(): string | null {
        return this.data["simplanner-project-filter"];
    }

    setProjectFilter(value: string | null): void {
        this.data["simplanner-project-filter"] = value;
        this.syncToServer();
    }

    // ========== Themes ==========

    getIconTheme(): string {
        return this.data["simplanner-icon-theme"];
    }

    setIconTheme(theme: string): void {
        this.data["simplanner-icon-theme"] = theme;
        this.syncToServer();
    }

    // ========== UI State ==========

    getActiveTab(): string | null {
        return this.data["simplanner-config-tab"];
    }

    setActiveTab(index: number): void {
        this.data["simplanner-config-tab"] = String(index);
        this.syncToServer();
    }

    // ========== Tasks ==========

    getTasks(): any[] {
        return this.data["simplanner-tasks"];
    }

    async setTasks(tasks: any[]): Promise<void> {
        this.data["simplanner-tasks"] = tasks;
        this.syncToServer();
    }

    /**
     * Effettua il logout: rimuove il token e pulisce i dati
     */
    logout(): void {
        console.log("Logging out...");
        this.accessToken = null;
        localStorage.removeItem('simplanner-access-token');

        // Pulisci tutti i dati locali
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('simplanner-')) {
                localStorage.removeItem(key);
            }
        });

        // Reset dei dati in memoria
        this.data = {
            "simplanner-tasks": [],
            "simplanner-project-colors": {},
            "simplanner-show-text": false,
            "simplanner-icon-theme": "light",
            "simplanner-show-expired": false,
            "simplanner-dateTime-enabled": false,
            "simplanner-zen-mode": false,
            "simplanner-project-filter": null,
            "simplanner-project-groupable": false,
            "simplanner-config-tab": "1"
        };

        this.lastSyncedHash = "";
        this.isDataLoaded = false;
    }
}

export default new AjaxRepository();
