import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import App from '../src/App.jsx';

describe('Home page', () => {
    it('should contain some strings', () => {
        render(<App />);
        expect(screen.getByText(/config/i)).toBeInTheDocument();
        expect(screen.getByText(/zen mode/i)).toBeInTheDocument();
        expect(screen.getByText(/help/i)).toBeInTheDocument();
        expect(screen.getByText(/aggiungi/i)).toBeInTheDocument();
        expect(screen.getByText(/archivia/i)).toBeInTheDocument();
    });
});
