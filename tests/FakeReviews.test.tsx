/* eslint-disable no-undef */
import React from 'react';
import { render, screen } from '@testing-library/react';
import FakeReviews from '../src/components/FakeReviews';

describe('FakeReviews', () => {
    it('renders three fake reviews with the fake review badge', () => {
        render(<FakeReviews />);

        expect(screen.getAllByText('Recensione finta')).toHaveLength(3);
    });

    it('explicitly states in the review text that it is fake', () => {
        render(<FakeReviews />);

        expect(screen.getByText(/completamente inventata/)).toBeInTheDocument();
    });
});
