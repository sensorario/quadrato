import { useState } from "react";


export const TabbedContent = ({ panels }: { panels: { title: string; content: React.ReactNode }[] }) => {
    const [activeTab, setActiveTab] = useState(() => {
        const saved = localStorage.getItem('simplanner-config-tab');
        return saved ? Number(saved) : 0;
    });

    const handleTabChange = (index) => {
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

export default TabbedContent;