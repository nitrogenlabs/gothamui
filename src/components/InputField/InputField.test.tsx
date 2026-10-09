import {fireEvent, render, screen} from '@testing-library/react';

import {InputField, getInputBorderClass} from './InputField.js';

describe('InputField', () => {
  it('uses the public label as the accessible name for inputs and textareas', () => {
    render(<><InputField label="Product name" /><InputField label="Product description" multiline /></>);

    expect(screen.getByRole('textbox', {name: 'Product name'}).tagName).toBe('INPUT');
    expect(screen.getByRole('textbox', {name: 'Product description'}).tagName).toBe('TEXTAREA');
  });

  it('preserves explicitly supplied accessible names and labelled-by relationships', () => {
    render(<><InputField aria-label="Explicit name" label="Fallback" />
      <span id="visible-name">Visible name</span><InputField aria-labelledby="visible-name" label="Fallback" /></>);

    expect(screen.getByRole('textbox', {name: 'Explicit name'})).not.toHaveAttribute('aria-label', 'Fallback');
    expect(screen.getByRole('textbox', {name: 'Visible name'})).toHaveAttribute('aria-labelledby', 'visible-name');
  });

  it('renders an input and forwards changes', () => {
    const onChange = vi.fn();

    render(<InputField aria-label="Name" onChange={onChange} placeholder="Ada" />);

    const input = screen.getByLabelText('Name');
    fireEvent.change(input, {target: {value: 'Grace'}});

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue('Grace');
  });

  it('renders multiline inputs as textareas', () => {
    render(<InputField aria-label="Message" multiline />);

    expect(screen.getByLabelText('Message').tagName).toBe('TEXTAREA');
  });

  it('applies text fill color styles', () => {
    render(<InputField aria-label="Token" textFillColor="#123456" />);

    expect(screen.getByLabelText('Token')).toHaveStyle({color: '#123456'});
  });

  it('builds border classes by border type', () => {
    expect(getInputBorderClass('underline', 'primary', 'neutral', 'neutral')).toContain('border-b');
    expect(getInputBorderClass('rounded', 'primary', 'neutral', 'neutral')).toContain('rounded-md');
  });
});
