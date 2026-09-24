/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import {vi} from 'vitest';

import {Tabs} from './Tabs.js';

const items = [
  {id: 'account', label: 'Account'},
  {current: true, id: 'team', label: 'Team'},
  {id: 'billing', label: 'Billing'}
];

describe('Tabs', () => {
  it('renders tabs and handles button tabs', () => {
    const onTabChange = vi.fn();
    render(<Tabs items={items} onTabChange={onTabChange} />);

    fireEvent.click(screen.getByRole('button', {name: 'Billing'}));

    expect(screen.getByRole('button', {name: 'Team'})).toHaveAttribute('aria-current', 'page');
    expect(onTabChange).toHaveBeenCalledWith(items[2]);
    expect(screen.getByRole('button', {name: 'Billing'})).toHaveClass('cursor-pointer');
  });

  it('renders pill links and disabled tabs', () => {
    render(
      <Tabs
        items={[
          {current: true, href: '/overview', id: 'overview', label: 'Overview'},
          {disabled: true, id: 'settings', label: 'Settings'}
        ]}
        variant="pills"
      />
    );

    expect(screen.getByRole('link', {name: 'Overview'})).toHaveAttribute('href', '/overview');
    expect(screen.getByRole('button', {name: 'Settings'})).toBeDisabled();
  });

  it('handles mobile select tab changes', () => {
    const onTabChange = vi.fn();

    render(<Tabs items={items} onTabChange={onTabChange} />);

    fireEvent.change(screen.getByRole('combobox', {name: 'Tabs'}), {target: {value: 'account'}});

    expect(onTabChange).toHaveBeenCalledWith(items[0]);
  });
});
