import React from "react";

const BugIcon = ({ style = {} }: { style?: React.CSSProperties }) => (
    <svg width="18" height="18" style={{ verticalAlign: 'middle', ...style }} aria-label="bug">
        <ellipse cx="9" cy="10" rx="5" ry="6" fill="#ff97a0" />
        <circle cx="9" cy="3" r="2.2" fill="#ff97a0" />
        <line x1="9" y1="5" x2="9" y2="15" stroke="#fff" strokeWidth="0.8" />
        <line x1="2" y1="7" x2="5" y2="6" stroke="#e2727d" strokeWidth="1" strokeLinecap="round" />
        <line x1="2" y1="10" x2="5" y2="10" stroke="#e2727d" strokeWidth="1" strokeLinecap="round" />
        <line x1="2" y1="13" x2="5" y2="14" stroke="#e2727d" strokeWidth="1" strokeLinecap="round" />
        <line x1="16" y1="7" x2="13" y2="6" stroke="#e2727d" strokeWidth="1" strokeLinecap="round" />
        <line x1="16" y1="10" x2="13" y2="10" stroke="#e2727d" strokeWidth="1" strokeLinecap="round" />
        <line x1="16" y1="13" x2="13" y2="14" stroke="#e2727d" strokeWidth="1" strokeLinecap="round" />
    </svg>
);

export default BugIcon;
