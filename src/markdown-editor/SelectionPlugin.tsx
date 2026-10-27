import {$convertToMarkdownString, TRANSFORMERS} from '@lexical/markdown';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$getSelection, $isRangeSelection, COMMAND_PRIORITY_LOW, SELECTION_CHANGE_COMMAND} from 'lexical';
import {useEffect, useRef} from 'react';

import type {FC} from 'react';
import type {MarkdownEditorSelection} from './markdownEditorTypes.js';

export interface SelectionPluginProps {
  readonly onSelectionChange?: (selection: MarkdownEditorSelection | null) => void;
}

export const SelectionPlugin: FC<SelectionPluginProps> = ({onSelectionChange}) => {
  const [editor] = useLexicalComposerContext();
  const lastStartRef = useRef(0);

  useEffect(() => {
    if(!onSelectionChange) {
      return undefined;
    }

    const emitSelection = () => {
      editor.getEditorState().read(() => {
        const selection = $getSelection();

        if(!$isRangeSelection(selection) || selection.isCollapsed()) {
          onSelectionChange(null);
          return;
        }

        const text = selection.getTextContent();

        if(!text.trim()) {
          onSelectionChange(null);
          return;
        }

        const markdown = $convertToMarkdownString(TRANSFORMERS, undefined, true);
        let start = markdown.indexOf(text, Math.max(0, lastStartRef.current - 200));

        if(start < 0) {
          start = markdown.indexOf(text);
        }

        if(start < 0) {
          onSelectionChange({end: text.length, start: 0, text});
          return;
        }

        lastStartRef.current = start;
        onSelectionChange({end: start + text.length, start, text});
      });
    };

    const unregisterSelection = editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
      emitSelection();
      return false;
    }, COMMAND_PRIORITY_LOW);
    const unregisterUpdate = editor.registerUpdateListener(emitSelection);

    emitSelection();

    return () => {
      unregisterSelection();
      unregisterUpdate();
    };
  }, [editor, onSelectionChange]);

  return null;
};
