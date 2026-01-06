import React from "react";

export const Footer = ({ children }: { children: React.ReactNode }) => {
    return <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'right' }}>
        {children}
    </div>;
}

export default Footer;