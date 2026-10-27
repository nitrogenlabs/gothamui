export interface MarkdownEditorSelection {
  end: number;
  start: number;
  text: string;
}

/**
 * A generic highlighted range. `start`/`end` are offsets into the markdown value. When `text` is provided the range is
 * located by searching the rendered text for it (robust against markdown syntax shifting offsets), falling back to the
 * offsets over the rendered text.
 */
export interface MarkdownEditorHighlight {
  end: number;
  id: string;
  start: number;
  text?: string;
}

export interface MarkdownEditorHighlightClick {
  clientX: number;
  clientY: number;
  highlight: MarkdownEditorHighlight;
}

export interface MarkdownEditorProps {
  readonly 'aria-label'?: string;
  readonly className?: string;
  readonly height?: number | string;
  readonly highlights?: MarkdownEditorHighlight[];
  readonly minHeight?: number | string;
  readonly onChange?: (value: string) => void;
  readonly onHighlightClick?: (event: MarkdownEditorHighlightClick) => void;
  readonly onRequestLink?: () => null | string | Promise<null | string>;
  readonly onSelectionChange?: (selection: MarkdownEditorSelection | null) => void;
  readonly placeholder?: string;
  readonly readOnly?: boolean;
  readonly showToolbar?: boolean;
  readonly value: string;
}
