import {fireEvent, render, screen} from '@testing-library/react';

import {SidebarMenu} from './SidebarMenu.js';

test('requests controlled expansion and makes collapsed groups inert', () => {
  const onExpandedChange = vi.fn();
  const groups = [
    {content: <a href="/account">Profile</a>, id: 'account', label: 'Account'},
    {content: <a href="/help">Help</a>, id: 'help', label: 'Support'}
  ];
  const {rerender} = render(<SidebarMenu expandedId={null} groups={groups} onExpandedChange={onExpandedChange} />);
  const account = screen.getByRole('button', {name: 'Account'});
  const panel = document.getElementById(account.getAttribute('aria-controls')!);

  expect(screen.getByRole('navigation', {name: 'Sidebar navigation'})).toBeInTheDocument();
  expect(panel).toHaveAttribute('inert');

  fireEvent.click(account);

  expect(onExpandedChange).toHaveBeenLastCalledWith('account');
  expect(account).toHaveAttribute('aria-expanded', 'false');

  rerender(<SidebarMenu expandedId="account" groups={groups} label="Settings" onExpandedChange={onExpandedChange} />);

  expect(screen.getByRole('navigation', {name: 'Settings'})).toBeInTheDocument();
  expect(account).toHaveAttribute('aria-expanded', 'true');
  expect(panel).not.toHaveAttribute('inert');

  screen.getByRole('link', {name: 'Profile'}).focus();
  fireEvent.click(account);

  expect(account).toHaveFocus();
  expect(onExpandedChange).toHaveBeenLastCalledWith(null);

  fireEvent.click(screen.getByRole('button', {name: 'Support'}));

  expect(onExpandedChange).toHaveBeenLastCalledWith('help');
});
