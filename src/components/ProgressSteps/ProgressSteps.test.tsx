/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/react';

import {ProgressSteps} from './ProgressSteps.js';

describe('ProgressSteps', () => {
  it('renders progress steps', () => {
    render(<ProgressSteps steps={[{id: 'Step 1', label: 'Details', status: 'current'}]} />);

    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Details')).toHaveAttribute('class', expect.stringContaining('text-foreground'));
  });
});

test('marks only the current step and supports linked and static steps', () => {
  const {rerender} = render(<ProgressSteps ariaLabel="Checkout" steps={[
    {href: '/details', label: 'Details', status: 'complete'},
    {href: '/payment', label: 'Payment', status: 'current'},
    {label: 'Review', status: 'upcoming'}
  ]} />);

  expect(screen.getByRole('navigation', {name: 'Checkout'})).toBeInTheDocument();
  expect(screen.getByRole('link', {name: /Details/})).not.toHaveAttribute('aria-current');
  expect(screen.getByRole('link', {name: /Payment/})).toHaveAttribute('aria-current', 'step');
  expect(screen.getByText('Step 3')).toHaveClass('text-muted-foreground');
  expect(screen.getByText('Review').parentElement).not.toHaveAttribute('aria-current');

  rerender(<ProgressSteps steps={[{label: 'Review', status: 'current'}]} />);

  expect(screen.getByRole('navigation', {name: 'Progress'})).toBeInTheDocument();
  expect(screen.getByText('Review').parentElement).toHaveAttribute('aria-current', 'step');
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
});
