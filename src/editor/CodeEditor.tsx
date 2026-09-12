import {Editor as MonacoEditor} from '@monaco-editor/react';
import {memo} from 'react';

import type {EditorProps} from '@monaco-editor/react';

export type CodeEditorProps = EditorProps;

/**
 * Shared code editor backed by Monaco.
 *
 * Import from `@nlabs/gothamui/editor` so Monaco remains outside the normal
 * GothamUI component entry point for applications that do not use an editor.
 */
const CodeEditorComponent = (props: CodeEditorProps) => (
  <MonacoEditor {...props} />
);

export type {
  BeforeMount,
  EditorProps,
  Monaco,
  OnChange,
  OnMount,
  OnValidate
} from '@monaco-editor/react';

export const CodeEditor = memo(CodeEditorComponent);
CodeEditor.displayName = 'CodeEditor';
