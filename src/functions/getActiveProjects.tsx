type Task = {
    project?: string;
    archived?: boolean;
    [key: string]: any;
};

// Unico punto che decide cosa conta come "progetto attivo": un task non archiviato
// con un nome progetto non vuoto. Usato sia dal filtro progetti principale che dal
// pannello progetti nelle impostazioni, così restano sempre coerenti.
export const getActiveProjects = (tasks: Task[]): string[] => {
    return Array.from(new Set(
        tasks
            .filter(t => !t.archived)
            .map(t => t.project)
            .filter((p): p is string => typeof p === 'string' && p.trim() !== '')
    ));
};
