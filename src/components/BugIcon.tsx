import React from "react";

const BugIcon = ({ style = {} }: { style?: React.CSSProperties }) => (
    <svg width="18" height="18" viewBox="0 0 18 18" style={{ verticalAlign: 'middle', ...style }} aria-label="bug">
        <g stroke="#c9505c" strokeWidth="1.2" strokeLinecap="round" fill="none">
            <path d="M6.5 3.2 L5 1.5" />
            <path d="M11.5 3.2 L13 1.5" />
            <path d="M4 8 L1.5 7" />
            <path d="M4 11 L1.5 11.5" />
            <path d="M4.5 14 L2.5 16" />
            <path d="M14 8 L16.5 7" />
            <path d="M14 11 L16.5 11.5" />
            <path d="M13.5 14 L15.5 16" />
        </g>
        <path d="M5.5 5.5 A3.5 2.5 0 0 1 12.5 5.5 Z" fill="#c9505c" />
        <ellipse cx="9" cy="11" rx="5" ry="5.5" fill="#ff97a0" />
        <line x1="9" y1="5.5" x2="9" y2="16.5" stroke="#c9505c" strokeWidth="1" />
        <circle cx="6.8" cy="9.5" r="1" fill="#c9505c" />
        <circle cx="11.2" cy="9.5" r="1" fill="#c9505c" />
        <circle cx="7" cy="13" r="0.8" fill="#c9505c" />
        <circle cx="11" cy="13" r="0.8" fill="#c9505c" />
    </svg>
);

export default BugIcon;
