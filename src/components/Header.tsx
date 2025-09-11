import { useState } from "react";
import Toggle from "./Toggle";
import GearIcon from "./GearIcon";
import HelpIcon from "./HelpIcon";

export const Header = ({
    tasks,
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
    setZenMode,
    handleThemeChange,
    iconTheme,
}) => {
    const [showConfig, setShowConfig] = useState(false);
    // Usa i task passati come prop

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

    const TogglePanel = () => {
        return (
            <div className="tab">
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
                        onChange={e => {
                            const val = Number(e.target.value);
                            setDaysRange(val);
                            localStorage.setItem('simplanner-days-range', JSON.stringify(val));
                        }}
                        style={{ marginLeft: '12px', verticalAlign: 'middle', width: '100%' }}
                    />
                    <span style={{ marginLeft: '12px', fontWeight: 500 }}>{daysRange} giorni</span>
                </div>
            </div>
        );
    };

    const ProjectPanel = () => {
        return tasks && tasks.length > 0 && (
            <div style={{ marginTop: '24px' }}>
                <strong>Progetti:</strong>
                <ul style={{ margin: '8px 0 0 0', padding: 0, listStyle: 'none' }}>
                    {Array.from(new Set(tasks
                        .map(t => t.project)
                        .filter(p => typeof p === 'string' && p.trim() !== '')))
                        .map((project, idx) => (
                            <li key={idx} style={{ padding: '2px 0', display: 'flex', alignItems: 'center' }}>
                                <span style={{ marginRight: '8px' }}>{String(project)}</span>
                                <input
                                    type="color"
                                    style={{ width: 24, height: 24, border: 'none', background: 'none', cursor: 'pointer' }}
                                    value={projectColors[String(project)] || '#000000'}
                                    onChange={e => handleColorChange(String(project), e.target.value)}
                                />
                            </li>
                        ))}
                </ul>
            </div>
        )
    };

    const ThemePanel = () => {
        return (
            <div>
                <strong>Tema icone:</strong>
                <div style={{ marginTop: '16px' }}>
                    <Toggle
                        checked={iconTheme === 'default'}
                        onChange={() => handleThemeChange('default')}
                        label={"Tema di default"}
                    />
                    <Toggle
                        checked={iconTheme === 'checked'}
                        onChange={() => handleThemeChange('checked')}
                        label={"Stile con spunta"}
                    />
                </div>
            </div>
        );
    }

    const TabbedContent = ({ panels }: { panels: { content: React.ReactNode, title: string }[] }) => {
        const [activeTab, setActiveTab] = useState(() => {
            const saved = localStorage.getItem('simplanner-config-tab');
            return saved ? Number(saved) : 0;
        });

        const handleTabChange = (index: number) => {
            setActiveTab(index);
            localStorage.setItem('simplanner-config-tab', String(index));
        };

        return <div className="tabbed-content">
            <div className="tabs">
                {panels.map((panel, index) => (
                    <div className={`tab ${activeTab === index ? 'active' : ''}`} onClick={() => handleTabChange(index)} key={index}>
                        <span>{panel.title}</span>
                    </div>
                ))}
            </div>
            <div className="content">
                {panels.map((panel, index) => (
                    <div
                        key={index}
                        className={`tab-content${activeTab === index ? ' active' : ''}`}
                    >
                        {panel.content}
                    </div>
                ))}
            </div>
        </div>
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
                        <TabbedContent panels={[
                            { content: <TogglePanel />, title: "Generale" },
                            { content: <ProjectPanel />, title: "Progetti" },
                            { content: <ThemePanel />, title: "Tema" }
                        ]} />
                    </div>
                </div>
            )}
        </>
    );
};