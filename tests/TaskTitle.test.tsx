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

    it.each(['epic', 'chore', 'docs'])('replaces the [%s] prefix with its icon', (type) => {
        render(<TaskTitle title={`[${type}] Something to do`} />);
        expect(screen.getByLabelText(type).childElementCount).toBeGreaterThan(0);
        expect(screen.getByText('Something to do')).toBeInTheDocument();
    });

    it('leaves an unknown prefix in the title', () => {
        const { container } = render(<TaskTitle title="[epics] Not a type" />);
        expect(screen.getByText('[epics] Not a type')).toBeInTheDocument();
        expect(container.querySelector('[aria-label]')).toBeNull();
    });

    it('renders a title without prefix as plain text, with no icon', () => {
        const { container } = render(<TaskTitle title="Just a task" />);
        expect(screen.getByText('Just a task')).toBeInTheDocument();
        expect(container.querySelector('[aria-label]')).toBeNull();
    });
});
