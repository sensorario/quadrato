import React from "react";

const PayIcon = ({ style = {} }: { style?: React.CSSProperties }) => (
    <svg width="18" height="18" viewBox="0 0 18 18" style={{ verticalAlign: 'middle', ...style }} aria-label="pay">
        <circle cx="9" cy="9" r="7.5" fill="#f5c542" stroke="#c99a1c" strokeWidth="1" />
        <circle cx="9" cy="9" r="5.5" fill="none" stroke="#c99a1c" strokeWidth="0.6" />
        <path
            d="M11 6.6 C10.6 6 9.9 5.8 9 5.8 C7.9 5.8 7.1 6.4 7.1 7.3 C7.1 9.3 11 8.5 11 10.6 C11 11.5 10.1 12.2 9 12.2 C8 12.2 7.3 11.9 6.9 11.3"
            fill="none" stroke="#8a6508" strokeWidth="1.2" strokeLinecap="round"
        />
        <line x1="9" y1="4.5" x2="9" y2="13.5" stroke="#8a6508" strokeWidth="1" strokeLinecap="round" />
    </svg>
);

export default PayIcon;
