import {memo} from 'react';

import {AuthSignInForm} from '../../components/AuthSignInForm/AuthSignInForm.js';
import {Link} from '../../components/Link/Link.js';
import {AuthView} from '../AuthView/AuthView.js';

import type {ReactNode} from 'react';
import type {AuthSignInValues} from '../../form/authTypes.js';
import type {AuthViewProps} from '../AuthView/AuthView.js';

export type {AuthSignInValues} from '../../form/authTypes.js';

export interface AuthSignInViewProps extends Omit<AuthViewProps, 'cardDescription' | 'cardTitle' | 'children' | 'onSubmit'> {
  readonly cardDescription?: ReactNode;
  readonly cardTitle?: ReactNode;
  readonly defaultEmail?: string;
  readonly error?: ReactNode;
  readonly forgotPasswordHref?: string;
  readonly onSubmit: (values: AuthSignInValues) => void | Promise<void>;
  readonly signUpHref?: string;
  readonly submitClassName?: string;
}

const AuthSignInViewComponent = ({
  cardDescription = 'Use your email and password to continue.',
  cardTitle = 'Sign in',
  defaultEmail = '',
  error,
  forgotPasswordHref = '/forgot-password',
  onSubmit,
  signUpHref = '/signup',
  submitClassName,
  ...authViewProps
}: AuthSignInViewProps) => (
  <AuthView cardDescription={cardDescription} cardTitle={cardTitle} {...authViewProps}>
    {error ? (
      <div className="mb-5 rounded-lg border border-error-300 bg-error-50 p-3 text-sm text-error-700" role="alert">
        {error}
      </div>
    ) : null}
    <AuthSignInForm
      defaultEmail={defaultEmail}
      onSubmit={onSubmit}
      optionsContent={<Link className="text-sm font-bold no-underline" href={forgotPasswordHref}>Forgot password?</Link>}
      submitClassName={submitClassName}
    />
    <p className="mb-0 mt-6 text-sm text-muted-foreground dark:text-muted-foreground-dark">
      New here? <Link className="font-bold no-underline" href={signUpHref}>Sign Up</Link>
    </p>
  </AuthView>
);

export const AuthSignInView = memo(AuthSignInViewComponent);
AuthSignInView.displayName = 'AuthSignInView';
