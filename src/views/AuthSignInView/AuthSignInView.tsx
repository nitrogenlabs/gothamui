import {memo} from 'react';
import {z} from 'zod';

import {Button} from '../../components/Button/Button.js';
import {Checkbox} from '../../components/Checkbox/Checkbox.js';
import {Form} from '../../components/Form/Form.js';
import {Link} from '../../components/Link/Link.js';
import {TextField} from '../../components/TextField/TextField.js';
import {AuthView} from '../AuthView/AuthView.js';

import type {ReactNode} from 'react';
import type {AuthViewProps} from '../AuthView/AuthView.js';

export interface AuthSignInValues extends Record<string, unknown> {
  readonly email: string;
  readonly password: string;
  readonly rememberEmail: boolean;
}

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

const authSignInSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
  rememberEmail: z.boolean()
});

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
    <Form<AuthSignInValues>
      className="grid"
      defaultValues={{email: defaultEmail, password: '', rememberEmail: true}}
      name="sign-in"
      onSubmit={onSubmit}
      schema={authSignInSchema}
      showErrors
    >
      {({formState}) => (
        <>
          <div className="grid gap-7 max-[600px]:gap-6">
            <TextField
              autoComplete="email"
              borderColor="neutral"
              borderType="underline"
              inputClass="min-h-12 rounded-none border-x-0 border-t-0 bg-transparent px-0 text-base shadow-none"
              label="Email"
              labelClass="mb-2 text-sm font-bold"
              name="email"
              placeholder="you@example.com"
              type="email"
            />
            <TextField
              autoComplete="current-password"
              borderColor="neutral"
              borderType="underline"
              inputClass="min-h-12 rounded-none border-x-0 border-t-0 bg-transparent px-0 pr-11 text-base shadow-none"
              label="Password"
              labelClass="mb-2 text-sm font-bold"
              name="password"
              placeholder="Your password"
              showPasswordToggle
              type="password"
            />
          </div>
          <div className="my-5 flex items-center justify-between gap-4">
            <Checkbox defaultValue label="Remember me" name="rememberEmail" />
            <Link className="text-sm font-bold no-underline" href={forgotPasswordHref}>Forgot password?</Link>
          </div>
          <Button
            className={submitClassName}
            disabled={formState.isSubmitting}
            isLoading={formState.isSubmitting}
            type="submit"
          >
            Sign In
          </Button>
        </>
      )}
    </Form>
    <p className="mb-0 mt-6 text-sm text-muted-foreground dark:text-muted-foreground-dark">
      New here? <Link className="font-bold no-underline" href={signUpHref}>Sign Up</Link>
    </p>
  </AuthView>
);

export const AuthSignInView = memo(AuthSignInViewComponent);
AuthSignInView.displayName = 'AuthSignInView';
