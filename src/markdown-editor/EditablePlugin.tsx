import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useEffect} from 'react';

import type {FC} from 'react';

export interface EditablePluginProps {
  readonly editable: boolean;
}

export const EditablePlugin: FC<EditablePluginProps> = ({editable}) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.setEditable(editable);
  }, [editor, editable]);

  return null;
};
