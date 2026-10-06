/* eslint-disable no-undef */
import React from 'react';
import { render, screen } from '@testing-library/react';
import TaskTitle from '../src/components/TaskTitle';

describe('TaskTitle', () => {
    it('replaces the [BUG] prefix with the bug icon', () => {
        render(<TaskTitle title="[BUG] Fix login crash" />);
        expect(screen.getByLabelText('bug')).toBeInTheDocument();
        expect(screen.getByText('Fix login crash')).toBeInTheDocument();
        expect(screen.queryByText(/\[BUG\]/)).not.toBeInTheDocument();
    });

    it('renders a title without prefix as plain text, with no icon', () => {
        const { container } = render(<TaskTitle title="Just a task" />);
        expect(screen.getByText('Just a task')).toBeInTheDocument();
        expect(container.querySelector('[aria-label]')).toBeNull();
    });
});
