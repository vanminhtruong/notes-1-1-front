import React, { memo, useEffect, useRef } from 'react';
import { EditorContent, Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Link as LinkIcon,
  Code,
  Quote,
  Minus,
} from 'lucide-react';
import './editor.css';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface RichTextEditorProps {
  editor: Editor | null;
  placeholder?: string;
  className?: string;
}

const ToolbarButton = memo(({
  onClick,
  isActive = false,
  disabled = false,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    } disabled:opacity-30 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
));

ToolbarButton.displayName = 'ToolbarButton';

const Divider = () => (
  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
);

const RichTextEditor = memo(({ editor, placeholder: _placeholder, className = '' }: RichTextEditorProps) => {
  const { t } = useTranslation('dashboard');
  if (!editor) {
    return (
      <div className={`border border-gray-300 dark:border-gray-600 rounded-lg p-4 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">{t('editor.loading', { defaultValue: 'Loading editor...' })}</p>
      </div>
    );
  }

  const normalizeUrl = (input: string) => {
    let href = (input || '').trim();
    if (!href) return '';
    if (/^javascript:/i.test(href)) return '';
    if (!/^https?:\/\//i.test(href)) href = `https://${href}`;
    return href;
  };

  const LinkToast: React.FC<{ toastId: string; defaultValue?: string; onSubmit: (val: string) => void; onCancel: () => void; }> = ({ toastId, defaultValue = '', onSubmit, onCancel }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
      const el = inputRef.current;
      el?.focus();
      el?.select();
    }, []);
    return (
      <div className="max-w-sm w-[360px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg p-3 flex items-center gap-2">
        <input
          ref={inputRef}
          id={`link-url-${toastId}`}
          type="url"
          defaultValue={defaultValue}
          placeholder={t('editor.link.placeholder', { defaultValue: 'https://...' })}
          className="flex-1 px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const value = (e.currentTarget as HTMLInputElement).value;
              onSubmit(value);
            } else if (e.key === 'Escape') {
              onCancel();
            }
          }}
        />
        <button
          type="button"
          className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => onSubmit(inputRef.current?.value || '')}
        >
          {t('editor.link.add', { defaultValue: 'Add' })}
        </button>
        <button
          type="button"
          className="px-2 py-1 text-sm text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={onCancel}
        >
          {t('editor.link.cancel', { defaultValue: 'Cancel' })}
        </button>
      </div>
    );
  };

  const addLink = () => {
    const current = editor.getAttributes('link')?.href as string | undefined;
    const id = toast.custom((toastEvt) => (
      <LinkToast
        toastId={String(toastEvt.id)}
        defaultValue={current || ''}
        onSubmit={(raw) => {
          const href = normalizeUrl(raw);
          if (!href) {
            toast.error(t('editor.link.invalidUrl', { defaultValue: 'Invalid URL' }));
            return;
          }
          editor.chain().focus().setLink({ href }).run();
          toast.dismiss(toastEvt.id);
          toast.success(t('editor.link.inserted', { defaultValue: 'Link inserted' }));
        }}
        onCancel={() => toast.dismiss(toastEvt.id)}
      />
    ), { duration: 60000, position: 'top-center' });
    return id;
  };

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title={t('editor.toolbar.bold', { defaultValue: 'Bold (Ctrl+B)' })}
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title={t('editor.toolbar.italic', { defaultValue: 'Italic (Ctrl+I)' })}
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title={t('editor.toolbar.underline', { defaultValue: 'Underline (Ctrl+U)' })}
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title={t('editor.toolbar.strike', { defaultValue: 'Strikethrough' })}
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title={t('editor.toolbar.code', { defaultValue: 'Code' })}
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title={t('editor.toolbar.h1', { defaultValue: 'Heading 1' })}
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title={t('editor.toolbar.h2', { defaultValue: 'Heading 2' })}
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title={t('editor.toolbar.h3', { defaultValue: 'Heading 3' })}
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title={t('editor.toolbar.bulletList', { defaultValue: 'Bulleted list' })}
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title={t('editor.toolbar.orderedList', { defaultValue: 'Numbered list' })}
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title={t('editor.toolbar.alignLeft', { defaultValue: 'Align left' })}
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title={t('editor.toolbar.alignCenter', { defaultValue: 'Align center' })}
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title={t('editor.toolbar.alignRight', { defaultValue: 'Align right' })}
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={editor.isActive({ textAlign: 'justify' })}
          title={t('editor.toolbar.alignJustify', { defaultValue: 'Justify' })}
        >
          <AlignJustify className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Other */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title={t('editor.toolbar.blockquote', { defaultValue: 'Blockquote' })}
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title={t('editor.toolbar.horizontalRule', { defaultValue: 'Horizontal rule' })}
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={addLink}
          isActive={editor.isActive('link')}
          title={t('editor.link.addTitle', { defaultValue: 'Add link' })}
        >
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title={t('editor.toolbar.undo', { defaultValue: 'Undo (Ctrl+Z)' })}
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title={t('editor.toolbar.redo', { defaultValue: 'Redo (Ctrl+Y)' })}
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="prose prose-sm dark:prose-invert max-w-none p-4 min-h-[200px] focus:outline-none"
      />
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
