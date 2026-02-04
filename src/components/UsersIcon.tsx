import React from 'react';

export const UsersIcon = () => {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            style={{ verticalAlign: 'middle', display: 'inline-block' }}
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="9" cy="9" r="3" fill="#f0f0f0" stroke="#888" strokeWidth="1" />
            <circle cx="16" cy="10" r="2.5" fill="#f0f0f0" stroke="#888" strokeWidth="1" />
            <path
                d="M4 18c0-2.6 3.1-4 5-4s5 1.4 5 4"
                fill="none"
                stroke="#888"
                strokeWidth="1"
                strokeLinecap="round"
            />
            <path
                d="M12 18c0-2 2.6-3.2 4.5-3.2 1.6 0 3.5.7 3.5 3.2"
                fill="none"
                stroke="#888"
                strokeWidth="1"
                strokeLinecap="round"
            />
        </svg>
    );
};

export default UsersIcon;
