import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {memo} from 'react';

import {InputField} from '../InputField/InputField.js';
import {TextField} from '../TextField/TextField.js';
import {Form} from './Form.js';
import {useGothamFormContext, useGothamFormField} from './FormContext.js';

import type {GothamFormMethods} from './Form.js';

vi.mock('../InputField/InputField.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../InputField/InputField.js')>();
  return {...actual, InputField: vi.fn((props) => <actual.InputField {...props} />)};
});

const countRenders = (name: string) => vi.mocked(InputField).mock.calls.filter(([props]) => props.name === name).length;

describe('Form render isolation', () => {
  it('updates only the edited field and still submits current values', async () => {
    const onSubmit = vi.fn();
    render(
      <Form defaultValues={{email: '', password: ''}} onSubmit={onSubmit}>
        {() => <><TextField label="Email" name="email" /><TextField label="Password" name="password" /><button type="submit">Submit</button></>}
      </Form>
    );
    const passwordRenders = countRenders('password');
    fireEvent.change(screen.getByLabelText('Email'), {target: {value: 'one@example.com'}});
    fireEvent.change(screen.getByLabelText('Email'), {target: {value: 'two@example.com'}});

    expect(screen.getByLabelText('Email')).toHaveValue('two@example.com');
    expect(countRenders('password')).toBe(passwordRenders);

    fireEvent.click(screen.getByRole('button', {name: 'Submit'}));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({email: 'two@example.com', password: ''}, expect.anything(), expect.any(Function)));
  });

  it('keeps context stable on parent updates and ignores no-op writes', () => {
    const observe = vi.fn();
    let methods: GothamFormMethods;
    const Consumer = memo(() => {
      observe(useGothamFormContext());
      return null;
    });
    const children = (value: GothamFormMethods) => {
      methods = value;
      return <Consumer />;
    };
    const onSubmit = vi.fn();
    const {rerender} = render(<Form onSubmit={onSubmit}>{children}</Form>);
    const renders = observe.mock.calls.length;
    rerender(<Form onSubmit={onSubmit}>{children}</Form>);

    expect(observe).toHaveBeenCalledTimes(renders);

    act(() => methods.setValue('email', 'same'));
    const context = observe.mock.calls.at(-1)![0];
    const updatedRenders = observe.mock.calls.length;
    act(() => {
      methods.setValue('email', 'same');
      context.clearError('email');
    });

    expect(observe).toHaveBeenCalledTimes(updatedRenders);
  });

  it('clears server errors on editing without updating unrelated fields', async () => {
    const onSubmit = vi.fn(async (_data, _event, setError) => setError('email', {message: 'Already taken', type: 'server'}));
    render(<Form defaultValues={{email: '', other: ''}} onSubmit={onSubmit}><TextField label="Email" name="email" /><TextField label="Other" name="other" /><button type="submit">Save</button></Form>);
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));
    await screen.findByText('Already taken');
    const otherRenders = countRenders('other');
    fireEvent.change(screen.getByLabelText('Email'), {target: {value: 'new@example.com'}});

    expect(screen.queryByText('Already taken')).not.toBeInTheDocument();
    expect(countRenders('other')).toBe(otherRenders);
  });

  it('switches field subscriptions when the name changes and observes external errors', () => {
    const Field = ({name}: {name: string}) => {
      const field = useGothamFormField(name);
      return <span>{String(field?.value)}:{String(field?.error ?? '')}</span>;
    };
    const onSubmit = vi.fn();
    const defaultValues = {first: 'one', second: 'two'};
    const {rerender} = render(<Form defaultValues={defaultValues} onSubmit={onSubmit}><Field name="first" /></Form>);

    expect(screen.getByText('one:')).toBeInTheDocument();

    rerender(<Form defaultValues={defaultValues} errors={{second: 'Invalid'}} onSubmit={onSubmit}><Field name="second" /></Form>);

    expect(screen.getByText('two:Invalid')).toBeInTheDocument();
  });
});
