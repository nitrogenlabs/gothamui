import {Listbox, ListboxButton, ListboxOptions} from '@headlessui/react';
import {fireEvent, render, screen} from '@testing-library/react';

import {SelectOption} from './SelectOption.js';

test('renders option media and forwards string values through the listbox', () => {
  const onChange = vi.fn();
  render(<Listbox defaultValue="42" onChange={onChange}>
    <ListboxButton>Choose status</ListboxButton>
    <ListboxOptions static>
      <SelectOption option={{icon: 'check', id: 'ready', image: '/ready.png', label: 'Ready', value: 42}} />
      <SelectOption option={{label: 'Pending', value: false}} />
    </ListboxOptions>
  </Listbox>);

  const ready = screen.getByRole('option', {name: 'Ready'});

  expect(ready).toHaveAttribute('aria-selected', 'true');
  expect(ready.querySelector('img')).toHaveAttribute('src', '/ready.png');
  expect(ready.querySelector('img')).toHaveAttribute('alt', '');
  expect(ready.querySelector('svg')).toBeInTheDocument();
  expect(screen.getByRole('option', {name: 'Pending'}).querySelector('img')).toBeNull();

  fireEvent.click(screen.getByRole('option', {name: 'Pending'}));

  expect(onChange).toHaveBeenCalledWith('false');
  expect(screen.getByRole('option', {name: 'Pending'})).toHaveAttribute('aria-selected', 'true');
});
