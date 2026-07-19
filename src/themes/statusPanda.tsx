import React from 'react';

export const STATUS_PANDA = [
    <svg width="18" height="18" style={{ verticalAlign: 'middle' }} key="panda-todo">
        <circle cx="9" cy="9" r="8" fill="#fff" stroke="#5480e6" strokeWidth="1" />
        <ellipse cx="4" cy="2" rx="2.5" ry="2" fill="#8f7fd1" transform="rotate(-20 4 2)" />
        <ellipse cx="14" cy="2" rx="2.5" ry="2" fill="#8f7fd1" transform="rotate(20 14 2)" />
    </svg>,
    <svg width="18" height="18" style={{ verticalAlign: 'middle' }} key="panda-progress">
        <circle cx="9" cy="9" r="8" fill="#fff" stroke="#5480e6" strokeWidth="1" />
        <ellipse cx="4" cy="2" rx="2.5" ry="2" fill="#8f7fd1" transform="rotate(-20 4 2)" />
        <ellipse cx="14" cy="2" rx="2.5" ry="2" fill="#8f7fd1" transform="rotate(20 14 2)" />
        <ellipse cx="9" cy="13" rx="2" ry="1" fill="#8f7fd1" />
    </svg>,
    <svg width="18" height="18" style={{ verticalAlign: 'middle' }} key="panda-done">
        <circle cx="9" cy="9" r="8" fill="#fff" stroke="#5480e6" strokeWidth="1" />
        <ellipse cx="4" cy="2" rx="2.5" ry="2" fill="#8f7fd1" transform="rotate(-20 4 2)" />
        <ellipse cx="14" cy="2" rx="2.5" ry="2" fill="#8f7fd1" transform="rotate(20 14 2)" />
        <circle cx="7" cy="10" r="1.7" fill="#8f7fd1" />
        <circle cx="11" cy="10" r="1.7" fill="#8f7fd1" />
        <ellipse cx="9" cy="13" rx="2" ry="1" fill="#8f7fd1" />
    </svg>,
    <svg width="18" height="18" style={{ verticalAlign: 'middle' }} key="panda-skipped">
        <circle cx="9" cy="9" r="8" fill="#7c8aa8" stroke="#7c8aa8" strokeWidth="1" />
    </svg>
];
