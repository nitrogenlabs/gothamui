import {cn} from '@nlabs/utils';
import {memo} from 'react';

import {AuthSignUpForm} from '../../components/AuthSignUpForm/AuthSignUpForm.js';
import {Link} from '../../components/Link/Link.js';
import {AuthView} from '../AuthView/AuthView.js';

import type {ReactNode} from 'react';
import type {AuthSignUpValues} from '../../form/authTypes.js';
import type {AuthViewProps} from '../AuthView/AuthView.js';

export type {AuthSignUpValues} from '../../form/authTypes.js';

export interface AuthSignUpViewProps extends Omit<AuthViewProps, 'cardDescription' | 'cardTitle' | 'children' | 'onSubmit'> {
  readonly cardDescription?: ReactNode;
  readonly cardTitle?: ReactNode;
  readonly error?: ReactNode;
  readonly onSubmit: (values: AuthSignUpValues) => void | Promise<void>;
  readonly resendVerificationHref?: string;
  readonly signInHref?: string;
  readonly submitClassName?: string;
  readonly termsHref?: string;
}

const AuthSignUpViewComponent = ({
  cardClassName,
  cardDescription = 'Use your email and create a secure password.',
  cardHeaderClassName,
  cardTitle = 'Create account',
  error,
  onSubmit,
  resendVerificationHref,
  signInHref = '/sign-in',
  submitClassName,
  termsHref = '/terms',
  ...authViewProps
}: AuthSignUpViewProps) => (
  <AuthView
    cardClassName={cn('min-[601px]:!p-6', cardClassName)}
    cardDescription={cardDescription}
    cardHeaderClassName={cn('!mb-4 !pb-3 min-[601px]:!mb-5 min-[601px]:!pb-4', cardHeaderClassName)}
    cardTitle={cardTitle}
    {...authViewProps}>
    {error ? (
      <div className="mb-5 rounded-lg border border-error-300 bg-error-50 p-3 text-sm text-error-700" role="alert">
        {error}
      </div>
    ) : null}
    <AuthSignUpForm
      onSubmit={onSubmit}
      optionsContent={<Link className="text-sm font-bold no-underline" href={termsHref}>Read terms</Link>}
      submitClassName={submitClassName}
    />
    <p className="mb-0 mt-4 text-sm text-muted-foreground dark:text-muted-foreground-dark">
      Already a member? <Link className="font-bold no-underline" href={signInHref}>Sign In</Link>
    </p>
    {resendVerificationHref ? (
      <p className="mb-0 mt-2 text-sm text-muted-foreground dark:text-muted-foreground-dark">
        Need a new code? <Link className="font-bold no-underline" href={resendVerificationHref}>Resend verification</Link>
      </p>
    ) : null}
  </AuthView>
);

export const AuthSignUpView = memo(AuthSignUpViewComponent);
AuthSignUpView.displayName = 'AuthSignUpView';
