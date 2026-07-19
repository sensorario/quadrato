import React from 'react';

export const STATUS_CHECKED = [
    <svg width="18" height="18" style={{ verticalAlign: 'middle' }} key="checked-todo">
        <rect x="1" y="1" width="16" height="16" fill="#fff" stroke="#5480e6" strokeWidth="1" rx="3" />
    </svg>,
    <svg width="18" height="18" style={{ verticalAlign: 'middle' }} key="checked-progress">
        <rect x="1" y="1" width="16" height="16" fill="#fff" stroke="#5480e6" strokeWidth="1" rx="3" />
        <circle cx="9" cy="9" r="3" fill="#5480e6" />
    </svg>,
    <svg width="18" height="18" style={{ verticalAlign: 'middle' }} key="checked-done">
        <rect x="1" y="1" width="16" height="16" fill="#fff" stroke="#5480e6" strokeWidth="1" rx="3" />
        <polyline points="5,10 9,14 14,5" fill="none" stroke="#3cae82" strokeWidth="1.5" />
    </svg>,
    <svg width="18" height="18" style={{ verticalAlign: 'middle' }} key="checked-skipped">
        <rect x="1" y="1" width="16" height="16" fill="#7c8aa8" stroke="#7c8aa8" strokeWidth="1" rx="3" />
    </svg>
];
