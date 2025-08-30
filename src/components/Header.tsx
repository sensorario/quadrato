import { useState } from "react";
import Toggle from "./Toggle";
import GearIcon from "./GearIcon";
import HelpIcon from "./HelpIcon";

export const Header = ({ setShowHelp, editable, setEditable }) => {
    const [showConfig, setShowConfig] = useState(false);
    return (
        <>
            <div className="header-bar">
                <h1 className="header-title">To do list</h1>
                <div className="header-icons">
                    <span className="help-icon" title="Shortcut info" onClick={() => setShowHelp(true)}>
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
            {showConfig && (
                <div className="modal-overlay" onClick={() => setShowConfig(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>Configurazioni</h2>
                        <Toggle
                            checked={editable}
                            onChange={setEditable}
                            label={editable ? "Modifica task: attivo" : "Modifica task: disattivo"}
                        />
                    </div>
                </div>
            )}
        </>
    );
};