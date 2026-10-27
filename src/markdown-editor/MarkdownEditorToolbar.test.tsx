/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import {act, cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {MarkdownEditor} from './MarkdownEditor.js';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const selectAll = (input: HTMLElement) => {
  act(() => {
    input.focus();
    const range = document.createRange();
    range.selectNodeContents(input);
    window.getSelection()!.removeAllRanges();
    window.getSelection()!.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
  });
};

const setup = async (value = 'hello', props: Partial<Parameters<typeof MarkdownEditor>[0]> = {}) => {
  const onChange = vi.fn();
  render(<MarkdownEditor onChange={onChange} value={value} {...props} />);
  await waitFor(() => expect(screen.getByRole('textbox').textContent).toBe(value));
  selectAll(screen.getByRole('textbox'));

  return {onChange};
};

describe('MarkdownEditorToolbar', () => {
  it('exposes the formatting controls', async () => {
    await setup();

    for(const name of ['Undo', 'Redo', 'Bold', 'Italic', 'Inline code', 'Add link', 'Bulleted list', 'Numbered list', 'Checklist', 'Remove list', 'Quote']) {
      expect(screen.getByRole('button', {name})).toBeInTheDocument();
    }

    expect(screen.getByRole('combobox', {name: 'Block style'})).toBeInTheDocument();
  });

  it('applies bold and reports markdown', async () => {
    const {onChange} = await setup();

    fireEvent.click(screen.getByRole('button', {name: 'Bold'}));

    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith('**hello**'));
    await waitFor(() => expect(screen.getByRole('button', {name: 'Bold'})).toHaveAttribute('aria-pressed', 'true'));
  });

  it('applies italic and inline code', async () => {
    const {onChange} = await setup();

    fireEvent.click(screen.getByRole('button', {name: 'Italic'}));
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(expect.stringContaining('hello')));
    fireEvent.click(screen.getByRole('button', {name: 'Italic'}));
    fireEvent.click(screen.getByRole('button', {name: 'Inline code'}));
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith('`hello`'));
  });

  it('changes block style through the select', async () => {
    const {onChange} = await setup();

    fireEvent.change(screen.getByRole('combobox', {name: 'Block style'}), {target: {value: 'h2'}});
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith('## hello'));
    await waitFor(() => expect(screen.getByRole('combobox', {name: 'Block style'})).toHaveValue('h2'));

    fireEvent.change(screen.getByRole('combobox', {name: 'Block style'}), {target: {value: 'paragraph'}});
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith('hello'));
  });

  it('toggles quote', async () => {
    const {onChange} = await setup();

    fireEvent.click(screen.getByRole('button', {name: 'Quote'}));
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith('> hello'));
    await waitFor(() => expect(screen.getByRole('button', {name: 'Quote'})).toHaveAttribute('aria-pressed', 'true'));

    fireEvent.click(screen.getByRole('button', {name: 'Quote'}));
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith('hello'));
  });

  it('creates bulleted, numbered and check lists and removes them', async () => {
    const {onChange} = await setup();

    fireEvent.click(screen.getByRole('button', {name: 'Bulleted list'}));
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith('- hello'));
    fireEvent.click(screen.getByRole('button', {name: 'Numbered list'}));
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith('1. hello'));
    fireEvent.click(screen.getByRole('button', {name: 'Checklist'}));
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith('- [ ] hello'));
    fireEvent.click(screen.getByRole('button', {name: 'Remove list'}));
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith('hello'));
  });

  it('adds a link from the injected link requester', async () => {
    const onRequestLink = vi.fn().mockResolvedValue(' https://example.com ');
    const {onChange} = await setup('hello', {onRequestLink});

    fireEvent.click(screen.getByRole('button', {name: 'Add link'}));

    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith('[hello](https://example.com)'));
  });

  it('does not add a link when the request is cancelled and falls back to window.prompt', async () => {
    const prompt = vi.spyOn(window, 'prompt').mockReturnValue(null);
    const {onChange} = await setup();

    fireEvent.click(screen.getByRole('button', {name: 'Add link'}));
    await waitFor(() => expect(prompt).toHaveBeenCalled());

    expect(onChange).not.toHaveBeenCalled();
  });

  it('undoes and redoes typed changes', async () => {
    const {onChange} = await setup();

    fireEvent.click(screen.getByRole('button', {name: 'Bold'}));
    await waitFor(() => expect(screen.getByRole('button', {name: 'Undo'})).toBeEnabled());

    fireEvent.click(screen.getByRole('button', {name: 'Undo'}));
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith('hello'));
    await waitFor(() => expect(screen.getByRole('button', {name: 'Redo'})).toBeEnabled());

    fireEvent.click(screen.getByRole('button', {name: 'Redo'}));
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith('**hello**'));
  });
});
