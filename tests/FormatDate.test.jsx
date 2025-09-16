import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import FormatDate from '../src/components/FormatDate';


describe('FormatDate', () => {
    it('mostra solo orario se la data è oggi', () => {
        const now = new Date("3025-12-31T15:30:00Z");
        const iso = now.toISOString().slice(0, 16);
        render(<FormatDate date={iso} systemDate='3025-12-31' />);
        expect(screen.getByText(/15:30/)).toBeInTheDocument();
    });

    it('mostra "domani" se la data è il giorno dopo systemDate', () => {
        const now = new Date("3025-12-31T15:30:00Z");
        const iso = now.toISOString().slice(0, 16);
        render(<FormatDate date={iso} systemDate='3025-12-30' />);
        expect(screen.getByText(/domani/)).toBeInTheDocument();
    });

    it('mostra giorno/mese se la data è successiva a domani', () => {
        const now = new Date("3025-12-31T15:30:00Z");
        const iso = now.toISOString().slice(0, 16);
        render(<FormatDate date={iso} systemDate='3025-12-29' />);
        expect(screen.getByText(/31\/12/)).toBeInTheDocument();
    });

    it('mostra giorno/mese/anno se la data è nell\'anno successivo', () => {
        const now = new Date("3026-01-02T10:00:00Z");
        const iso = now.toISOString().slice(0, 16);
        render(<FormatDate date={iso} systemDate='3025-12-29' />);
        expect(screen.getByText(/02\/01\/3026/)).toBeInTheDocument();
    });
});