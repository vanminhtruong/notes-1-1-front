import { useEffect, useState, useRef, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { X, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Code, Quote, Link2, Minus, Undo, Redo } from 'lucide-react';
import { lockBodyScroll, unlockBodyScroll } from '@/utils/scrollLock';

interface RichTextEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (html: string) => void;
  title?: string;
}

const RichTextEditorModal = memo<RichTextEditorModalProps>(({ isOpen, onClose, value, onChange, title }) => {
  const { t } = useTranslation('dashboard');
  const [content, setContent] = useState(value);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setContent(value);
      lockBodyScroll('RichTextEditorModal');
      return () => {
        unlockBodyScroll('RichTextEditorModal');
      };
    }
    return;
  }, [isOpen, value]);

  const handleSave = () => {
    onChange(content);
    onClose();
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = prompt(t('richEditor.linkPrompt') || 'Nhập URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-md"
      onKeyDown={handleKeyDown}
    >
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl xl-down:rounded-xl lg-down:rounded-lg md-down:rounded-lg sm-down:rounded-lg xs-down:rounded-lg shadow-2xl w-full max-w-4xl xl-down:max-w-3xl lg-down:max-w-2xl md-down:max-w-full sm-down:max-w-full xs-down:max-w-full mx-4 xl-down:mx-3 lg-down:mx-2 md-down:mx-2 sm-down:mx-2 xs-down:mx-2 max-h-[90vh] xl-down:max-h-[88vh] lg-down:max-h-[86vh] md-down:max-h-[90vh] sm-down:max-h-[92vh] xs-down:max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 xl-down:p-5 lg-down:p-4 md-down:p-4 sm-down:p-4 xs-down:p-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl xl-down:text-lg lg-down:text-base md-down:text-base sm-down:text-base xs-down:text-sm font-semibold text-gray-900 dark:text-white">
            {title || t('richEditor.title') || 'Chỉnh sửa nội dung'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 xl-down:p-1.5 lg-down:p-1 md-down:p-1.5 sm-down:p-1.5 xs-down:p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg xl-down:rounded-md lg-down:rounded md-down:rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 xl-down:w-4.5 xl-down:h-4.5 lg-down:w-4 lg-down:h-4 md-down:w-5 md-down:h-5 sm-down:w-5 sm-down:h-5 xs-down:w-4 xs-down:h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 p-4 xl-down:p-3 lg-down:p-3 md-down:p-3 sm-down:p-3 xs-down:p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {/* Text formatting */}
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
            <button
              type="button"
              onClick={() => execCommand('bold')}
              className="p-2 xl-down:p-1.5 lg-down:p-1.5 md-down:p-2 sm-down:p-2 xs-down:p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={t('richEditor.bold') || 'Đậm'}
            >
              <Bold className="w-4 h-4 md-down:w-5 md-down:h-5 xs-down:w-4 xs-down:h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('italic')}
              className="p-2 xl-down:p-1.5 lg-down:p-1.5 md-down:p-2 sm-down:p-2 xs-down:p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={t('richEditor.italic') || 'Nghiêng'}
            >
              <Italic className="w-4 h-4 md-down:w-5 md-down:h-5 xs-down:w-4 xs-down:h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('underline')}
              className="p-2 xl-down:p-1.5 lg-down:p-1.5 md-down:p-2 sm-down:p-2 xs-down:p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={t('richEditor.underline') || 'Gạch chân'}
            >
              <Underline className="w-4 h-4 md-down:w-5 md-down:h-5 xs-down:w-4 xs-down:h-4" />
            </button>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
            <button
              type="button"
              onClick={() => execCommand('formatBlock', '<h1>')}
              className="p-2 xl-down:p-1.5 lg-down:p-1.5 md-down:p-2 sm-down:p-2 xs-down:p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={t('richEditor.heading1') || 'Tiêu đề 1'}
            >
              <Heading1 className="w-4 h-4 md-down:w-5 md-down:h-5 xs-down:w-4 xs-down:h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('formatBlock', '<h2>')}
              className="p-2 xl-down:p-1.5 lg-down:p-1.5 md-down:p-2 sm-down:p-2 xs-down:p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={t('richEditor.heading2') || 'Tiêu đề 2'}
            >
              <Heading2 className="w-4 h-4 md-down:w-5 md-down:h-5 xs-down:w-4 xs-down:h-4" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
            <button
              type="button"
              onClick={() => execCommand('insertUnorderedList')}
              className="p-2 xl-down:p-1.5 lg-down:p-1.5 md-down:p-2 sm-down:p-2 xs-down:p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={t('richEditor.bulletList') || 'Danh sách dấu đầu dòng'}
            >
              <List className="w-4 h-4 md-down:w-5 md-down:h-5 xs-down:w-4 xs-down:h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('insertOrderedList')}
              className="p-2 xl-down:p-1.5 lg-down:p-1.5 md-down:p-2 sm-down:p-2 xs-down:p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={t('richEditor.numberedList') || 'Danh sách đánh số'}
            >
              <ListOrdered className="w-4 h-4 md-down:w-5 md-down:h-5 xs-down:w-4 xs-down:h-4" />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
            <button
              type="button"
              onClick={() => execCommand('justifyLeft')}
              className="p-2 xl-down:p-1.5 lg-down:p-1.5 md-down:p-2 sm-down:p-2 xs-down:p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={t('richEditor.alignLeft') || 'Căn trái'}
            >
              <AlignLeft className="w-4 h-4 md-down:w-5 md-down:h-5 xs-down:w-4 xs-down:h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('justifyCenter')}
              className="p-2 xl-down:p-1.5 lg-down:p-1.5 md-down:p-2 sm-down:p-2 xs-down:p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={t('richEditor.alignCenter') || 'Căn giữa'}
            >
              <AlignCenter className="w-4 h-4 md-down:w-5 md-down:h-5 xs-down:w-4 xs-down:h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('justifyRight')}
              className="p-2 xl-down:p-1.5 lg-down:p-1.5 md-down:p-2 sm-down:p-2 xs-down:p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={t('richEditor.alignRight') || 'Căn phải'}
            >
              <AlignRight className="w-4 h-4 md-down:w-5 md-down:h-5 xs-down:w-4 xs-down:h-4" />
            </button>
          </div>

          {/* Additional */}
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
            <button
              type="button"
              onClick={insertLink}
              className="p-2 xl-down:p-1.5 lg-down:p-1.5 md-down:p-2 sm-down:p-2 xs-down:p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={t('richEditor.link') || 'Chèn link'}
            >
              <Link2 className="w-4 h-4 md-down:w-5 md-down:h-5 xs-down:w-4 xs-down:h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('insertHorizontalRule')}
              className="p-2 xl-down:p-1.5 lg-down:p-1.5 md-down:p-2 sm-down:p-2 xs-down:p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={t('richEditor.horizontalLine') || 'Đường kẻ ngang'}
            >
              <Minus className="w-4 h-4 md-down:w-5 md-down:h-5 xs-down:w-4 xs-down:h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('formatBlock', '<blockquote>')}
              className="p-2 xl-down:p-1.5 lg-down:p-1.5 md-down:p-2 sm-down:p-2 xs-down:p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={t('richEditor.quote') || 'Trích dẫn'}
            >
              <Quote className="w-4 h-4 md-down:w-5 md-down:h-5 xs-down:w-4 xs-down:h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('formatBlock', '<pre>')}
              className="p-2 xl-down:p-1.5 lg-down:p-1.5 md-down:p-2 sm-down:p-2 xs-down:p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={t('richEditor.code') || 'Code'}
            >
              <Code className="w-4 h-4 md-down:w-5 md-down:h-5 xs-down:w-4 xs-down:h-4" />
            </button>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => execCommand('undo')}
              className="p-2 xl-down:p-1.5 lg-down:p-1.5 md-down:p-2 sm-down:p-2 xs-down:p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={t('richEditor.undo') || 'Hoàn tác'}
            >
              <Undo className="w-4 h-4 md-down:w-5 md-down:h-5 xs-down:w-4 xs-down:h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('redo')}
              className="p-2 xl-down:p-1.5 lg-down:p-1.5 md-down:p-2 sm-down:p-2 xs-down:p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={t('richEditor.redo') || 'Làm lại'}
            >
              <Redo className="w-4 h-4 md-down:w-5 md-down:h-5 xs-down:w-4 xs-down:h-4" />
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto p-6 xl-down:p-5 lg-down:p-4 md-down:p-4 sm-down:p-4 xs-down:p-3">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => setContent(e.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: content }}
            className="min-h-[300px] md-down:min-h-[250px] sm-down:min-h-[200px] xs-down:min-h-[150px] p-4 xl-down:p-3 lg-down:p-3 md-down:p-4 sm-down:p-4 xs-down:p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg xl-down:rounded-md lg-down:rounded md-down:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white prose dark:prose-invert max-w-none prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1"
            style={{
              fontSize: '14px',
              lineHeight: '1.6',
            }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 xl-down:gap-2.5 lg-down:gap-2 md-down:gap-3 sm-down:gap-3 xs-down:gap-2 p-6 xl-down:p-5 lg-down:p-4 md-down:p-4 sm-down:p-4 xs-down:p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 xl-down:px-5 xl-down:py-1.5 lg-down:px-4 lg-down:py-1.5 md-down:px-6 md-down:py-2 sm-down:px-6 sm-down:py-2 xs-down:px-5 xs-down:py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg xl-down:rounded-md lg-down:rounded-md md-down:rounded-lg font-medium text-base xl-down:text-sm lg-down:text-sm md-down:text-base sm-down:text-base xs-down:text-sm transition-colors"
          >
            {t('actions.cancel') || 'Hủy'}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 xl-down:px-5 xl-down:py-1.5 lg-down:px-4 lg-down:py-1.5 md-down:px-6 md-down:py-2 sm-down:px-6 sm-down:py-2 xs-down:px-5 xs-down:py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg xl-down:rounded-md lg-down:rounded-md md-down:rounded-lg font-medium text-base xl-down:text-sm lg-down:text-sm md-down:text-base sm-down:text-base xs-down:text-sm transition-colors"
          >
            {t('actions.save') || 'Lưu'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
});

RichTextEditorModal.displayName = 'RichTextEditorModal';

export default RichTextEditorModal;
