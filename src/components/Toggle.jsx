import React from "react";

const Toggle = ({ checked, onChange, label, icons }) => (
    <label style={{ display: "flex", alignItems: "center", cursor: "pointer", margin: "1rem 0" }}>
        <span style={{ fontSize: "1rem", flex: 1 }}>{label}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {icons && <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>{icons.map((icon, idx) => <span key={idx}>{icon}</span>)}</span>}
            <span style={{ position: "relative", width: "40px", height: "24px", display: "inline-block" }}>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={e => onChange(e.target.checked)}
                    style={{ opacity: 0, width: "100%", height: "100%", position: "absolute", left: 0, top: 0, margin: 0, cursor: "pointer" }}
                />
                <span
                    style={{
                        display: "block",
                        width: "100%",
                        height: "100%",
                        background: checked ? "#666666ff" : "#ccc",
                        borderRadius: "12px",
                        transition: "background 0.2s",
                    }}
                ></span>
                <span
                    style={{
                        position: "absolute",
                        top: "2px",
                        left: checked ? "18px" : "2px",
                        width: "20px",
                        height: "20px",
                        background: "#fff",
                        borderRadius: "50%",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                        border: "none",
                        transition: "left 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {/* Icona stile grigio senza bordo */}
                    <svg width="18" height="18" viewBox="0 0 16 16" stroke="#888" strokeWidth="1" >
                        <circle cx="8" cy="8" r="7" fill="#f0f0f0" />
                    </svg>
                </span>
            </span>
        </span>
    </label>
);

export default Toggle;
