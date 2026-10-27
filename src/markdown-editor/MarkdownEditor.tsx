import {CodeNode} from '@lexical/code';
import {AutoLinkNode, LinkNode} from '@lexical/link';
import {ListItemNode, ListNode} from '@lexical/list';
import {$convertToMarkdownString, TRANSFORMERS} from '@lexical/markdown';
import {CheckListPlugin} from '@lexical/react/LexicalCheckListPlugin';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {LinkPlugin} from '@lexical/react/LexicalLinkPlugin';
import {ListPlugin} from '@lexical/react/LexicalListPlugin';
import {MarkdownShortcutPlugin} from '@lexical/react/LexicalMarkdownShortcutPlugin';
import {OnChangePlugin} from '@lexical/react/LexicalOnChangePlugin';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {HeadingNode, QuoteNode} from '@lexical/rich-text';
import {cn} from '@nlabs/utils';
import {useCallback, useMemo, useRef, useState} from 'react';

import {CaseFormatSanitizerPlugin} from './CaseFormatSanitizerPlugin.js';
import {CONTROLLED_VALUE_TAG, ControlledValuePlugin} from './ControlledValuePlugin.js';
import {EditablePlugin} from './EditablePlugin.js';
import {HIGHLIGHT_NAME, HighlightPlugin} from './HighlightPlugin.js';
import {MarkdownEditorToolbar} from './MarkdownEditorToolbar.js';
import {SelectionPlugin} from './SelectionPlugin.js';

import type {EditorThemeClasses} from 'lexical';
import type {CSSProperties, FC, MouseEvent} from 'react';
import type {HighlightAnchor} from './HighlightPlugin.js';
import type {MarkdownEditorProps} from './markdownEditorTypes.js';

const theme: EditorThemeClasses = {
  code: 'block rounded bg-slate-100 p-2 font-mono text-sm dark:bg-slate-800',
  heading: {
    h1: 'text-3xl font-semibold',
    h2: 'text-2xl font-semibold',
    h3: 'text-xl font-semibold',
    h4: 'text-lg font-semibold',
    h5: 'text-base font-semibold uppercase tracking-wide',
    h6: 'text-sm font-semibold uppercase tracking-wide'
  },
  link: 'text-sky-700 underline underline-offset-2 hover:text-sky-600 dark:text-sky-300',
  list: {
    checklist: 'list-none',
    listitem: 'ml-4',
    listitemChecked: 'line-through opacity-70',
    nested: {listitem: 'list-none'},
    ol: 'list-decimal ml-6',
    ul: 'list-disc ml-6'
  },
  paragraph: 'mb-1.5 leading-7',
  quote: 'border-l-2 border-sky-500 pl-4 italic text-slate-700 dark:text-slate-300',
  text: {
    bold: 'font-semibold',
    code: 'rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.95em] dark:bg-slate-800',
    italic: 'italic',
    strikethrough: 'line-through',
    underline: 'underline'
  }
};

const nodes = [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode, CodeNode];

const toCssSize = (size: number | string): string => (typeof size === 'number' ? `${size}px` : size);

const emptyHighlights: NonNullable<MarkdownEditorProps['highlights']> = [];

export const MarkdownEditor: FC<MarkdownEditorProps> = ({
  'aria-label': ariaLabel = 'Markdown editor',
  className,
  height = '100%',
  highlights = emptyHighlights,
  minHeight = '240px',
  onChange,
  onHighlightClick,
  onRequestLink,
  onSelectionChange,
  placeholder = '',
  readOnly = false,
  showToolbar = true,
  value
}) => {
  const lastMarkdownRef = useRef('');
  const [anchors, setAnchors] = useState<HighlightAnchor[]>([]);

  const initialConfig = useMemo(() => ({
    editable: true,
    namespace: 'GothamMarkdownEditor',
    nodes,
    onError: (error: Error) => {
      throw error;
    },
    theme
  }), []);

  const containerStyle: CSSProperties = {
    height: toCssSize(height),
    maxHeight: toCssSize(height),
    minHeight: toCssSize(minHeight)
  };

  const handleClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    if(!onHighlightClick || !anchors.length) {
      return;
    }

    const {clientX, clientY} = event;
    const match = anchors.find(({bottom, left, right, top}) => (
      clientX >= left && clientX <= right && clientY >= top && clientY <= bottom
    ));
    const highlight = highlights.find(({id}) => id === match?.highlightId);

    if(highlight) {
      onHighlightClick({clientX, clientY, highlight});
    }
  }, [anchors, highlights, onHighlightClick]);

  return (
    <div
      className={cn('relative flex min-h-0 flex-col overflow-hidden rounded-md border border-slate-300 bg-white text-slate-900 focus-within:border-sky-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100', className)}
      style={containerStyle}
    >
      <LexicalComposer initialConfig={initialConfig}>
        {showToolbar && !readOnly ? <MarkdownEditorToolbar onRequestLink={onRequestLink} /> : null}
        <div className="relative min-h-0 flex-1">
          <RichTextPlugin
            ErrorBoundary={LexicalErrorBoundary}
            contentEditable={(
              <ContentEditable
                aria-label={ariaLabel}
                aria-readonly={readOnly || undefined}
                className="h-full w-full overflow-auto overscroll-contain px-3 py-3 leading-7 outline-none"
                onClick={handleClick}
              />
            )}
            placeholder={placeholder ? (
              <div className="pointer-events-none absolute top-3 left-3 text-slate-400">{placeholder}</div>
            ) : null}
          />
        </div>
        <ControlledValuePlugin lastMarkdownRef={lastMarkdownRef} value={value} />
        <EditablePlugin editable={!readOnly} />
        <ListPlugin />
        <CheckListPlugin />
        <LinkPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <HistoryPlugin />
        <CaseFormatSanitizerPlugin />
        <HighlightPlugin highlights={highlights} onAnchorsChange={setAnchors} value={value} />
        <SelectionPlugin onSelectionChange={onSelectionChange} />
        <OnChangePlugin
          ignoreSelectionChange
          onChange={(editorState, _editor, tags) => {
            if(tags.has(CONTROLLED_VALUE_TAG)) {
              return;
            }

            editorState.read(() => {
              const markdown = $convertToMarkdownString(TRANSFORMERS, undefined, true);
              lastMarkdownRef.current = markdown;
              onChange?.(markdown);
            });
          }}
        />
      </LexicalComposer>
      <style>{`
        [contenteditable] { font-variant-caps: normal; text-transform: none; }
        ::highlight(${HIGHLIGHT_NAME}) { background: rgba(14, 165, 233, 0.25); }
      `}</style>
    </div>
  );
};
