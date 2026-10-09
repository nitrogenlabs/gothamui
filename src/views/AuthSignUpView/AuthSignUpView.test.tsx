/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {vi} from 'vitest';

import {AuthSignUpView} from './AuthSignUpView.js';


describe('AuthSignUpView', () => {
  it('submits a valid account and renders related links', async () => {
    const onSubmit = vi.fn();

    render(
      <AuthSignUpView
        description="Create your workspace."
        onSubmit={onSubmit}
        resendVerificationHref="/verify/resend"
        signInHref="/sign-in"
        termsHref="/terms"
        title="Join us."
      />
    );


    fireEvent.change(screen.getByRole('textbox', {name: 'Email'}), {target: {value: 'person@example.com'}});

    fireEvent.change(document.querySelector('input[name="password"]') as HTMLInputElement, {target: {value: 'secret-password'}});

    fireEvent.change(document.querySelector('input[name="confirmPassword"]') as HTMLInputElement, {target: {value: 'secret-password'}});

    fireEvent.click(screen.getByRole('checkbox', {name: 'I agree to the Terms and Conditions'}));

    fireEvent.submit(screen.getByTestId('form-sign-up'));


    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      acceptTerms: true,
      confirmPassword: 'secret-password',
      email: 'person@example.com',
      password: 'secret-password'
    }), expect.anything(), expect.any(Function)));


    expect(screen.getByRole('link', {name: 'Read terms'})).toHaveAttribute('href', '/terms');

    expect(screen.getByRole('link', {name: 'Sign In'})).toHaveAttribute('href', '/sign-in');

    expect(screen.getByRole('link', {name: 'Resend verification'})).toHaveAttribute('href', '/verify/resend');
  });
});


test('retains default links, external errors and pending label', async () => {
  let finish!:() => void;
  const submit = vi.fn(() => new Promise<void>((resolve) => {
    finish = resolve;
  }));

  render(<AuthSignUpView cardClassName="custom-card" cardDescription="Description" cardHeaderClassName="custom-header" cardTitle="Access"
    description="Marketing" error="Service unavailable" onSubmit={submit} submitClassName="custom-submit" title="Brand" />);

  const alert = screen.getByRole('alert');


  expect(alert).toHaveTextContent('Service unavailable');

  expect(alert.nextElementSibling).toBe(screen.getByTestId('form-sign-up'));


  fireEvent.change(screen.getByLabelText('Email'),{target:{value:'a@example.com'}});

  fireEvent.change(screen.getByLabelText('Password'),{target:{value:'secret-password'}});
  fireEvent.change(screen.getByLabelText('Confirm password'), {target:{value:'secret-password'}});
  fireEvent.click(screen.getByRole('checkbox'));

  fireEvent.submit(screen.getByTestId('form-sign-up'));

  await waitFor(() => expect(screen.getByRole('button',{name:'Sign Up'})).toBeDisabled());


  expect(screen.getByRole('button',{name:'Sign Up'}).querySelector('.animate-spin')).not.toBeNull();


  await act(async () => finish());
  await waitFor(() => expect(screen.getByRole('button',{name:'Sign Up'})).toBeEnabled());
});


test('retains package-default destinations',() => {
  render(<AuthSignUpView description="Marketing" onSubmit={vi.fn()} title="Brand" />);


  expect(screen.getByRole('link',{name:'Read terms'})).toHaveAttribute('href','/terms');
  expect(screen.getByRole('link',{name:'Sign In'})).toHaveAttribute('href','/sign-in');
  expect(screen.queryByRole('link',{name:'Resend verification'})).not.toBeInTheDocument();
});
