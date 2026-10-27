import {$convertFromMarkdownString, TRANSFORMERS} from '@lexical/markdown';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$getRoot, $nodesOfType, $setSelection, TextNode} from 'lexical';
import {useEffect, useRef} from 'react';

import type {FC, RefObject} from 'react';

export const CONTROLLED_VALUE_TAG = 'gothamui-controlled-value';

export const stripUnsupportedCaseFormats = () => {
  for(const node of $nodesOfType(TextNode)) {
    for(const format of ['uppercase', 'capitalize', 'lowercase'] as const) {
      if(node.hasFormat(format)) {
        node.toggleFormat(format);
      }
    }
  }
};

export interface ControlledValuePluginProps {
  readonly lastMarkdownRef: RefObject<string>;
  readonly value: string;
}

export const ControlledValuePlugin: FC<ControlledValuePluginProps> = ({lastMarkdownRef, value}) => {
  const [editor] = useLexicalComposerContext();
  const appliedRef = useRef<string>('');

  useEffect(() => {
    const next = value ?? '';

    if(next === appliedRef.current || next === lastMarkdownRef.current) {
      return;
    }

    appliedRef.current = next;
    lastMarkdownRef.current = next;
    editor.update(() => {
      $getRoot().clear();
      $convertFromMarkdownString(next, TRANSFORMERS, undefined, true);
      stripUnsupportedCaseFormats();
      $setSelection(null);
    }, {discrete: true, tag: CONTROLLED_VALUE_TAG});

    // Finish controlled initialization before a subsequent user selection or keystroke.
    const rootElement = editor.getRootElement();
    const selection = window.getSelection();

    if(rootElement?.contains(document.activeElement)) {
      (document.activeElement as HTMLElement | null)?.blur();
    }

    if(selection?.anchorNode && rootElement?.contains(selection.anchorNode)) {
      selection.removeAllRanges();
    }
  }, [editor, lastMarkdownRef, value]);

  return null;
};
