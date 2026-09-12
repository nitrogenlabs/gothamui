/* @vitest-environment jsdom */
/**
 * Copyright (c) 2021-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import '@testing-library/jest-dom/vitest';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {z} from 'zod';

import {Form} from './Form.js';

const testSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

describe('Form', () => {
  it('should not show errors at top by default', () => {
    render(
      <Form
        onSubmit={() => {}}
        schema={testSchema}
      >
        {(methods) => (
          <>
            <input {...methods.register('email')} defaultValue="invalid-email" />
            <input {...methods.register('password')} defaultValue="short" />
            <button type="submit">Submit</button>
          </>
        )}
      </Form>
    );

    // Should not show error list at top by default
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('should show errors at top when showErrors is true', async () => {
    render(
      <Form
        onSubmit={() => {}}
        schema={testSchema}
        showErrors={true}
      >
        {(methods) => (
          <>
            <input {...methods.register('email')} defaultValue="invalid-email" />
            <input {...methods.register('password')} defaultValue="short" />
            <button type="submit">Submit</button>
          </>
        )}
      </Form>
    );

    // Submit the form to trigger validation
    const submitButton = screen.getByRole('button', {name: 'Submit'});
    fireEvent.click(submitButton);

    // Should show error list at top when prop is true
    await waitFor(() => {
      expect(screen.getByRole('list')).toBeInTheDocument();
    });
  });

  it('submits parsed form values and supports server-side field errors', async () => {
    const onSubmit = vi.fn(async (_data, _event, setError) => {
      setError('email', {message: 'Email is already taken', type: 'server'});
    });

    render(
      <Form
        onSubmit={onSubmit}
        schema={testSchema}
        showErrors
      >
        {(methods) => (
          <>
            <input {...methods.register('email')} defaultValue="team@gothamui.dev" />
            <input {...methods.register('password')} defaultValue="password123" />
            <button type="submit">Submit</button>
          </>
        )}
      </Form>
    );

    fireEvent.click(screen.getByRole('button', {name: 'Submit'}));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(
      {
        email: 'team@gothamui.dev',
        password: 'password123'
      },
      expect.any(Object),
      expect.any(Function)
    ));
    expect(await screen.findByText('Email is already taken')).toBeInTheDocument();
  });

  it('provides default values and ignores disabled submissions', async () => {
    const onSubmit = vi.fn();

    render(
      <Form
        defaultValues={{email: 'team@gothamui.dev'}}
        disabled
        onSubmit={onSubmit}
      >
        {(methods) => (
          <>
            <input {...methods.register('email')} />
            <span>{String(methods.getValues().email)}</span>
            <button type="submit">Submit</button>
          </>
        )}
      </Form>
    );

    expect(screen.getByText('team@gothamui.dev')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Submit'}));

    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
  });

  it('renders externally supplied errors', () => {
    render(
      <Form
        errors={{email: {message: 'Email is invalid', type: 'manual'}}}
        onSubmit={() => {}}
        showErrors
      >
        <button type="submit">Submit</button>
      </Form>
    );

    expect(screen.getByText('Email is invalid')).toBeInTheDocument();
  });
});
