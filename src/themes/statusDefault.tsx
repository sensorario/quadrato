import React from 'react';

export const STATUS_DEFAULT = [
    <svg width="18" height="18" style={{ verticalAlign: 'middle' }} key="square-todo">
        <rect x="1" y="1" width="16" height="16" fill="#fff" stroke="#5480e6" strokeWidth="1" rx="3" />
    </svg>,
    <svg width="18" height="18" style={{ verticalAlign: 'middle' }} key="square-progress">
        <rect x="1" y="1" width="16" height="16" fill="#fff" stroke="#5480e6" strokeWidth="1" rx="3" />
        <circle cx="9" cy="9" r="3" fill="#5480e6" />
    </svg>,
    <svg width="18" height="18" style={{ verticalAlign: 'middle' }} key="square-done">
        <rect x="1" y="1" width="16" height="16" fill="#fff" stroke="#5480e6" strokeWidth="1" rx="3" />
        <line x1="5" y1="5" x2="13" y2="13" stroke="#3cae82" strokeWidth="1.5" />
        <line x1="13" y1="5" x2="5" y2="13" stroke="#3cae82" strokeWidth="1.5" />
    </svg>,
    <svg width="18" height="18" style={{ verticalAlign: 'middle' }} key="square-skipped">
        <rect x="1" y="1" width="16" height="16" fill="#7c8aa8" stroke="#7c8aa8" strokeWidth="1" rx="3" />
    </svg>
];
