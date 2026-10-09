import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {createRef} from 'react';
import {z} from 'zod';

import {Form} from '../Form/Form.js';
import {DateField} from './DateField.js';

describe('DateField', () => {
  const initialDate = new Date(2026, 4, 15).getTime();

  it('renders a formatted date input with a label', () => {
    render(<DateField defaultValue={initialDate} label="Start date" name="startDate" />);

    expect(screen.getByLabelText('Start date')).toHaveValue('2026-05-15');
  });

  it('opens the picker on focus and emits selected dates', () => {
    const onChange = vi.fn();

    render(<DateField defaultValue={initialDate} label="Start date" name="startDate" onChange={onChange} />);

    fireEvent.focus(screen.getByLabelText('Start date'));
    fireEvent.click(screen.getByRole('button', {name: '20'}));

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 4, 20).getTime());
    expect(screen.getByLabelText('Start date')).toHaveValue('2026-05-20');
  });

  it('clamps default values to the provided date range', () => {
    const minDate = new Date(2026, 5, 1).getTime();

    render(
      <DateField
        defaultValue={initialDate}
        label="Start date"
        minDate={minDate}
        name="startDate"
      />
    );

    expect(screen.getByLabelText('Start date')).toHaveValue('2026-06-01');
  });
});

describe('DateField input contracts', () => {
  it('clamps typed dates at both boundaries and forwards its input ref', () => {
    const onChange = vi.fn();
    const ref = createRef<HTMLInputElement>();
    const minDate = Date.UTC(2026, 4, 10);
    const maxDate = Date.UTC(2026, 4, 20);
    render(<DateField defaultValue={Date.UTC(2026, 5, 1)} label="Date" maxDate={maxDate} minDate={minDate} name="date" onChange={onChange} ref={ref} />);
    const input = screen.getByLabelText('Date');

    expect(ref.current).toBe(input);
    expect(input).toHaveValue('2026-05-20');
    expect(input).toHaveAttribute('min', '2026-05-10');
    expect(input).toHaveAttribute('max', '2026-05-20');

    fireEvent.change(input, {target: {value: '2026-05-01'}});

    expect(onChange).toHaveBeenLastCalledWith(minDate);
    expect(input).toHaveValue('2026-05-10');

    fireEvent.change(input, {target: {value: '2026-06-01'}});

    expect(onChange).toHaveBeenLastCalledWith(maxDate);
    expect(input).toHaveValue('2026-05-20');
  });

  it('keeps the controlled value until the parent supplies a new one', () => {
    const onChange = vi.fn();
    const {rerender} = render(<DateField label="Date" name="date" onChange={onChange} value={Date.UTC(2026, 4, 10)} />);
    fireEvent.change(screen.getByLabelText('Date'), {target: {value: '2026-05-20'}});

    expect(onChange).toHaveBeenCalledWith(Date.UTC(2026, 4, 20));
    expect(screen.getByLabelText('Date')).toHaveValue('2026-05-10');

    rerender(<DateField label="Date" name="date" value={Date.UTC(2026, 4, 20)} />);

    expect(screen.getByLabelText('Date')).toHaveValue('2026-05-20');
  });

  it('closes only on outside clicks and removes its document listener', () => {
    const removeListener = vi.spyOn(document, 'removeEventListener');
    const {unmount} = render(<DateField defaultValue={Date.UTC(2026, 4, 10)} label="Date" name="date" />);
    const input = screen.getByLabelText('Date');
    fireEvent.focus(input);
    fireEvent.mouseDown(input);

    expect(screen.getByRole('button', {name: '20'})).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole('button', {name: '20'}));

    expect(screen.getByRole('button', {name: '20'})).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole('button', {name: '20'})).not.toBeInTheDocument();

    unmount();

    expect(removeListener).toHaveBeenCalledWith('mousedown', expect.any(Function));

    removeListener.mockRestore();
  });

  it('uses a native date field on mobile without opening the custom picker', () => {
    const matchMedia = vi.mocked(window.matchMedia);
    const previous = matchMedia.getMockImplementation();
    matchMedia.mockImplementation((query) => ({
      addEventListener: vi.fn(), addListener: vi.fn(), dispatchEvent: vi.fn(), matches: true,
      media: query, onchange: null, removeEventListener: vi.fn(), removeListener: vi.fn()
    }));
    try {
      render(<DateField defaultValue={Date.UTC(2026, 4, 10)} label="Date" name="date" />);
      const input = screen.getByLabelText('Date');

      expect(input).toHaveAttribute('type', 'date');

      fireEvent.focus(input);

      expect(screen.queryByRole('button', {name: '20'})).not.toBeInTheDocument();

      fireEvent.change(input, {target: {value: '2026-05-20'}});

      expect(input).toHaveValue('2026-05-20');
    } finally {
      matchMedia.mockImplementation(previous!);
    }
  });

  it('does not open a disabled picker and supports an epoch value', () => {
    const {container} = render(<DateField defaultValue={0} disabled error label="Date" name="date" />);
    const input = screen.getByLabelText('Date');

    expect(input).toBeDisabled();
    expect(input).toHaveValue('1970-01-01');

    fireEvent.focus(input);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(container.querySelector('input[type="hidden"]')).toHaveValue('');
  });

  it('updates form values and clears a validation error after a correction', async () => {
    const onSubmit = vi.fn();
    render(<Form defaultValues={{date: Date.UTC(2026, 4, 10)}} onSubmit={onSubmit}
      schema={z.object({date: z.number().min(Date.UTC(2026, 4, 15), 'Choose a later date')})}>
      <DateField label="Date" name="date" />
      <button type="submit">Save date</button>
    </Form>);
    fireEvent.click(screen.getByRole('button', {name: 'Save date'}));

    expect(await screen.findByText('Choose a later date')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Date'), {target: {value: '2026-05-20'}});

    expect(screen.queryByText('Choose a later date')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Save date'}));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(
      {date: Date.UTC(2026, 4, 20)}, expect.anything(), expect.any(Function)
    ));
  });
});
