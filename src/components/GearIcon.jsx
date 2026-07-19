import React from "react";

const GearIcon = ({ size = 24, style = {} }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        style={style}
    >
        <circle cx="16" cy="16" r="15" fill="#f3f7ff" stroke="#6f9cf7" strokeWidth="1" />
        <circle cx="16" cy="16" r="7" fill="#fff" stroke="#5480e6" strokeWidth="1" />
        {/* Rotellina semplificata: 8 denti */}
        {[...Array(8)].map((_, i) => {
            const angle = (i * 45) * Math.PI / 180;
            const x1 = 16 + Math.cos(angle) * 9;
            const y1 = 16 + Math.sin(angle) * 9;
            const x2 = 16 + Math.cos(angle) * 13;
            const y2 = 16 + Math.sin(angle) * 13;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5480e6" strokeWidth="1" />;
        })}
        <circle cx="16" cy="16" r="3" fill="#5480e6" />
    </svg>
);

export default GearIcon;
