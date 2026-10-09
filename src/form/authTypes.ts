import type {ReactNode} from 'react';
import type {z} from 'zod';
import type {ButtonProps} from '../components/Button/Button.js';
import type {TextFieldProps} from '../components/TextField/TextField.js';

export interface AuthSignInValues extends Record<string, unknown> {
  readonly email: string;
  readonly password: string;
  readonly rememberEmail: boolean;
}

export interface AuthSignUpValues extends Record<string, unknown> {
  readonly acceptTerms: boolean;
  readonly confirmPassword: string;
  readonly email: string;
  readonly password: string;
}

export type AuthFieldOptions = Partial<Pick<TextFieldProps,
  'autoComplete' | 'borderColor' | 'borderType' | 'inputClass' | 'label' | 'labelClass' | 'placeholder'>>;

export interface AuthFormProps<T extends Record<string, unknown>> {
  readonly beforeSubmit?: ReactNode;
  readonly className?: string;
  readonly fieldsClassName?: string | null;
  readonly name?: string;
  readonly onSubmit: (values: T) => void | Promise<void>;
  readonly optionsClassName?: string;
  readonly optionsContent?: ReactNode;
  readonly pendingLabel?: ReactNode;
  readonly schema?: z.ZodSchema<T> | null;
  readonly showSubmitLoading?: boolean;
  readonly submitClassName?: string;
  readonly submitLabel?: ReactNode;
  readonly submitVariant?: ButtonProps['variant'];
}
