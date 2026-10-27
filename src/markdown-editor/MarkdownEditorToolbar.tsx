import {TOGGLE_LINK_COMMAND} from '@lexical/link';
import {INSERT_CHECK_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND} from '@lexical/list';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$createHeadingNode, $createQuoteNode, $isHeadingNode, $isQuoteNode} from '@lexical/rich-text';
import {$setBlocksType} from '@lexical/selection';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND
} from 'lexical';
import {
  Bold,
  CheckSquare,
  Code,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2
} from 'lucide-react';
import {useCallback, useEffect, useState} from 'react';

import type {HeadingTagType} from '@lexical/rich-text';
import type {LucideIcon} from 'lucide-react';
import type {FC} from 'react';

type BlockType = 'paragraph' | 'quote' | HeadingTagType;

export interface MarkdownEditorToolbarProps {
  readonly onRequestLink?: () => null | string | Promise<null | string>;
}

const buttonClass = 'inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-500 disabled:cursor-default disabled:opacity-40 aria-pressed:bg-sky-100 aria-pressed:text-sky-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:aria-pressed:bg-sky-900/50 dark:aria-pressed:text-sky-200';

const defaultRequestLink = () => window.prompt('Enter URL (https://...)');

interface ToolButtonProps {
  readonly disabled?: boolean;
  readonly icon: LucideIcon;
  readonly label: string;
  readonly onClick: () => void;
  readonly pressed?: boolean;
}

const ToolButton: FC<ToolButtonProps> = ({disabled = false, icon: Icon, label, onClick, pressed}) => (
  <button
    aria-label={label}
    aria-pressed={pressed}
    className={buttonClass}
    disabled={disabled}
    onClick={onClick}
    onMouseDown={(event) => event.preventDefault()}
    title={label}
    type="button"
  >
    <Icon aria-hidden="true" className="size-4" />
  </button>
);

export const MarkdownEditorToolbar: FC<MarkdownEditorToolbarProps> = ({onRequestLink = defaultRequestLink}) => {
  const [editor] = useLexicalComposerContext();
  const [blockType, setBlockType] = useState<BlockType>('paragraph');
  const [formats, setFormats] = useState({bold: false, code: false, italic: false});
  const [canRedo, setCanRedo] = useState(false);
  const [canUndo, setCanUndo] = useState(false);

  const readState = useCallback(() => {
    const selection = $getSelection();

    if(!$isRangeSelection(selection)) {
      return;
    }

    const top = selection.anchor.getNode().getTopLevelElement();
    if($isHeadingNode(top)) {
      setBlockType(top.getTag());
    } else {
      setBlockType($isQuoteNode(top) ? 'quote' : 'paragraph');
    }

    setFormats({bold: selection.hasFormat('bold'), code: selection.hasFormat('code'), italic: selection.hasFormat('italic')});
  }, []);

  useEffect(() => {
    const unregister = [
      editor.registerUpdateListener(({editorState}) => editorState.read(readState)),
      editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
        editor.getEditorState().read(readState);
        return false;
      }, COMMAND_PRIORITY_LOW),
      editor.registerCommand(CAN_UNDO_COMMAND, (payload) => {
        setCanUndo(payload);
        return false;
      }, COMMAND_PRIORITY_LOW),
      editor.registerCommand(CAN_REDO_COMMAND, (payload) => {
        setCanRedo(payload);
        return false;
      }, COMMAND_PRIORITY_LOW)
    ];

    return () => unregister.forEach((fn) => fn());
  }, [editor, readState]);

  const setBlock = (type: BlockType) => {
    editor.update(() => {
      const selection = $getSelection();

      if(!$isRangeSelection(selection)) {
        return;
      }

      $setBlocksType(selection, () => {
        if(type === 'paragraph') {
          return $createParagraphNode();
        }

        return type === 'quote' ? $createQuoteNode() : $createHeadingNode(type);
      });
    });
  };

  const toggleQuote = () => setBlock(blockType === 'quote' ? 'paragraph' : 'quote');

  const addLink = async () => {
    const url = (await onRequestLink())?.trim();

    if(url) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
    }
  };

  const format = (type: 'bold' | 'code' | 'italic') => editor.dispatchCommand(FORMAT_TEXT_COMMAND, type);

  return (
    <div
      aria-label="Formatting"
      className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-900"
      role="toolbar"
    >
      <ToolButton disabled={!canUndo} icon={Undo2} label="Undo" onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} />
      <ToolButton disabled={!canRedo} icon={Redo2} label="Redo" onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} />
      <span aria-hidden="true" className="mx-1 h-5 w-px bg-slate-300 dark:bg-slate-700" />
      <select
        aria-label="Block style"
        className="h-8 rounded-md border border-transparent bg-transparent px-1 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
        onChange={(event) => setBlock(event.target.value as BlockType)}
        value={blockType}
      >
        <option value="paragraph">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="h4">Heading 4</option>
        <option value="h5">Heading 5</option>
        <option value="h6">Heading 6</option>
        <option value="quote">Quote</option>
      </select>
      <span aria-hidden="true" className="mx-1 h-5 w-px bg-slate-300 dark:bg-slate-700" />
      <ToolButton icon={Bold} label="Bold" onClick={() => format('bold')} pressed={formats.bold} />
      <ToolButton icon={Italic} label="Italic" onClick={() => format('italic')} pressed={formats.italic} />
      <ToolButton icon={Code} label="Inline code" onClick={() => format('code')} pressed={formats.code} />
      <ToolButton icon={LinkIcon} label="Add link" onClick={addLink} />
      <span aria-hidden="true" className="mx-1 h-5 w-px bg-slate-300 dark:bg-slate-700" />
      <ToolButton icon={List} label="Bulleted list" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} />
      <ToolButton icon={ListOrdered} label="Numbered list" onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} />
      <ToolButton icon={CheckSquare} label="Checklist" onClick={() => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)} />
      <ToolButton icon={List} label="Remove list" onClick={() => editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)} />
      <ToolButton icon={Quote} label="Quote" onClick={toggleQuote} pressed={blockType === 'quote'} />
    </div>
  );
};
