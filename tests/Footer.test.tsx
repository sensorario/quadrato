import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import Footer from '../src/components/Footer';

describe('Footer showIconText', () => {
  it('shows text when showIconText is true', () => {
    render(<Footer showText={true} setShowPopup={() => { }} setShowCleanConfirm={() => { }} />);
    expect(screen.getByText('aggiungi')).toBeInTheDocument();
    expect(screen.getByText('archivia')).toBeInTheDocument();
  });

  it('does not show text when showIconText is false', () => {
    render(<Footer showText={false} setShowPopup={() => { }} setShowCleanConfirm={() => { }} />);
    expect(screen.queryByText('aggiungi')).not.toBeInTheDocument();
    expect(screen.queryByText('archivia')).not.toBeInTheDocument();
  });
});
