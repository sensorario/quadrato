import { getConfigRepository } from '../repositories';

interface TaskProjectSelectorProps {
    tasks: any[],
    projectFilter: string | null,
    setProjectFilter: (val: string | null) => void
}

const TaskProjectSelector = ({ tasks, projectFilter, setProjectFilter }: TaskProjectSelectorProps) => {
    tasks = tasks.filter(t => !t.archived);

    return tasks.some((t: { project: string }) => t.project) && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span
                style={{ textDecoration: projectFilter === 'ALL' ? 'underline' : 'none', cursor: 'pointer', color: '#444' }}
                onClick={() => setProjectFilter('ALL')}
            >
                tutti i task
            </span>
            <span
                style={{ textDecoration: projectFilter === null ? 'underline' : 'none', cursor: 'pointer', color: '#444' }}
                onClick={() => setProjectFilter(null)}
            >
                nessun progetto
            </span>
            {[...new Set(tasks.filter(t => t.project).map((t: { project: string }) => t.project))].map((proj: any) => (
                <span
                    key={proj}
                    style={{ textDecoration: projectFilter === proj ? 'underline' : 'none', cursor: 'pointer', color: '#444' }}
                    onClick={() => {
                        const newValue = projectFilter === proj ? null : proj;
                        const token = localStorage.getItem('simplanner-access-token');
                        const repository = getConfigRepository();

                        // Recupera tutte le configurazioni correnti
                        const allConfig = {
                            "simplanner-tasks": repository.getTasks(),
                            "simplanner-project-colors": repository.getProjectColors(),
                            "simplanner-show-text": repository.getShowText(),
                            "simplanner-icon-theme": repository.getIconTheme(),
                            "simplanner-show-expired": repository.getShowExpired(),
                            "simplanner-dateTime-enabled": repository.getDateTimeEnabled(),
                            "simplanner-zen-mode": repository.getZenMode(),
                            "simplanner-project-filter": newValue, // Sovrascrivi solo questo
                            "simplanner-project-groupable": repository.getProjectGroupable(),
                            "simplanner-config-tab": repository.getConfigTab()
                        };

                        // Invia PUT con tutte le configurazioni
                        const url = 'https://api.simonegentili.com/quadrato/data';
                        const options = {
                            method: 'PUT',
                            headers: {
                                'authorization': token || '',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(allConfig)
                        };

                        fetch(url, options)
                            .then(res => res.json())
                            .then(json => {
                                console.log('Configurazioni aggiornate:', json);
                            })
                            .catch(err => {
                                console.error('Errore aggiornamento configurazioni:', err);
                            });

                        // Aggiorna lo stato locale
                        setProjectFilter(newValue);
                    }}
                >
                    {proj}
                </span>
            ))}
        </div>
    )
}

export default TaskProjectSelector;