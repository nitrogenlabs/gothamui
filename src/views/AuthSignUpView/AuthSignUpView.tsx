import {cn} from '@nlabs/utils';
import {memo} from 'react';
import {z} from 'zod';

import {Button} from '../../components/Button/Button.js';
import {Checkbox} from '../../components/Checkbox/Checkbox.js';
import {Form} from '../../components/Form/Form.js';
import {Link} from '../../components/Link/Link.js';
import {PasswordStrengthMeter} from '../../components/PasswordStrengthMeter/PasswordStrengthMeter.js';
import {TextField} from '../../components/TextField/TextField.js';
import {AuthView} from '../AuthView/AuthView.js';

import type {ReactNode} from 'react';
import type {AuthViewProps} from '../AuthView/AuthView.js';

export interface AuthSignUpValues extends Record<string, unknown> {
  readonly acceptTerms: boolean;
  readonly confirmPassword: string;
  readonly email: string;
  readonly password: string;
}

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

const authSignUpSchema = z.object({
  acceptTerms: z.boolean().refine(Boolean, 'Accept the terms to create an account.'),
  confirmPassword: z.string().min(1, 'Confirm your password.'),
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.')
}).refine(({confirmPassword, password}) => confirmPassword === password, {
  message: 'Passwords must match.',
  path: ['confirmPassword']
});

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
    <Form<AuthSignUpValues>
      className="grid"
      defaultValues={{acceptTerms: false, confirmPassword: '', email: '', password: ''}}
      name="sign-up"
      onSubmit={onSubmit}
      schema={authSignUpSchema}
      showErrors
    >
      {({formState, getValues}) => {
        const password = String(getValues().password || '');

        return (
          <>
            <div className="grid gap-3">
              <TextField
                autoComplete="email"
                borderColor="neutral"
                borderType="underline"
                inputClass="min-h-11 rounded-none border-x-0 border-t-0 bg-transparent px-0 text-base shadow-none"
                label="Email"
                labelClass="mb-1 text-sm font-bold"
                name="email"
                placeholder="you@example.com"
                type="email"
              />
              <TextField
                autoComplete="new-password"
                borderColor="neutral"
                borderType="underline"
                inputClass="min-h-11 rounded-none border-x-0 border-t-0 bg-transparent px-0 pr-11 text-base shadow-none"
                label="Password"
                labelClass="mb-1 text-sm font-bold"
                name="password"
                placeholder="Create a secure password"
                showPasswordToggle
                type="password"
              />
              <PasswordStrengthMeter password={password} />
              <TextField
                autoComplete="new-password"
                borderColor="neutral"
                borderType="underline"
                inputClass="min-h-11 rounded-none border-x-0 border-t-0 bg-transparent px-0 pr-11 text-base shadow-none"
                label="Confirm password"
                labelClass="mb-1 text-sm font-bold"
                name="confirmPassword"
                placeholder="Re-enter your password"
                showPasswordToggle
                type="password"
              />
            </div>
            <div className="my-3 flex flex-wrap items-center justify-between gap-3">
              <Checkbox label="I agree to the Terms and Conditions" name="acceptTerms" />
              <Link className="text-sm font-bold no-underline" href={termsHref}>Read terms</Link>
            </div>
            <Button
              className={submitClassName}
              disabled={formState.isSubmitting}
              isLoading={formState.isSubmitting}
              type="submit"
            >
              Sign Up
            </Button>
          </>
        );
      }}
    </Form>
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
