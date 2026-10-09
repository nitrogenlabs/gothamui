import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {vi} from 'vitest';
import {z} from 'zod';

import {AuthSignInForm} from './AuthSignInForm.js';


const fill = (email = 'person@example.com', password = 'secret') => {
  fireEvent.change(screen.getByLabelText('Email'), {target: {value: email}});

  fireEvent.change(screen.getByLabelText('Password'), {target: {value: password}});
};


test('preserves default validation and remembered email values', async () => {
  const submit = vi.fn();
  render(<AuthSignInForm defaultEmail="saved@example.com" onSubmit={submit} />);


  expect(screen.getByLabelText('Email')).toHaveValue('saved@example.com');

  expect(screen.getByRole('checkbox', {name:'Remember me'})).toBeChecked();


  fill('bad', '');
  fireEvent.submit(screen.getByTestId('form-sign-in'));

  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email address.'));


  expect(submit).not.toHaveBeenCalled();

  expect(screen.getByRole('alert')).toHaveTextContent('Enter your password.');


  fill();
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.submit(screen.getByTestId('form-sign-in'));

  await waitFor(() => expect(submit).toHaveBeenCalledWith({email:'person@example.com', password:'secret', rememberEmail:false}, expect.anything(), expect.any(Function)));
});


test('bypasses schema explicitly and removes the remember row', async () => {
  const submit = vi.fn();
  render(<AuthSignInForm onSubmit={submit} schema={null} showRememberEmail={false} />);

  fill('not-an-email', ' secret ');
  fireEvent.submit(screen.getByTestId('form-sign-in'));

  await waitFor(() => expect(submit).toHaveBeenCalledWith({email:'not-an-email', password:' secret ', rememberEmail:false}, expect.anything(), expect.any(Function)));


  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});


test('honors a custom schema rather than the default', async () => {
  const submit = vi.fn();
  const schema = z.object({email:z.literal('custom', 'Use custom'), password:z.string(), rememberEmail:z.boolean()});

  render(<AuthSignInForm onSubmit={submit} schema={schema} />);
  fill('person@example.com');
  fireEvent.submit(screen.getByTestId('form-sign-in'));

  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Use custom'));


  expect(submit).not.toHaveBeenCalled();


  fill('custom');
  fireEvent.submit(screen.getByTestId('form-sign-in'));

  await waitFor(() => expect(submit).toHaveBeenCalledWith(expect.objectContaining({email:'custom'}), expect.anything(), expect.any(Function)));
});


test('replaces field defaults and places direct fields, options and error before submit', () => {
  render(<AuthSignInForm beforeSubmit={<p role="alert">Failure</p>} className="brand-form"
    fields={{email:{autoComplete:undefined, borderColor:'black', borderType:'rounded', inputClass:'', labelClass:'', placeholder:'Manager email'}, password:{borderType:'rounded', inputClass:'', labelClass:''}}}
    fieldsClassName={null} name="brand" onSubmit={vi.fn()} optionsClassName="brand-options" optionsContent={<button type="button">Recovery</button>}
    showRememberEmail={false} submitClassName="brand-submit" submitLabel="Continue" submitVariant="contained" />);

  const form = screen.getByTestId('form-brand');


  expect(form).toHaveClass('brand-form');


  const email = screen.getByPlaceholderText('Manager email');


  expect(email).not.toHaveAttribute('autocomplete');

  expect(email).not.toHaveClass('border-x-0');
  expect(email.closest('.flex.flex-col')?.parentElement).toBe(form);


  const password = screen.getByLabelText('Password');
  fireEvent.change(password,{target:{value:' secret '}});

  fireEvent.click(screen.getByRole('button',{name:'Show password'}));


  expect(password).toHaveAttribute('type','text');
  expect(password).toHaveValue(' secret ');


  fireEvent.click(screen.getByRole('button',{name:'Hide password'}));


  expect(password).toHaveAttribute('type','password');

  expect(screen.getByRole('button',{name:'Recovery'}).parentElement).toHaveClass('brand-options');

  expect(screen.getByRole('alert').nextElementSibling).toBe(screen.getByRole('button',{name:'Continue'}));
});


test.each([true,false])('owns pending suppression and repeat submission with loading=%s', async (loading) => {
  let finish!: () => void;
  const submit = vi.fn(() => new Promise<void>((resolve) => {
    finish = resolve;
  }));

  render(<AuthSignInForm fieldsClassName="custom-fields" onSubmit={submit} pendingLabel="Working" showSubmitLoading={loading} />);
  fill();

  const form = screen.getByTestId('form-sign-in');
  fireEvent.submit(form);

  await waitFor(() => expect(screen.getByRole('button',{name:'Working'})).toBeDisabled());


  expect(Boolean(screen.getByRole('button',{name:'Working'}).querySelector('.animate-spin'))).toBe(loading);


  fireEvent.submit(form);


  expect(submit).toHaveBeenCalledTimes(1);


  await act(async () => finish());
  await waitFor(() => expect(screen.getByRole('button',{name:'Sign In'})).toBeEnabled());

  fireEvent.submit(form);
  await waitFor(() => expect(submit).toHaveBeenCalledTimes(2));
  await act(async () => finish());
});


test('omits null options when remember is hidden',() => {
  render(<AuthSignInForm onSubmit={vi.fn()} optionsContent={null} showRememberEmail={false} />);

  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  expect(screen.getByTestId('form-sign-in').children).toHaveLength(2);
});


test('hiding remember after mount submits false and preserves entered credentials and callback arguments', async () => {
  const submit = vi.fn();
  const {rerender} = render(<AuthSignInForm onSubmit={submit} />);
  fill();

  expect(screen.getByRole('checkbox')).toBeChecked();

  rerender(<AuthSignInForm onSubmit={submit} showRememberEmail={false} />);

  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Email')).toHaveValue('person@example.com');
  expect(screen.getByLabelText('Password')).toHaveValue('secret');

  fireEvent.submit(screen.getByTestId('form-sign-in'));
  await waitFor(() => expect(submit).toHaveBeenCalledWith({email: 'person@example.com', password: 'secret', rememberEmail: false}, expect.anything(), expect.any(Function)));
});
