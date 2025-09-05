import { useState } from "react";
import Toggle from "./Toggle";
import GearIcon from "./GearIcon";
import HelpIcon from "./HelpIcon";

export const Header = ({
    setShowHelp,
    editable,
    setEditable,
    projectEditable,
    setProjectEditable,
    dateTimeEnabled,
    setDateTimeEnabled,
    showExpired,
    setShowExpired,
    daysRange,
    setDaysRange,
    zenMode,
    setZenMode
}) => {
    const [showConfig, setShowConfig] = useState(false);
    // Recupera i task dal localStorage
    let tasks: any[] = [];
    try {
        const saved = localStorage.getItem('simplanner-tasks');
        tasks = saved ? JSON.parse(saved) : [];
    } catch (e) {
        tasks = [];
    }

    // Gestione colori progetti
    const [projectColors, setProjectColors] = useState(() => {
        try {
            const saved = localStorage.getItem('simplanner-project-colors');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    });

    const handleColorChange = (project: string, color: string) => {
        const newColors = { ...projectColors, [project]: color };
        setProjectColors(newColors);
        localStorage.setItem('simplanner-project-colors', JSON.stringify(newColors));
    };
    return (
        <>
            <div className="header-bar">
                <h1 className="header-title">To do list</h1>
                <div className="header-icons">
                    <Toggle
                        checked={zenMode}
                        onChange={setZenMode}
                        label={""}
                    />
                    <span onClick={() => setZenMode(!zenMode)} style={{ cursor: "pointer" }}>zen mode</span>
                    <span onClick={() => setShowHelp(true)}>
                        <HelpIcon />
                    </span>
                    <span onClick={() => setShowHelp(true)} style={{ cursor: "pointer" }}>
                        help
                    </span>
                    <span onClick={() => setShowConfig(true)} style={{ cursor: "pointer" }}>
                        <GearIcon />
                    </span>
                    <span onClick={() => setShowConfig(true)} style={{ cursor: "pointer" }}>
                        config
                    </span>
                </div>
            </div>
            {/** estrarre un componente modal da questo */}
            {showConfig && (
                <div className="modal-overlay" onClick={() => setShowConfig(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>Configurazioni</h2>
                        <Toggle
                            checked={editable}
                            onChange={setEditable}
                            label={"Modifica"}
                        />
                        <Toggle
                            checked={projectEditable}
                            onChange={setProjectEditable}
                            label={"Raggruppa"}
                        />
                        <Toggle
                            checked={dateTimeEnabled}
                            onChange={setDateTimeEnabled}
                            label={"Con scadenza"}
                        />
                        <Toggle
                            checked={showExpired}
                            onChange={setShowExpired}
                            label={"Mostra scaduti"}
                        />
                        <div style={{ margin: '16px 0', width: '100%', display: 'flex', alignItems: 'center' }}>
                            Giorni da mostrare:
                            <input
                                type="range"
                                id="daysRange"
                                min={0}
                                max={365}
                                value={daysRange}
                                onChange={e => setDaysRange(Number(e.target.value))}
                                style={{ marginLeft: '12px', verticalAlign: 'middle', width: '100%' }}
                            />
                            <span style={{ marginLeft: '8px', fontWeight: 500 }}>{daysRange}</span>
                        </div>
                        {/* Elenco dei progetti presenti nei task */}
                        {tasks.length > 0 && (
                            <div style={{ marginTop: '24px' }}>
                                <strong>Progetti:</strong>
                                <ul style={{ margin: '8px 0 0 0', padding: 0, listStyle: 'none' }}>
                                    {Array.from(new Set(tasks
                                        .map(t => t.project)
                                        .filter(p => p && p.trim() !== '')))
                                        .map((project, idx) => (
                                            <li key={idx} style={{ padding: '2px 0', display: 'flex', alignItems: 'center' }}>
                                                <span style={{ marginRight: '8px' }}>{String(project)}</span>
                                                <input
                                                    type="color"
                                                    style={{ width: 24, height: 24, border: 'none', background: 'none', cursor: 'pointer' }}
                                                    value={projectColors[project] || '#000000'}
                                                    onChange={e => handleColorChange(project, e.target.value)}
                                                />
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};