import {createContext, use, useContext, useMemo, useSyncExternalStore} from 'react';

export type FormErrors = Record<string, {readonly message?: string; readonly type?: string} | string | undefined>;
export type FormValues = Record<string, unknown>;

export interface GothamFormContextValue {
  readonly clearError: (name: string) => void;
  readonly defaultValues: FormValues;
  readonly errors: FormErrors;
  readonly isSubmitting: boolean;
  readonly setValue: (name: string, value: unknown) => void;
  readonly values: FormValues;
}

export const GothamFormContext = createContext<GothamFormContextValue | null>(null);

export const useGothamFormContext = (): GothamFormContextValue | null => useContext(GothamFormContext);

export const getFormErrorMessage = (error: FormErrors[string]): string | undefined => {
  if(typeof error === 'string') {
    return error;
  }

  return error?.message;
};

export interface GothamFormFieldValue {
  readonly clearError: GothamFormContextValue['clearError'];
  readonly defaultValue: unknown;
  readonly error: FormErrors[string];
  readonly setValue: GothamFormContextValue['setValue'];
  readonly value: unknown;
}

// This subscription adapter exposes committed form state at field granularity.
// React remains the owner of the form's values and validation state.
export const createFormFieldStore = (initialValue: GothamFormContextValue) => {
  let currentValue = initialValue;
  const listeners = new Set<() => void>();

  return {
    getSnapshot: () => currentValue,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    update: (value: GothamFormContextValue) => {
      if(currentValue === value) {
        return;
      }
      currentValue = value;
      listeners.forEach((listener) => listener());
    }
  };
};

export const GothamFormFieldContext = createContext<ReturnType<typeof createFormFieldStore> | null>(null);
const subscribeWithoutForm = () => () => {};

/** Subscribe only to the named field. Use the full context for cross-field UI. */
export const useGothamFormField = (name: string): GothamFormFieldValue | null => {
  const store = useContext(GothamFormFieldContext);
  const legacyForm = store ? null : use(GothamFormContext);
  const getSnapshot = useMemo(() => {
    let previous: GothamFormFieldValue | null = null;

    return () => {
      if(!store) {
        return null;
      }
      const form = store.getSnapshot();
      const next: GothamFormFieldValue = {
        clearError: form.clearError,
        defaultValue: form.defaultValues[name],
        error: form.errors[name],
        setValue: form.setValue,
        value: form.values[name]
      };
      if(previous && Object.is(previous.value, next.value)
        && Object.is(previous.defaultValue, next.defaultValue)
        && previous.error === next.error
        && previous.clearError === next.clearError
        && previous.setValue === next.setValue) {
        return previous;
      }
      previous = next;
      return next;
    };
  }, [name, store]);

  const field = useSyncExternalStore(store?.subscribe ?? subscribeWithoutForm, getSnapshot, getSnapshot);
  return legacyForm ? {
    clearError: legacyForm.clearError,
    defaultValue: legacyForm.defaultValues[name],
    error: legacyForm.errors[name],
    setValue: legacyForm.setValue,
    value: legacyForm.values[name]
  } : field;
};
