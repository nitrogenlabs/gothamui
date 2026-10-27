/* @vitest-environment jsdom */
import {act, cleanup, render, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {MarkdownEditor} from './MarkdownEditor.js';

afterEach(cleanup);

const select = (node: Node, start: number, end: number) => {
  act(() => {
    screen.getByRole('textbox').focus();
    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, end);
    window.getSelection()!.removeAllRanges();
    window.getSelection()!.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
  });
};

describe('SelectionPlugin', () => {
  it('reports null for collapsed and whitespace-only selections', async () => {
    const onSelectionChange = vi.fn();
    render(<MarkdownEditor onChange={vi.fn()} onSelectionChange={onSelectionChange} value="one two" />);
    await waitFor(() => expect(screen.getByRole('textbox').textContent).toBe('one two'));
    const text = screen.getByRole('textbox').querySelector('span')!.firstChild!;

    select(text, 2, 2);
    await waitFor(() => expect(onSelectionChange).toHaveBeenLastCalledWith(null));

    select(text, 3, 4);
    await waitFor(() => expect(onSelectionChange).toHaveBeenLastCalledWith(null));
  });

  it('tracks repeated text by searching from the last selection start', async () => {
    const onSelectionChange = vi.fn();
    render(<MarkdownEditor onChange={vi.fn()} onSelectionChange={onSelectionChange} value="ab ab" />);
    await waitFor(() => expect(screen.getByRole('textbox').textContent).toBe('ab ab'));
    const text = screen.getByRole('textbox').querySelector('span')!.firstChild!;

    select(text, 0, 2);
    await waitFor(() => expect(onSelectionChange).toHaveBeenLastCalledWith({end: 2, start: 0, text: 'ab'}));
  });
});
