import {fireEvent, render, screen} from '@testing-library/react';

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

  it('renders external errors', () => {
    render(<TextField error label="Name" name="name" />);

    expect(screen.getByText('Invalid input')).toBeInTheDocument();
  });
});
