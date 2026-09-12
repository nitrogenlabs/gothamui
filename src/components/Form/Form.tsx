/**
 * Copyright (c) 2021-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {startTransition, useActionState, useCallback, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {z} from 'zod';

import {GothamFormContext, GothamFormFieldContext, createFormFieldStore, getFormErrorMessage} from './FormContext.js';

import type {BaseSyntheticEvent, FormEvent, ReactNode} from 'react';
import type {FormErrors, FormValues} from './FormContext.js';

export interface GothamFormMethods {
  readonly formState: {
    readonly errors: FormErrors;
    readonly isSubmitting: boolean;
  };
  readonly getValues: () => FormValues;
  readonly register: (name: string) => {
    readonly defaultValue: unknown;
    readonly name: string;
  };
  readonly setError: (field: string, error: {type: string; message: string}) => void;
  readonly setValue: (name: string, value: unknown) => void;
}

export interface FormActionState {
  readonly errors: FormErrors;
  readonly values: FormValues;
}

export interface FormProps<T> {
  readonly children: ReactNode | ((methods: GothamFormMethods) => ReactNode);
  readonly className?: string;
  readonly defaultValues?: FormValues;
  readonly disabled?: boolean;
  readonly errors?: FormErrors;
  readonly mode?: 'onSubmit' | 'onBlur' | 'onChange' | 'onTouched' | 'all';
  readonly name?: string;
  readonly onChange?: (data: unknown) => void;
  readonly onSubmit: (
    data: T,
    event: BaseSyntheticEvent,
    setError: (field: string, error: {type: string; message: string}) => void
  ) => void | Promise<void>;
  readonly schema?: z.ZodSchema<T>;
  readonly showErrors?: boolean;
  readonly validate?: (data: unknown) => void;
  readonly validateOnBlur?: boolean;
}

const getFormDataValue = (formData: FormData, key: string): unknown => {
  const values = formData.getAll(key);

  if(values.length > 1) {
    return values;
  }

  return values[0] ?? '';
};

const getValuesFromFormData = (formData: FormData): FormValues => {
  const values: FormValues = {};

  Array.from(new Set(Array.from(formData.keys()))).forEach((key) => {
    values[key] = getFormDataValue(formData, key);
  });

  return values;
};

const getErrorsFromZod = (error: z.ZodError): FormErrors => Object.fromEntries(
  error.issues.map((issue) => [
    issue.path.join('.'),
    {
      message: issue.message,
      type: issue.code
    }
  ])
);

const getErrorMessages = (errorObj: FormErrors): string[] => Object.values(errorObj)
  .map(getFormErrorMessage)
  .filter(Boolean) as string[];

const emptyValues: FormValues = {};
const emptyErrors: FormErrors = {};

export const Form = <T extends Record<string, unknown>>({
  children,
  className,
  defaultValues = emptyValues,
  disabled = false,
  errors = emptyErrors,
  name = 'default',
  schema,
  showErrors = false,
  onSubmit
}: FormProps<T>) => {
  const [localErrors, setLocalErrors] = useState<FormErrors>({});
  const [localValues, setLocalValues] = useState<FormValues>(defaultValues);
  const submitEventRef = useRef<BaseSyntheticEvent | null>(null);
  const [state, submitAction, isPending] = useActionState(
    async (_previousState: FormActionState, formData: FormData): Promise<FormActionState> => {
      if(disabled) {
        return {
          errors: localErrors,
          values: localValues
        };
      }

      const formValues = {
        ...defaultValues,
        ...getValuesFromFormData(formData),
        ...localValues
      };
      const parsed = schema ? schema.safeParse(formValues) : {data: formValues as T, success: true as const};

      if(!parsed.success) {
        const nextErrors = getErrorsFromZod(parsed.error);
        setLocalErrors(nextErrors);
        return {
          errors: nextErrors,
          values: formValues
        };
      }

      const nextErrors: FormErrors = {};
      const setError = (field: string, error: {type: string; message: string}) => {
        nextErrors[field] = error;
      };

      await onSubmit(parsed.data, submitEventRef.current as BaseSyntheticEvent, setError);
      setLocalErrors(nextErrors);

      return {
        errors: nextErrors,
        values: formValues
      };
    },
    {
      errors: {},
      values: defaultValues
    }
  );
  const allErrors = useMemo(() => ({
    ...localErrors,
    ...errors
  }), [errors, localErrors]);
  const values = useMemo(() => ({
    ...state.values,
    ...localValues
  }), [localValues, state.values]);
  const setValue = useCallback((fieldName: string, value: unknown) => {
    setLocalValues((currentValues) => {
      if(Object.hasOwn(currentValues, fieldName) && Object.is(currentValues[fieldName], value)) {
        return currentValues;
      }
      return {...currentValues, [fieldName]: value};
    });
  }, []);
  const clearError = useCallback((fieldName: string) => {
    setLocalErrors((currentErrors) => {
      if(!Object.hasOwn(currentErrors, fieldName)) {
        return currentErrors;
      }

      const nextErrors = {...currentErrors};
      delete nextErrors[fieldName];
      return nextErrors;
    });
  }, []);
  const methods: GothamFormMethods = useMemo(() => ({
    formState: {
      errors: allErrors,
      isSubmitting: isPending
    },
    getValues: () => values,
    register: (fieldName: string) => ({
      defaultValue: values[fieldName] ?? defaultValues[fieldName] ?? '',
      name: fieldName
    }),
    setError: (fieldName: string, error: {type: string; message: string}) => {
      setLocalErrors((currentErrors) => ({
        ...currentErrors,
        [fieldName]: error
      }));
    },
    setValue
  }), [allErrors, defaultValues, isPending, setValue, values]);
  const contextValue = useMemo(() => ({
    clearError,
    defaultValues,
    errors: allErrors,
    isSubmitting: isPending,
    setValue,
    values
  }), [allErrors, clearError, defaultValues, isPending, setValue, values]);
  const [fieldStore] = useState(() => createFormFieldStore(contextValue));

  // Publish committed React state, never state from an abandoned render.
  useLayoutEffect(() => {
    fieldStore.update(contextValue);
  }, [contextValue, fieldStore]);
  const errorMessages = getErrorMessages(allErrors);
  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if(isPending || disabled) {
      return;
    }

    submitEventRef.current = event as unknown as BaseSyntheticEvent;
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      submitAction(formData);
    });
  };

  return (
    <GothamFormFieldContext.Provider value={fieldStore}>
      <GothamFormContext.Provider value={contextValue}>
        <form
          className={className}
          data-testid={`form-${name}`}
          noValidate
          onSubmit={handleFormSubmit}
        >
          {showErrors && errorMessages.length > 0 && (
            <div
              aria-live="polite"
              className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
              role="alert"
            >
              <ul className="list-disc list-inside">
                {errorMessages.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </div>
          )}
          {typeof children === 'function' ? children(methods) : children}
        </form>
      </GothamFormContext.Provider>
    </GothamFormFieldContext.Provider>
  );
};
