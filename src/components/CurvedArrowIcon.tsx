import React from 'react';

const CurvedArrowIcon = () => (
    <svg width="40" height="26" viewBox="0 0 40 26" style={{ verticalAlign: 'middle' }}>
        <path
            d="M37 5 C 26 2, 16 21, 5 14"
            stroke="#e2727d"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
        />
        <path
            d="M11 10 L4 14 L9 20"
            stroke="#e2727d"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
    </svg>
);

export default CurvedArrowIcon;
