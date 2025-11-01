import { getConfig } from "@testing-library/react";
import React from "react";
import { useState } from "react";
import { getConfigRepository } from "../repositories";


export const TabbedContent = ({ panels }: { panels: { title: string; content: React.ReactNode }[] }) => {
    const [activeTab, setActiveTab] = useState(() => {
        return getConfigRepository().getActiveTab() ?? 0;
    });

    const handleTabChange = (index: React.SetStateAction<number>) => {
        setActiveTab(index);
        getConfigRepository().setActiveTab(index);
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