import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';

import {AutocompleteField} from './AutocompleteField.js';

describe('AutocompleteField', () => {
  it('loads and selects suggestions', async () => {
    const getList = vi.fn().mockResolvedValue([
      {
        city: 'New York',
        country: 'USA',
        latitude: 40.7128,
        longitude: -74.006,
        state: 'NY'
      }
    ]);
    const onSelected = vi.fn();

    render(
      <AutocompleteField
        getList={getList}
        label="Location"
        name="location"
        onSelected={onSelected}
      />
    );

    fireEvent.change(screen.getByLabelText('Location'), {target: {value: 'ne'}});

    expect(screen.getByText('Searching...')).toBeInTheDocument();
    expect(await screen.findByRole('option')).toHaveTextContent('New York, NY, USA');

    fireEvent.mouseDown(screen.getByRole('option'));

    expect(screen.getByLabelText('Location')).toHaveValue('New York, NY, USA');
    expect(onSelected).toHaveBeenCalledWith({
      suggestion: expect.objectContaining({city: 'New York'})
    });
  });

  it('closes when the query is too short and reports blur values', async () => {
    const onSelected = vi.fn();

    render(
      <AutocompleteField
        defaultValue="A"
        getList={vi.fn()}
        label="Location"
        name="location"
        onSelected={onSelected}
      />
    );

    const input = screen.getByLabelText('Location');
    fireEvent.change(input, {target: {value: 'B'}});
    fireEvent.blur(input);

    await waitFor(() => expect(onSelected).toHaveBeenCalledWith({
      suggestion: {location: 'B'}
    }));

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('clears suggestions when loading fails', async () => {
    const getList = vi.fn().mockRejectedValue(new Error('Nope'));

    render(<AutocompleteField getList={getList} label="Location" name="location" />);

    fireEvent.change(screen.getByLabelText('Location'), {target: {value: 'no'}});

    await waitFor(() => expect(screen.queryByText('Searching...')).not.toBeInTheDocument());

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});

test('ignores a pending suggestion response after the query is cleared', async () => {
  let resolveList: (value: {label: string}[]) => void;
  const getList = vi.fn(() => new Promise<{label: string}[]>((resolve) => {
    resolveList = resolve;
  }));
  render(<AutocompleteField getList={getList} label="Location" name="location" />);
  fireEvent.change(screen.getByLabelText('Location'), {target: {value: 'go'}});
  fireEvent.change(screen.getByLabelText('Location'), {target: {value: ''}});

  expect(screen.queryByText('Searching...')).not.toBeInTheDocument();

  await act(async () => resolveList([{label: 'Gotham'}]));

  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Location')).toHaveValue('');
});
