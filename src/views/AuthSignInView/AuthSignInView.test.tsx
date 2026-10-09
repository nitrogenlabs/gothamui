/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {vi} from 'vitest';

import {AuthSignInView} from './AuthSignInView.js';


describe('AuthSignInView', () => {
  it('submits valid credentials and renders auth links', async () => {
    const onSubmit = vi.fn();

    render(
      <AuthSignInView
        description="Return to your workspace."
        forgotPasswordHref="/forgot"
        onSubmit={onSubmit}
        signUpHref="/signup"
        title="Welcome back."
      />
    );


    fireEvent.change(screen.getByRole('textbox', {name: 'Email'}), {target: {value: 'person@example.com'}});

    fireEvent.change(document.querySelector('input[name="password"]') as HTMLInputElement, {target: {value: 'secret-password'}});

    fireEvent.submit(screen.getByTestId('form-sign-in'));


    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      email: 'person@example.com',
      password: 'secret-password',
      rememberEmail: true
    }), expect.anything(), expect.any(Function)));


    expect(screen.getByRole('link', {name: 'Forgot password?'})).toHaveAttribute('href', '/forgot');

    expect(screen.getByRole('link', {name: 'Sign Up'})).toHaveAttribute('href', '/signup');
  });
});


test('retains default links, external errors and pending label', async () => {
  let finish!:() => void;
  const submit = vi.fn(() => new Promise<void>((resolve) => {
    finish = resolve;
  }));

  render(<AuthSignInView cardClassName="custom-card" cardDescription="Description" cardHeaderClassName="custom-header" cardTitle="Access"
    description="Marketing" error="Service unavailable" onSubmit={submit} submitClassName="custom-submit" title="Brand" />);

  const alert = screen.getByRole('alert');


  expect(alert).toHaveTextContent('Service unavailable');

  expect(alert.nextElementSibling).toBe(screen.getByTestId('form-sign-in'));


  fireEvent.change(screen.getByLabelText('Email'),{target:{value:'a@example.com'}});

  fireEvent.change(screen.getByLabelText('Password'),{target:{value:'secret-password'}});

  fireEvent.submit(screen.getByTestId('form-sign-in'));

  await waitFor(() => expect(screen.getByRole('button',{name:'Sign In'})).toBeDisabled());


  expect(screen.getByRole('button',{name:'Sign In'}).querySelector('.animate-spin')).not.toBeNull();


  await act(async () => finish());
  await waitFor(() => expect(screen.getByRole('button',{name:'Sign In'})).toBeEnabled());
});


test('retains package-default destinations',() => {
  render(<AuthSignInView description="Marketing" onSubmit={vi.fn()} title="Brand" />);


  expect(screen.getByRole('link',{name:'Forgot password?'})).toHaveAttribute('href','/forgot-password');
  expect(screen.getByRole('link',{name:'Sign Up'})).toHaveAttribute('href','/signup');
});
