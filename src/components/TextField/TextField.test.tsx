import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {TextField} from './TextField.js';

describe('TextField', () => {
  it('renders a labeled input and forwards changes', () => {
    const onChange = vi.fn();
    const onValidate = vi.fn();

    render(
      <TextField
        label="Email"
        name="email"
        onChange={onChange}
        onValidate={onValidate}
        pattern=".+@.+"
        placeholder="you@example.com"
      />
    );

    const input = screen.getByLabelText('Email');
    fireEvent.change(input, {target: {value: 'team@gothamui.dev'}});

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onValidate).toHaveBeenCalledWith(true);
    expect(input).toHaveValue('team@gothamui.dev');
  });

  it('toggles password visibility without changing the field value', () => {
    render(
      <TextField
        defaultValue="secret"
        label="Password"
        name="password"
        showPasswordToggle
        type="password"
      />
    );

    const input = screen.getByLabelText('Password');

    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveValue('secret');

    fireEvent.click(screen.getByRole('button', {name: 'Show password'}));

    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveValue('secret');
  });

  it('skips the password toggle when requested without changing input tab order or pointer behavior', async () => {
    const user = userEvent.setup();
    render(
      <>
        <TextField
          defaultValue="secret"
          label="Password"
          name="password"
          passwordToggleTabIndex={-1}
          showPasswordToggle
          // React supports tabIndex; the shared lint property table incorrectly rejects it.
          // eslint-disable-next-line react/no-unknown-property
          tabIndex={0}
          type="password"
        />
        <button type="submit">Sign Up</button>
      </>
    );

    const input = screen.getByLabelText('Password');
    const toggle = screen.getByRole('button', {name: 'Show password'});

    await user.tab();

    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('tabindex', '0');
    expect(input).not.toHaveAttribute('passwordToggleTabIndex');

    await user.tab();

    expect(screen.getByRole('button', {name: 'Sign Up'})).toHaveFocus();

    await user.click(toggle);

    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveValue('secret');

    await user.click(screen.getByRole('button', {name: 'Hide password'}));

    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveValue('secret');
  });

  it('keeps the password toggle keyboard accessible by default', async () => {
    const user = userEvent.setup();
    render(<TextField label="Password" name="password" showPasswordToggle type="password" />);

    await user.tab();

    expect(screen.getByLabelText('Password')).toHaveFocus();

    await user.tab();

    expect(screen.getByRole('button', {name: 'Show password'})).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
  });

  it('renders external errors', () => {
    render(<TextField error label="Name" name="name" />);

    expect(screen.getByText('Invalid input')).toBeInTheDocument();
  });
});
