/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import {act, cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {MarkdownEditor} from './MarkdownEditor.js';

afterEach(() => {
  cleanup();
  delete (Range.prototype as Partial<Range>).getClientRects;
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('MarkdownEditor', () => {
  it('renders the controlled value with an accessible name', async () => {
    render(<MarkdownEditor aria-label="Chapter body" onChange={vi.fn()} value="hello" />);

    await waitFor(() => expect(screen.getByRole('textbox', {name: 'Chapter body'}).textContent).toBe('hello'));
  });

  it('does not report controlled initialization or replacement as a user edit', async () => {
    const onChange = vi.fn();
    const view = render(<MarkdownEditor onChange={onChange} value="first" />);

    await waitFor(() => expect(screen.getByRole('textbox').textContent).toBe('first'));
    view.rerender(<MarkdownEditor onChange={onChange} value="second 雪" />);
    await waitFor(() => expect(screen.getByRole('textbox').textContent).toBe('second 雪'));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders markdown structure from the value', async () => {
    render(<MarkdownEditor onChange={vi.fn()} value={'# Title\n\n- one\n- two'} />);

    await waitFor(() => expect(screen.getByRole('heading', {level: 1}).textContent).toBe('Title'));

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('keeps a newly acquired user focus and selection after controlled initialization settles', async () => {
    vi.useFakeTimers();
    render(<MarkdownEditor onChange={() => undefined} value="Original chapter 雪" />);
    await act(async () => undefined);
    const input = screen.getByRole('textbox');

    expect(input.textContent).toBe('Original chapter 雪');

    act(() => {
      input.focus();
      const range = document.createRange();
      range.selectNodeContents(input);
      window.getSelection()!.removeAllRanges();
      window.getSelection()!.addRange(range);
      document.dispatchEvent(new Event('selectionchange'));
    });

    expect(document.activeElement).toBe(input);
    expect(window.getSelection()!.toString()).toBe('Original chapter 雪');

    await act(async () => vi.runOnlyPendingTimers());

    expect(document.activeElement).toBe(input);
    expect(window.getSelection()!.toString()).toBe('Original chapter 雪');
  });

  it('reports the selection as {start, end, text}', async () => {
    const onSelectionChange = vi.fn();
    render(<MarkdownEditor onChange={vi.fn()} onSelectionChange={onSelectionChange} value="Original chapter" />);
    await waitFor(() => expect(screen.getByRole('textbox').textContent).toBe('Original chapter'));
    const input = screen.getByRole('textbox');

    act(() => {
      input.focus();
      const range = document.createRange();
      range.selectNodeContents(input.querySelector('span') ?? input);
      window.getSelection()!.removeAllRanges();
      window.getSelection()!.addRange(range);
      document.dispatchEvent(new Event('selectionchange'));
    });

    await waitFor(() => expect(onSelectionChange).toHaveBeenCalledWith({end: 16, start: 0, text: 'Original chapter'}));
  });

  it('hides the toolbar when read-only and marks the textbox read-only', async () => {
    render(<MarkdownEditor onChange={vi.fn()} readOnly value="fixed" />);

    await waitFor(() => expect(screen.getByRole('textbox').textContent).toBe('fixed'));

    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-readonly', 'true');
    expect(screen.getByRole('textbox')).toHaveAttribute('contenteditable', 'false');
  });

  it('can hide the toolbar and shows a placeholder when empty', async () => {
    render(<MarkdownEditor onChange={vi.fn()} placeholder="Write here" showToolbar={false} value="" />);

    expect(await screen.findByText('Write here')).toBeInTheDocument();
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
  });

  it('applies height, minHeight and className to the container', () => {
    const {container} = render(<MarkdownEditor className="custom" height={300} minHeight="100px" onChange={vi.fn()} value="" />);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass('custom');
    expect(root.style.height).toBe('300px');
    expect(root.style.minHeight).toBe('100px');
  });

  it('works without an onChange handler', async () => {
    render(<MarkdownEditor value="x" />);

    await waitFor(() => expect(screen.getByRole('textbox').textContent).toBe('x'));
  });
});

describe('MarkdownEditor highlights', () => {
  const stubHighlightApi = () => {
    const set = vi.fn();
    const remove = vi.fn();

    vi.stubGlobal('CSS', {highlights: {delete: remove, set}});
    vi.stubGlobal('Highlight', class {
      ranges: Range[];
      constructor(...ranges: Range[]) {
        this.ranges = ranges;
      }
    });
    Object.defineProperty(Range.prototype, 'getClientRects', {
      configurable: true,
      value: () => [{bottom: 20, left: 0, right: 100, top: 0}],
      writable: true
    });

    return {remove, set};
  };

  it('registers CSS highlights located by text and reports clicks on them', async () => {
    const {set} = stubHighlightApi();
    const onHighlightClick = vi.fn();
    const highlights = [{end: 8, id: 'a', start: 4, text: 'quick'}];

    render(<MarkdownEditor highlights={highlights} onChange={vi.fn()} onHighlightClick={onHighlightClick} value="The quick fox" />);
    await waitFor(() => expect(set).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('textbox'), {clientX: 10, clientY: 10});

    expect(onHighlightClick).toHaveBeenCalledWith({clientX: 10, clientY: 10, highlight: highlights[0]});

    onHighlightClick.mockClear();
    fireEvent.click(screen.getByRole('textbox'), {clientX: 500, clientY: 500});

    expect(onHighlightClick).not.toHaveBeenCalled();
  });

  it('locates highlights by offsets when no text is given and skips unmatched ones', async () => {
    const {set} = stubHighlightApi();
    const highlights = [{end: 9, id: 'a', start: 4}, {end: 3, id: 'b', start: 3}, {end: 12, id: 'c', start: 0, text: 'missing'}];

    render(<MarkdownEditor highlights={highlights} onChange={vi.fn()} value="The quick fox" />);
    await waitFor(() => expect(set).toHaveBeenCalled());

    expect(set.mock.calls.at(-1)![1].ranges).toHaveLength(1);
  });

  it('clears highlights on unmount', async () => {
    const {remove, set} = stubHighlightApi();
    const view = render(<MarkdownEditor highlights={[{end: 3, id: 'a', start: 0}]} onChange={vi.fn()} value="The quick" />);

    await waitFor(() => expect(set).toHaveBeenCalled());
    view.unmount();

    expect(remove).toHaveBeenCalledWith('gothamui-markdown-highlight');
  });

  it('ignores highlights when the browser has no Highlight API', async () => {
    vi.stubGlobal('CSS', {});
    render(<MarkdownEditor highlights={[{end: 3, id: 'a', start: 0}]} onChange={vi.fn()} onHighlightClick={vi.fn()} value="The quick" />);

    await waitFor(() => expect(screen.getByRole('textbox').textContent).toBe('The quick'));
  });

  it('skips unlocatable highlights and clicks with no matching highlight', async () => {
    const {set} = stubHighlightApi();
    const onHighlightClick = vi.fn();
    const highlights = [{end: 900, id: 'far', start: 800}, {end: 8, id: 'a', start: 4, text: 'quick'}];
    const view = render(<MarkdownEditor highlights={highlights} onChange={vi.fn()} onHighlightClick={onHighlightClick} value="The quick fox" />);

    await waitFor(() => expect(set).toHaveBeenCalled());
    view.rerender(<MarkdownEditor highlights={[]} onChange={vi.fn()} onHighlightClick={onHighlightClick} value="The quick fox" />);
    fireEvent.click(screen.getByRole('textbox'), {clientX: 10, clientY: 10});

    expect(onHighlightClick).not.toHaveBeenCalled();
  });

  it('ignores re-rendering with an unchanged value and switches to read-only', async () => {
    const view = render(<MarkdownEditor onChange={vi.fn()} value="same" />);

    await waitFor(() => expect(screen.getByRole('textbox').textContent).toBe('same'));
    view.rerender(<MarkdownEditor onChange={vi.fn()} value="same" />);
    view.rerender(<MarkdownEditor onChange={vi.fn()} readOnly value="same" />);

    await waitFor(() => expect(screen.getByRole('textbox')).toHaveAttribute('contenteditable', 'false'));

    expect(screen.getByRole('textbox').textContent).toBe('same');
  });
});
