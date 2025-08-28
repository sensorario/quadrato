export const STATUS_ENUM = {
    TODO: 0,
    IN_PROGRESS: 1,
    DONE: 2,
    SKIPPED: 3
};

export const STATUS = [
    <svg width="16" height="16" style={{ verticalAlign: 'middle' }} key="square-todo"><rect x="1" y="1" width="14" height="14" fill="white" stroke="black" strokeWidth="2" /></svg>,
    <svg width="16" height="16" style={{ verticalAlign: 'middle' }} key="square-progress">
        <rect x="1" y="1" width="14" height="14" fill="white" stroke="black" strokeWidth="2" />
        <circle cx="8" cy="8" r="3" fill="black" />
    </svg>,
    <svg width="16" height="16" style={{ verticalAlign: 'middle' }} key="square-done">
        <rect x="1" y="1" width="14" height="14" fill="white" stroke="black" strokeWidth="2" />
        <line x1="4" y1="4" x2="12" y2="12" stroke="black" strokeWidth="2" />
        <line x1="12" y1="4" x2="4" y2="12" stroke="black" strokeWidth="2" />
    </svg>,
    <svg width="16" height="16" style={{ verticalAlign: 'middle' }} key="square-skipped"><rect x="1" y="1" width="14" height="14" fill="black" stroke="black" strokeWidth="2" /></svg>
];