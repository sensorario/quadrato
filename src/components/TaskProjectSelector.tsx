// Importa la versione da package.json (Vite/webpack supporta import json)
// @ts-ignore
import pkg from '../../package.json';
import { useTranslation } from 'react-i18next';

interface TaskProjectSelectorProps {
    projects: string[],
    projectFilter: string | null,
    setProjectFilter: (val: string | null) => void
}

const TaskProjectSelector = ({ projects, projectFilter, setProjectFilter }: TaskProjectSelectorProps) => {
    const { t } = useTranslation();

    return <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <span
                    style={{ textDecoration: projectFilter === 'ALL' ? 'underline' : 'none', cursor: 'pointer', color: '#444' }}
                    onClick={() => setProjectFilter('ALL')}
                >
                    {t('taskProjectSelector.allTasks')}
                </span>
                <span
                    style={{ textDecoration: projectFilter === null ? 'underline' : 'none', cursor: 'pointer', color: '#444' }}
                    onClick={() => setProjectFilter(null)}
                >
                    {t('taskProjectSelector.noProject')}
                </span>
            </div>
            <span style={{ fontSize: '0.8em', color: '#888' }}>v{pkg.version}</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', padding: '8px', flexWrap: 'wrap' }}>
            {projects.map((proj: string) => (
                <span
                    key={proj}
                    style={{ textDecoration: projectFilter === proj ? 'underline' : 'none', cursor: 'pointer', color: '#444' }}
                    onClick={() => {
                        const newValue = projectFilter === proj ? null : proj;
                        setProjectFilter(newValue);
                    }}
                >
                    {proj}
                </span>
            ))}
        </div>
    </div>
}

export default TaskProjectSelector;