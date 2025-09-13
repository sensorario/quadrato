import React from 'react';

export const STATUS_ENUM = {
    TODO: 0,
    IN_PROGRESS: 1,
    DONE: 2,
    SKIPPED: 3
};

export const STATUS_DEFAULT = [
    <svg width="18" height="18" style={{ verticalAlign: 'middle' }} key="square-todo">
        <rect x="1" y="1" width="16" height="16" fill="white" stroke="black" strokeWidth="2" rx="3" />
    </svg>,
    <svg width="18" height="18" style={{ verticalAlign: 'middle' }} key="square-progress">
        <rect x="1" y="1" width="16" height="16" fill="white" stroke="black" strokeWidth="2" rx="3" />
        <circle cx="9" cy="9" r="3" fill="black" />
    </svg>,
    <svg width="18" height="18" style={{ verticalAlign: 'middle' }} key="square-done">
        <rect x="1" y="1" width="16" height="16" fill="white" stroke="black" strokeWidth="2" rx="3" />
        <line x1="5" y1="5" x2="13" y2="13" stroke="black" strokeWidth="2" />
        <line x1="13" y1="5" x2="5" y2="13" stroke="black" strokeWidth="2" />
    </svg>,
    <svg width="18" height="18" style={{ verticalAlign: 'middle' }} key="square-skipped">
        <rect x="1" y="1" width="16" height="16" fill="black" stroke="black" strokeWidth="2" rx="3" />
    </svg>
];

export const STATUS_CHECKED = [
    <svg width="18" height="18" style={{ verticalAlign: 'middle' }} key="checked-todo">
        <rect x="1" y="1" width="16" height="16" fill="white" stroke="black" strokeWidth="2" rx="3" />
    </svg>,
    <svg width="18" height="18" style={{ verticalAlign: 'middle' }} key="checked-progress">
        <rect x="1" y="1" width="16" height="16" fill="white" stroke="black" strokeWidth="2" rx="3" />
        <circle cx="9" cy="9" r="3" fill="black" />
    </svg>,
    <svg width="18" height="18" style={{ verticalAlign: 'middle' }} key="checked-done">
        <rect x="1" y="1" width="16" height="16" fill="white" stroke="black" strokeWidth="2" rx="3" />
        <polyline points="5,10 9,14 14,5" fill="none" stroke="green" strokeWidth="2" />
    </svg>,
    <svg width="18" height="18" style={{ verticalAlign: 'middle' }} key="checked-skipped">
        <rect x="1" y="1" width="16" height="16" fill="black" stroke="black" strokeWidth="2" rx="3" />
    </svg>
];

// Funzione per ottenere lo STATUS corretto
export function getStatusIcons(theme: 'default' | 'checked' = 'default') {
    return theme === 'checked' ? STATUS_CHECKED : STATUS_DEFAULT;
}