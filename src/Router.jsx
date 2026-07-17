import { useState, useEffect } from 'react';

// Subscriber set for path changes. Populated synchronously during render
// (not in an effect): effects run bottom-up on mount, so a descendant's
// mount-time effect can call navigate() before Router's own effect has
// registered its listener. Subscribing during render avoids that race,
// since React always renders Router before it renders its children.
const listeners = new Set();

const notify = () => {
    const path = window.location.pathname;
    listeners.forEach((listener) => listener(path));
};

if (typeof window !== 'undefined') {
    // Browser back/forward
    window.addEventListener('popstate', notify);
}

// Simple router component without external dependencies
export const Router = ({ children }) => {
    const [currentPath, setCurrentPath] = useState(window.location.pathname);

    listeners.add(setCurrentPath);

    useEffect(() => {
        return () => {
            listeners.delete(setCurrentPath);
        };
    }, []);

    return children(currentPath);
};

// Navigate function to change routes
export const navigate = (path) => {
    window.history.pushState({}, '', path);
    notify();
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
