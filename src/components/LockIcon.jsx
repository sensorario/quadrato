import React from "react";

const LockIcon = ({ style = {} }) => (
    <svg
        width={16}
        height={16}
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        style={{ verticalAlign: 'middle', ...style }}
    >
        <rect x="4" y="9" width="12" height="9" rx="1.5" fill="#dbe6fb" />
        <path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" fill="none" stroke="#7c8aa8" strokeWidth="1.6" />
    </svg>
);

export default LockIcon;
