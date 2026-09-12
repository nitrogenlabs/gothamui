import {fireEvent, render, screen} from '@testing-library/react';

import {DatePicker} from './DatePicker.js';

describe('DatePicker', () => {
  const initialDate = new Date(2026, 4, 15).getTime();

  it('renders month and year controls for the initial date', () => {
    render(<DatePicker initialDate={initialDate} />);

    expect(screen.getByDisplayValue('May')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2026')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '15'})).toBeInTheDocument();
  });

  it('selects available dates', () => {
    const onDateSelect = vi.fn();

    render(<DatePicker initialDate={initialDate} onDateSelect={onDateSelect} />);

    fireEvent.click(screen.getByRole('button', {name: '21'}));

    expect(onDateSelect).toHaveBeenCalledWith(new Date(2026, 4, 21).getTime());
  });

  it('navigates between months and disables dates outside the range', () => {
    const minDate = new Date(2026, 4, 10).getTime();
    const maxDate = new Date(2026, 4, 20).getTime();

    render(<DatePicker initialDate={initialDate} maxDate={maxDate} minDate={minDate} />);

    expect(screen.getByRole('button', {name: '5'})).toBeDisabled();
    expect(screen.getByRole('button', {name: '18'})).not.toBeDisabled();

    fireEvent.click(screen.getByRole('button', {name: '>'}));

    expect(screen.getByDisplayValue('June')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: '<'}));

    expect(screen.getByDisplayValue('May')).toBeInTheDocument();
  });
});

test('keeps calendar navigation when no initial date is supplied', () => {
  const {rerender} = render(<DatePicker />);
  const month = (screen.getAllByRole('combobox')[0] as HTMLSelectElement).value;
  fireEvent.click(screen.getByRole('button', {name: '>'}));
  const nextMonth = (Number(month) + 1) % 12;

  expect(screen.getAllByRole('combobox')[0]).toHaveValue(String(nextMonth));

  rerender(<DatePicker />);

  expect(screen.getAllByRole('combobox')[0]).toHaveValue(String(nextMonth));
});
