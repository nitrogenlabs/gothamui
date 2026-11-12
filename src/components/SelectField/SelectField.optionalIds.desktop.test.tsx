import {afterEach, beforeEach, expect, test, vi} from '@nlabs/lex/test-vitest';
import '@testing-library/jest-dom/vitest';
import {fireEvent, render} from '@testing-library/react';

import {SelectField} from './SelectField.js';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() => {
    throw new Error('Unexpected outbound unit request');
  }));
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test('renders valid optional-ID options without React warnings in desktop mode', () => {
  vi.mocked(window.matchMedia).mockReturnValue({
    addEventListener: vi.fn(), addListener: vi.fn(), dispatchEvent: vi.fn(),
    matches: false, media: '(max-width: 767px)', onchange: null,
    removeEventListener: vi.fn(), removeListener: vi.fn()
  });
  const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const options = [{label: 'Alpha', value: 'alpha'}, {label: 'Beta', value: 'beta'}];
  const {container} = render(<SelectField defaultValue="alpha" label="Phase" name="phase" options={options} />);
  const select = container.querySelector('select[name="phase"]') as HTMLSelectElement;

  expect(select).toHaveValue('alpha');

  fireEvent.change(select, {target: {value: 'beta'}});

  expect(select).toHaveValue('beta');

  expect(errors).not.toHaveBeenCalled();
});

test('optional-ID values remain distinct from explicit IDs in desktop mode', () => {
  vi.mocked(window.matchMedia).mockReturnValue({
    addEventListener: vi.fn(), addListener: vi.fn(), dispatchEvent: vi.fn(),
    matches: false, media: '(max-width: 767px)', onchange: null,
    removeEventListener: vi.fn(), removeListener: vi.fn()
  });
  const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const {container} = render(<SelectField defaultValue="alpha" id="explicit-phase" name="phase" options={[{id: 0, label: 'Alpha', value: 'alpha'}, {label: 'Zero', value: 0}]} showChevron={false} />);
  const select = container.querySelector('select[name="phase"]') as HTMLSelectElement;

  expect(select).toHaveValue('alpha');

  fireEvent.change(select, {target: {value: '0'}});

  expect(select).toHaveValue('0');

  expect(errors).not.toHaveBeenCalled();
});
