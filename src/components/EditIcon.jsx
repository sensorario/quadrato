import React from "react";

const EditIcon = ({ style = {} }) => (
    <svg
        width={16}
        height={16}
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        style={{ verticalAlign: 'middle', ...style }}
    >
        <rect x="2" y="15" width="16" height="3" rx="1.5" fill="#dbe6fb" />
        <path d="M14.5 3.5l2 2c.2.2.2.5 0 .7l-8.5 8.5-2.5.5.5-2.5L14 4.2c.2-.2.5-.2.7 0z" fill="#5480e6" />
    </svg>
);

export default EditIcon;
