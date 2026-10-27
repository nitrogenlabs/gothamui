import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useEffect} from 'react';

import type {FC} from 'react';
import type {MarkdownEditorHighlight} from './markdownEditorTypes.js';

export const HIGHLIGHT_NAME = 'gothamui-markdown-highlight';

export interface HighlightAnchor {
  bottom: number;
  highlightId: string;
  left: number;
  right: number;
  top: number;
}

const locateRange = (root: HTMLElement, start: number, end: number): Range | null => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let cursor = 0;
  let startNode: Text | null = null;
  let endNode: Text | null = null;
  let startOffset = 0;
  let endOffset = 0;

  while(walker.nextNode()) {
    const node = walker.currentNode as Text;
    const length = node.textContent?.length || 0;

    if(!startNode && start >= cursor && start <= cursor + length) {
      startNode = node;
      startOffset = start - cursor;
    }

    if(end >= cursor && end <= cursor + length) {
      endNode = node;
      endOffset = end - cursor;
      break;
    }

    cursor += length;
  }

  if(!startNode || !endNode) {
    return null;
  }

  const range = new Range();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  return range;
};

export interface HighlightPluginProps {
  readonly highlights: MarkdownEditorHighlight[];
  readonly onAnchorsChange: (anchors: HighlightAnchor[]) => void;
  readonly value: string;
}

export const HighlightPlugin: FC<HighlightPluginProps> = ({highlights, onAnchorsChange, value}) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const cssHighlights = (window.CSS as unknown as {highlights?: Map<string, unknown>})?.highlights;
    const HighlightCtor = (window as unknown as {Highlight?: new (...ranges: Range[]) => unknown}).Highlight;

    if(!cssHighlights || !HighlightCtor) {
      return undefined;
    }

    const apply = () => {
      const root = editor.getRootElement();
      cssHighlights.delete(HIGHLIGHT_NAME);

      if(!root || !highlights.length) {
        onAnchorsChange([]);
        return;
      }

      const rootText = root.textContent || '';
      const ranges: Range[] = [];
      const anchors: HighlightAnchor[] = [];
      let searchOffset = 0;

      for(const highlight of highlights) {
        const snippet = highlight.text?.trim();
        let from = highlight.start;
        let to = highlight.end;

        if(snippet) {
          const index = rootText.indexOf(snippet, searchOffset);
          from = index >= 0 ? index : rootText.indexOf(snippet);
          to = from + snippet.length;
        }

        if(from < 0 || to <= from) {
          continue;
        }

        const range = locateRange(root, from, to);

        if(!range) {
          continue;
        }

        ranges.push(range);
        searchOffset = to;

        for(const rect of Array.from(range.getClientRects())) {
          anchors.push({
            bottom: rect.bottom,
            highlightId: highlight.id,
            left: rect.left,
            right: rect.right,
            top: rect.top
          });
        }
      }

      if(ranges.length) {
        cssHighlights.set(HIGHLIGHT_NAME, new HighlightCtor(...ranges));
      }

      onAnchorsChange(anchors);
    };

    apply();
    const unregister = editor.registerUpdateListener(apply);

    return () => {
      unregister();
      cssHighlights.delete(HIGHLIGHT_NAME);
      onAnchorsChange([]);
    };
  }, [editor, highlights, onAnchorsChange, value]);

  return null;
};
