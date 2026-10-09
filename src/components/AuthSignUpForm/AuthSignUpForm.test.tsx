import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {vi} from 'vitest';
import {z} from 'zod';

import {AuthSignUpForm} from './AuthSignUpForm.js';


const fill = (password = 'secret-password', confirm = password) => {
  fireEvent.change(screen.getByLabelText('Email'),{target:{value:'person@example.com'}});

  fireEvent.change(screen.getByLabelText('Password'),{target:{value:password}});

  fireEvent.change(screen.getByLabelText('Confirm password'),{target:{value:confirm}});
};


test('preserves default signup schema, strength and consent values',async () => {
  const submit = vi.fn();
  render(<AuthSignUpForm onSubmit={submit} />);


  expect(screen.getByRole('checkbox')).not.toBeChecked();


  fill('secret');
  fireEvent.submit(screen.getByTestId('form-sign-up'));

  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Use at least 8 characters.'));


  expect(screen.getByRole('alert')).toHaveTextContent('Accept the terms to create an account.');
  expect(submit).not.toHaveBeenCalled();

  expect(screen.getByRole('status',{name:'Password strength: Too short'})).toBeInTheDocument();


  fill('secret-password','different');
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.submit(screen.getByTestId('form-sign-up'));

  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Passwords must match.'));


  expect(submit).not.toHaveBeenCalled();


  fill();
  fireEvent.submit(screen.getByTestId('form-sign-up'));

  await waitFor(() => expect(submit).toHaveBeenCalledWith({acceptTerms:true,confirmPassword:'secret-password',email:'person@example.com',password:'secret-password'},expect.anything(),expect.any(Function)));
});


test('explicitly bypasses schema with short password and unchecked consent',async () => {
  const submit = vi.fn();
  render(<AuthSignUpForm onSubmit={submit} schema={null} showPasswordStrength={false} />);

  fill(' secret ');
  fireEvent.submit(screen.getByTestId('form-sign-up'));

  await waitFor(() => expect(submit).toHaveBeenCalledWith(expect.objectContaining({acceptTerms:false,confirmPassword:' secret ',password:' secret '}),expect.anything(),expect.any(Function)));


  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});


test('honors custom validation',async () => {
  const submit = vi.fn();
  const schema = z.object({acceptTerms:z.boolean(),confirmPassword:z.string(),email:z.literal('custom','Use custom'),password:z.string()});

  render(<AuthSignUpForm onSubmit={submit} schema={schema} />);
  fill();
  fireEvent.submit(screen.getByTestId('form-sign-up'));

  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Use custom'));


  expect(submit).not.toHaveBeenCalled();


  fireEvent.change(screen.getByLabelText('Email'),{target:{value:'custom'}});
  fireEvent.submit(screen.getByTestId('form-sign-up'));

  await waitFor(() => expect(submit).toHaveBeenCalledWith(expect.objectContaining({email:'custom'}),expect.anything(),expect.any(Function)));
});


test('composes direct rounded fields, consent description, options and error', () => {
  const rounded = {borderType:'rounded' as const,inputClass:'',labelClass:''};

  render(<AuthSignUpForm beforeSubmit={<p role="alert">Failure</p>} className="brand-form"
    fields={{confirmPassword:{...rounded,placeholder:'Repeat password'},email:{...rounded,autoComplete:undefined,placeholder:'Manager email'},password:{...rounded,placeholder:'New password'}}}
    fieldsClassName={null} name="brand-signup" onSubmit={vi.fn()} optionsClassName="brand-consent" optionsContent={<button type="button">View terms</button>}
    showPasswordStrength={false} submitClassName="brand-submit" submitLabel="Create account" submitVariant="contained"
    termsProps={{description:'Acceptance required',label:'Brand agreement'}} />);

  const form = screen.getByTestId('form-brand-signup');


  expect(form).toHaveClass('brand-form');


  const email = screen.getByPlaceholderText('Manager email');


  expect(email).not.toHaveAttribute('autocomplete');
  expect(email).not.toHaveClass('border-x-0');

  expect(email.closest('.flex.flex-col')?.parentElement).toBe(form);

  expect(screen.getByRole('checkbox',{name:'Brand agreement'})).toHaveAccessibleDescription('Acceptance required');

  expect(screen.getByRole('button',{name:'View terms'}).parentElement).toHaveClass('brand-consent');

  expect(screen.getByRole('alert').nextElementSibling).toBe(screen.getByRole('button',{name:'Create account'}));


  fill(' secret ');
  fireEvent.click(screen.getAllByRole('button',{name:'Show password'})[1]);


  expect(screen.getByLabelText('Confirm password')).toHaveAttribute('type','text');
  expect(screen.getByLabelText('Confirm password')).toHaveValue(' secret ');
});


test.each([true,false])('retains pending across async callback with loading=%s',async (loading) => {
  let finish!:() => void;
  const submit = vi.fn(() => new Promise<void>((resolve) => {
    finish = resolve;
  }));

  render(<AuthSignUpForm fieldsClassName="custom-fields" onSubmit={submit} pendingLabel="Creating" showSubmitLoading={loading} />);
  fill();
  fireEvent.click(screen.getByRole('checkbox'));

  const form = screen.getByTestId('form-sign-up');
  fireEvent.submit(form);

  await waitFor(() => expect(screen.getByRole('button',{name:'Creating'})).toBeDisabled());


  expect(Boolean(screen.getByRole('button',{name:'Creating'}).querySelector('.animate-spin'))).toBe(loading);


  fireEvent.submit(form);


  expect(submit).toHaveBeenCalledTimes(1);


  await act(async () => finish());
  await waitFor(() => expect(screen.getByRole('button',{name:'Sign Up'})).toBeEnabled());

  fireEvent.submit(form);
  await waitFor(() => expect(submit).toHaveBeenCalledTimes(2));
  await act(async () => finish());
});

