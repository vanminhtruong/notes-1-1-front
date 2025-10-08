import { useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { X, FileText, Tag, AlertCircle } from 'lucide-react';
import { getYouTubeEmbedUrl } from '@/utils/youtube';
import { lockBodyScroll, unlockBodyScroll } from '@/utils/scrollLock';

interface SharedNoteData {
  id: number;
  title: string;
  content?: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  youtubeUrl?: string | null;
  category: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

interface ViewSharedNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: SharedNoteData;
}

const ViewSharedNoteModal = memo<ViewSharedNoteModalProps>(({ isOpen, onClose, note }) => {
  const { t } = useTranslation('dashboard');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'work': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'personal': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
      case 'general': return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  // Disable body scroll when modal is open (reference-counted)
  useEffect(() => {
    if (isOpen) {
      lockBodyScroll('ViewSharedNoteModal');
      return () => {
        unlockBodyScroll('ViewSharedNoteModal');
      };
    }
    return;
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      
      {/* Modal */}
      <div 
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('sharedNotes.viewNote') || 'Xem ghi chú'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                {t('sharedNotes.modal.title') || 'Tiêu đề'}
              </label>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {note.title}
              </h3>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <div className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${getCategoryColor(note.category)}`}>
                <Tag className="w-4 h-4" />
                {t(`filters.category.${note.category}`) || note.category}
              </div>
              <div className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${getPriorityColor(note.priority)}`}>
                <AlertCircle className="w-4 h-4" />
                {t(`filters.priority.${note.priority}`) || note.priority}
              </div>
            </div>

            {/* Video */}
            {note.videoUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {t('sharedNotes.modal.video') || 'Video'}
                </label>
                <div className="w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  <video
                    controls
                    src={note.videoUrl}
                    preload="metadata"
                    className="w-full max-h-96 object-contain"
                  />
                </div>
              </div>
            )}

            {/* Image */}
            {note.imageUrl && !note.videoUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {t('sharedNotes.modal.image') || 'Hình ảnh'}
                </label>
                <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={note.imageUrl} 
                    alt={note.title} 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* YouTube */}
            {note.youtubeUrl && getYouTubeEmbedUrl(note.youtubeUrl) && (
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {t('sharedNotes.modal.youtube') || 'YouTube'}
                </label>
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={getYouTubeEmbedUrl(note.youtubeUrl) || ''}
                    title={note.title}
                    className="absolute top-0 left-0 w-full h-full rounded-lg border border-gray-200 dark:border-gray-600"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Content */}
            {note.content && (
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {t('sharedNotes.modal.content') || 'Nội dung'}
                </label>
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              </div>
            )}

            {/* Created Date */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {t('notes.createdAt') || 'Tạo lúc'}: {new Date(note.createdAt).toLocaleString('vi-VN')}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            {t('notes.modal.close') || 'Đóng'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
});

ViewSharedNoteModal.displayName = 'ViewSharedNoteModal';

export default ViewSharedNoteModal;

