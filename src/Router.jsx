import { useState, useEffect } from 'react';

// Simple router component without external dependencies
export const Router = ({ children }) => {
    const [currentPath, setCurrentPath] = useState(window.location.pathname);

    useEffect(() => {
        const onLocationChange = () => {
            setCurrentPath(window.location.pathname);
        };

        // Listen to popstate event (browser back/forward)
        window.addEventListener('popstate', onLocationChange);

        return () => {
            window.removeEventListener('popstate', onLocationChange);
        };
    }, []);

    return children(currentPath);
};

// Navigate function to change routes
export const navigate = (path) => {
    window.history.pushState({}, '', path);
    // Dispatch a custom event to notify the router
    window.dispatchEvent(new PopStateEvent('popstate'));
};

// Link component
export const Link = ({ to, children, style, ...props }) => {
    const handleClick = (e) => {
        e.preventDefault();
        navigate(to);
    };

    return (
        <a href={to} onClick={handleClick} style={style} {...props}>
            {children}
        </a>
    );
};
