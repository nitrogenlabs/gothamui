import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$nodesOfType, TextNode} from 'lexical';
import {useEffect} from 'react';

import {stripUnsupportedCaseFormats} from './ControlledValuePlugin.js';

import type {FC} from 'react';

export const CaseFormatSanitizerPlugin: FC = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    let sanitizing = false;

    return editor.registerUpdateListener(({editorState}) => {
      if(sanitizing) {
        return;
      }

      let needsSanitizing = false;
      editorState.read(() => {
        needsSanitizing = $nodesOfType(TextNode).some((node) => (
          node.hasFormat('uppercase') || node.hasFormat('capitalize') || node.hasFormat('lowercase')
        ));
      });

      if(!needsSanitizing) {
        return;
      }

      sanitizing = true;
      editor.update(stripUnsupportedCaseFormats, {onUpdate: () => {
        sanitizing = false;
      }});
    });
  }, [editor]);

  return null;
};
