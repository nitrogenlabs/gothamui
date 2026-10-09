import {memo} from 'react';

import {authSignUpSchema} from '../../form/authSchemas.js';
import {Button} from '../Button/Button.js';
import {Checkbox} from '../Checkbox/Checkbox.js';
import {Form} from '../Form/Form.js';
import {PasswordStrengthMeter} from '../PasswordStrengthMeter/PasswordStrengthMeter.js';
import {TextField} from '../TextField/TextField.js';

import type {AuthFieldOptions, AuthFormProps, AuthSignUpValues} from '../../form/authTypes.js';
import type {CheckboxProps} from '../Checkbox/Checkbox.js';

export type {AuthSignUpValues} from '../../form/authTypes.js';
export interface AuthSignUpFormProps extends AuthFormProps<AuthSignUpValues> {
  readonly fields?: Partial<Record<'confirmPassword' | 'email' | 'password', AuthFieldOptions>>;
  readonly showPasswordStrength?: boolean;
  readonly termsProps?: Partial<Pick<CheckboxProps, 'containerClass' | 'description' | 'label' | 'labelClass' | 'optionClass'>>;
}

const AuthSignUpFormComponent = ({
  beforeSubmit,
  className = 'grid',
  fields,
  fieldsClassName = 'grid gap-3',
  name = 'sign-up',
  onSubmit,
  optionsClassName = 'my-3 flex flex-wrap items-center justify-between gap-3',
  optionsContent,
  pendingLabel,
  schema,
  showPasswordStrength = true,
  showSubmitLoading = true,
  submitClassName,
  submitLabel = 'Sign Up',
  submitVariant,
  termsProps
}: AuthSignUpFormProps) => (
  <Form<AuthSignUpValues>
    className={className}
    defaultValues={{acceptTerms: false, confirmPassword: '', email: '', password: ''}}
    name={name}
    onSubmit={onSubmit}
    schema={schema === null ? undefined : schema ?? authSignUpSchema}
    showErrors
  >
    {({formState, getValues}) => {
      const credentialFields = (
        <>
          <TextField
            {...{
              autoComplete: 'email',
              borderColor: 'neutral',
              borderType: 'underline',
              inputClass: 'min-h-11 rounded-none border-x-0 border-t-0 bg-transparent px-0 text-base shadow-none',
              label: 'Email',
              labelClass: 'mb-1 text-sm font-bold',
              placeholder: 'you@example.com',
              ...fields?.email
            }}
            name="email"
            type="email"
          />
          <TextField
            {...{
              autoComplete: 'new-password',
              borderColor: 'neutral',
              borderType: 'underline',
              inputClass: 'min-h-11 rounded-none border-x-0 border-t-0 bg-transparent px-0 pr-11 text-base shadow-none',
              label: 'Password',
              labelClass: 'mb-1 text-sm font-bold',
              placeholder: 'Create a secure password',
              ...fields?.password
            }}
            name="password"
            showPasswordToggle
            type="password"
          />
          {showPasswordStrength ? <PasswordStrengthMeter password={String(getValues().password || '')} /> : null}
          <TextField
            {...{
              autoComplete: 'new-password',
              borderColor: 'neutral',
              borderType: 'underline',
              inputClass: 'min-h-11 rounded-none border-x-0 border-t-0 bg-transparent px-0 pr-11 text-base shadow-none',
              label: 'Confirm password',
              labelClass: 'mb-1 text-sm font-bold',
              placeholder: 'Re-enter your password',
              ...fields?.confirmPassword
            }}
            name="confirmPassword"
            showPasswordToggle
            type="password"
          />
        </>
      );

      return (
        <>
          {fieldsClassName === null ? credentialFields : <div className={fieldsClassName}>{credentialFields}</div>}
          <div className={optionsClassName}>
            <Checkbox label="I agree to the Terms and Conditions" {...termsProps} name="acceptTerms" />
            {optionsContent}
          </div>
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
      );
    }}
  </Form>
);

export const AuthSignUpForm = memo(AuthSignUpFormComponent);
AuthSignUpForm.displayName = 'AuthSignUpForm';
