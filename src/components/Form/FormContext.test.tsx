import {act, renderHook} from '@testing-library/react';

import {createFormFieldStore, GothamFormContext, GothamFormFieldContext, useGothamFormField} from './FormContext.js';

const initialValue = {
  clearError: vi.fn(),
  defaultValues: {email: 'default'},
  errors: {},
  isSubmitting: false,
  setValue: vi.fn(),
  values: {email: 'initial'}
};

test('caches field snapshots and ignores submission or other field updates', () => {
  const store = createFormFieldStore(initialValue);
  const listener = vi.fn();
  const unsubscribe = store.subscribe(listener);
  const {result, unmount} = renderHook(() => useGothamFormField('email'), {
    wrapper: ({children}) => <GothamFormFieldContext.Provider value={store}>{children}</GothamFormFieldContext.Provider>
  });
  const initial = result.current;
  act(() => store.update(initialValue));

  expect(listener).not.toHaveBeenCalled();

  act(() => store.update({...initialValue, isSubmitting: true, values: {...initialValue.values, other: 'changed'}}));

  expect(result.current).toBe(initial);

  act(() => store.update({...initialValue, values: {email: 'updated'}}));

  expect(result.current?.value).toBe('updated');

  unmount();
  unsubscribe();
  listener.mockClear();
  store.update(initialValue);

  expect(listener).not.toHaveBeenCalled();
});

test('supports standalone fields and existing context providers', () => {
  const standalone = renderHook(() => useGothamFormField('email'));

  expect(standalone.result.current).toBeNull();

  standalone.unmount();
  const {result} = renderHook(() => useGothamFormField('email'), {
    wrapper: ({children}) => <GothamFormContext.Provider value={initialValue}>{children}</GothamFormContext.Provider>
  });

  expect(result.current).toMatchObject({defaultValue: 'default', value: 'initial'});
});
