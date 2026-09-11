import {Editor as MonacoEditor} from '@monaco-editor/react';

import type {EditorProps} from '@monaco-editor/react';

export type CodeEditorProps = EditorProps;

/**
 * Shared code editor backed by Monaco.
 *
 * Import from `@nlabs/gothamjs/editor` so Monaco remains outside the normal
 * GothamJS component entry point for applications that do not use an editor.
 */
export const CodeEditor = (props: CodeEditorProps) => (
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
