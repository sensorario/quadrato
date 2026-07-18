type Task = {
    id: number;
    archived?: boolean;
    [key: string]: any;
};

type PersistArchivedTasksProps = {
    originalTasks: Task[];
    updatedTasks: Task[];
    token: string | null;
};

// Persiste solo ciò che è effettivamente cambiato (task archiviati + eventuali
// rinnovi periodici), senza risincronizzare l'intera configurazione/tutti i task.
export const persistArchivedTasks = async ({ originalTasks, updatedTasks, token }: PersistArchivedTasksProps) => {
    const originalById = new Map(originalTasks.map(t => [t.id, t]));
    const headers = {
        authorization: token,
        'Content-Type': 'application/json',
    };

    const newlyArchived = updatedTasks.filter(t => {
        const original = originalById.get(t.id);
        return original !== undefined && t.archived && !original.archived;
    });
    const newlyCreated = updatedTasks.filter(t => !originalById.has(t.id));

    await Promise.all([
        ...newlyArchived.map(task =>
            fetch(`https://api.simonegentili.com/quadrato/task/${task.id}`, {
                method: 'PUT',
                body: JSON.stringify({ archived: true }),
                headers,
            })
        ),
        ...newlyCreated.map(task =>
            fetch('https://api.simonegentili.com/quadrato/task', {
                method: 'POST',
                body: JSON.stringify(task),
                headers,
            })
        ),
    ]);
};
