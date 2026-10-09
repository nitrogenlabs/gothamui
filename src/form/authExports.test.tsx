import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {vi} from 'vitest';

import * as components from '../../lib/components/index.js';
import * as form from '../../lib/form/index.js';
import * as root from '../../lib/index.js';

test('ships identical forms through all documented built entry points', async () => {
  expect(root.AuthSignInForm).toBe(components.AuthSignInForm);
  expect(root.AuthSignInForm).toBe(form.AuthSignInForm);
  expect(root.AuthSignUpForm).toBe(components.AuthSignUpForm);
  expect(root.AuthSignUpForm).toBe(form.AuthSignUpForm);

  const submit = vi.fn();
  render(<form.AuthSignInForm onSubmit={submit} schema={null} showRememberEmail={false} />);
  fireEvent.change(screen.getByLabelText('Email'), {target: {value: 'fixture@example.com'}});
  fireEvent.change(screen.getByLabelText('Password'), {target: {value: 'secret'}});
  fireEvent.submit(screen.getByTestId('form-sign-in'));
  await waitFor(() => expect(submit).toHaveBeenCalledWith({email: 'fixture@example.com', password: 'secret', rememberEmail: false}, expect.anything(), expect.any(Function)));
});


test('retains auth value types through built views and original view modules', () => {
  const directory = mkdtempSync(join(tmpdir(), 'gotham-auth-types-'));
  const filename = join(directory, 'compatibility.ts');
  const views = `${process.cwd()}/lib/views`;
  const source = `
    import type {AuthSignInValues, AuthSignUpValues} from '${views}/index.js';
    import type {AuthSignInValues as OriginalSignIn} from '${views}/AuthSignInView/AuthSignInView.js';
    import type {AuthSignUpValues as OriginalSignUp} from '${views}/AuthSignUpView/AuthSignUpView.js';
    const signIn: AuthSignInValues = {email: 'fixture@example.com', password: 'secret', rememberEmail: false};
    const signUp: AuthSignUpValues = {acceptTerms: true, confirmPassword: 'secret', email: 'fixture@example.com', password: 'secret'};
    const originalSignIn: OriginalSignIn = signIn;
    const originalSignUp: OriginalSignUp = signUp;
  `;

  try {
    writeFileSync(filename, source);
    const result = spawnSync(process.execPath, [
      `${process.cwd()}/node_modules/typescript/bin/tsc`,
      '--ignoreConfig', '--noEmit', '--skipLibCheck', '--strict', '--jsx', 'react-jsx',
      '--module', 'ESNext', '--moduleResolution', 'bundler', '--target', 'ES2022', filename
    ], {encoding: 'utf8'});

    expect({error: result.error, output: result.stdout + result.stderr, status: result.status}).toEqual({error: undefined, output: '', status: 0});
  } finally {
    rmSync(directory, {force: true, recursive: true});
  }
});
