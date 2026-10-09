import {memo} from 'react';

import {authSignInSchema} from '../../form/authSchemas.js';
import {Button} from '../Button/Button.js';
import {Checkbox} from '../Checkbox/Checkbox.js';
import {Form} from '../Form/Form.js';
import {TextField} from '../TextField/TextField.js';

import type {AuthFieldOptions, AuthFormProps, AuthSignInValues} from '../../form/authTypes.js';
import type {FormProps} from '../Form/Form.js';

export type {AuthSignInValues} from '../../form/authTypes.js';
export interface AuthSignInFormProps extends AuthFormProps<AuthSignInValues> {
  readonly defaultEmail?: string;
  readonly fields?: Partial<Record<'email' | 'password', AuthFieldOptions>>;
  readonly showRememberEmail?: boolean;
}

const AuthSignInFormComponent = ({
  beforeSubmit,
  className = 'grid',
  defaultEmail = '',
  fields,
  fieldsClassName = 'grid gap-7 max-[600px]:gap-6',
  name = 'sign-in',
  onSubmit,
  optionsClassName = 'my-5 flex items-center justify-between gap-4',
  optionsContent,
  pendingLabel,
  schema,
  showRememberEmail = true,
  showSubmitLoading = true,
  submitClassName,
  submitLabel = 'Sign In',
  submitVariant
}: AuthSignInFormProps) => {
  const submit: FormProps<AuthSignInValues>['onSubmit'] = onSubmit;
  const credentialFields = (
    <>
      <TextField
        {...{
          autoComplete: 'email',
          borderColor: 'neutral',
          borderType: 'underline',
          inputClass: 'min-h-12 rounded-none border-x-0 border-t-0 bg-transparent px-0 text-base shadow-none',
          label: 'Email',
          labelClass: 'mb-2 text-sm font-bold',
          placeholder: 'you@example.com',
          ...fields?.email
        }}
        name="email"
        type="email"
      />
      <TextField
        {...{
          autoComplete: 'current-password',
          borderColor: 'neutral',
          borderType: 'underline',
          inputClass: 'min-h-12 rounded-none border-x-0 border-t-0 bg-transparent px-0 pr-11 text-base shadow-none',
          label: 'Password',
          labelClass: 'mb-2 text-sm font-bold',
          placeholder: 'Your password',
          ...fields?.password
        }}
        name="password"
        showPasswordToggle
        type="password"
      />
    </>
  );

  return (
    <Form<AuthSignInValues>
      className={className}
      defaultValues={{email: defaultEmail, password: '', rememberEmail: showRememberEmail}}
      name={name}
      onSubmit={(values, event, setError) => submit(
        showRememberEmail ? values : {...values, rememberEmail: false}, event, setError
      )}
      schema={schema === null ? undefined : schema ?? authSignInSchema}
      showErrors
    >
      {({formState}) => (
        <>
          {fieldsClassName === null ? credentialFields : <div className={fieldsClassName}>{credentialFields}</div>}
          {showRememberEmail || (optionsContent !== undefined && optionsContent !== null) ? (
            <div className={optionsClassName}>
              {showRememberEmail ? <Checkbox defaultValue label="Remember me" name="rememberEmail" /> : null}
              {optionsContent}
            </div>
          ) : null}
          {beforeSubmit}
          <Button
            className={submitClassName}
            disabled={formState.isSubmitting}
            isLoading={showSubmitLoading && formState.isSubmitting}
            type="submit"
            variant={submitVariant}
          >
            {formState.isSubmitting ? pendingLabel ?? submitLabel : submitLabel}
          </Button>
        </>
      )}
    </Form>
  );
};

export const AuthSignInForm = memo(AuthSignInFormComponent);
AuthSignInForm.displayName = 'AuthSignInForm';
