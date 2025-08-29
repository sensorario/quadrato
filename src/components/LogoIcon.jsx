import React from "react";

const LogoIcon = ({ size = 32, style = {} }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        style={style}
    >
        <rect x="8" y="8" width="16" height="16" fill="#fff" stroke="#444" strokeWidth="2" />
        <line x1="8" y1="8" x2="24" y2="24" stroke="#000000ff" strokeWidth="2" />
        <line x1="24" y1="8" x2="8" y2="24" stroke="#000000ff" strokeWidth="2" />
    </svg>
);

export default LogoIcon;
