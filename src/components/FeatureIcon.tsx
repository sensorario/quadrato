import React from "react";

const FeatureIcon = ({ style = {} }: { style?: React.CSSProperties }) => (
    <svg width="18" height="18" style={{ verticalAlign: 'middle', ...style }} aria-label="feature">
        <line x1="9" y1="1" x2="9" y2="17" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="1" y1="9" x2="17" y2="9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="4" y1="4" x2="14" y2="14" stroke="#000" strokeWidth="1" strokeLinecap="round" />
        <line x1="14" y1="4" x2="4" y2="14" stroke="#000" strokeWidth="1" strokeLinecap="round" />
    </svg>
);

export default FeatureIcon;
