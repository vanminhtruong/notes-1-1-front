import { useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { X, FileText, Tag, AlertCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { getYouTubeEmbedUrl } from '@/utils/youtube';
import { lockBodyScroll, unlockBodyScroll } from '@/utils/scrollLock';

interface SharedNoteData {
  id: number;
  title: string;
  content?: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  youtubeUrl?: string | null;
  category?: string | { id: number; name: string; color: string; icon: string } | null;
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
        className="relative bg-white dark:bg-gray-800 rounded-2xl xl-down:rounded-xl lg-down:rounded-lg md-down:rounded-lg sm-down:rounded-lg xs-down:rounded-lg shadow-2xl w-full max-w-2xl xl-down:max-w-xl lg-down:max-w-lg md-down:max-w-full sm-down:max-w-full xs-down:max-w-full mx-4 xl-down:mx-3 lg-down:mx-2 md-down:mx-2 sm-down:mx-2 xs-down:mx-2 max-h-[90vh] xl-down:max-h-[88vh] lg-down:max-h-[86vh] md-down:max-h-[90vh] sm-down:max-h-[92vh] xs-down:max-h-[94vh] flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 xl-down:p-5 lg-down:p-4 md-down:p-4 sm-down:p-4 xs-down:p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 xl-down:gap-2.5 lg-down:gap-2 md-down:gap-2 sm-down:gap-2 xs-down:gap-2">
            <div className="w-10 h-10 xl-down:w-9 xl-down:h-9 lg-down:w-8 lg-down:h-8 md-down:w-8 md-down:h-8 sm-down:w-8 sm-down:h-8 xs-down:w-7 xs-down:h-7 rounded-lg xl-down:rounded-md lg-down:rounded md-down:rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5 xl-down:w-4.5 xl-down:h-4.5 lg-down:w-4 lg-down:h-4 md-down:w-4 md-down:h-4 sm-down:w-4 sm-down:h-4 xs-down:w-3.5 xs-down:h-3.5 text-white" />
            </div>
            <h2 className="text-xl xl-down:text-lg lg-down:text-base md-down:text-base sm-down:text-base xs-down:text-sm font-semibold text-gray-900 dark:text-white">
              {t('sharedNotes.viewNote') || 'Xem ghi chú'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 xl-down:p-1.5 lg-down:p-1 md-down:p-1.5 sm-down:p-1.5 xs-down:p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg xl-down:rounded-md lg-down:rounded md-down:rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 xl-down:w-4.5 xl-down:h-4.5 lg-down:w-4 lg-down:h-4 md-down:w-5 md-down:h-5 sm-down:w-5 sm-down:h-5 xs-down:w-4 xs-down:h-4" />
          </button>
        </div>
        {/* Body */}
        <div className="p-6 xl-down:p-5 lg-down:p-4 md-down:p-4 sm-down:p-4 xs-down:p-3 overflow-y-auto flex-1">
          <div className="space-y-6 xl-down:space-y-5 lg-down:space-y-4 md-down:space-y-4 sm-down:space-y-4 xs-down:space-y-3">
            {/* Title */}
            <div>
              <label className="block text-sm xl-down:text-xs lg-down:text-xs md-down:text-sm sm-down:text-sm xs-down:text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 xl-down:mb-1.5 lg-down:mb-1.5 md-down:mb-2 sm-down:mb-2 xs-down:mb-1.5">
                {t('sharedNotes.modal.title') || 'Tiêu đề'}
              </label>
              <h3 className="text-lg xl-down:text-base lg-down:text-base md-down:text-lg sm-down:text-lg xs-down:text-base font-semibold text-gray-900 dark:text-white">
                {note.title}
              </h3>
            </div>

            {/* Content (moved here directly after title) */}
            {note.content && (
              <div>
                <label className="block text-sm xl-down:text-xs lg-down:text-xs md-down:text-sm sm-down:text-sm xs-down:text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 xl-down:mb-1.5 lg-down:mb-1.5 md-down:mb-2 sm-down:mb-2 xs-down:mb-1.5">
                  {t('sharedNotes.modal.content') || 'Nội dung'}
                </label>
                <div className="px-4 py-3 xl-down:px-3 xl-down:py-2.5 lg-down:px-3 lg-down:py-2.5 md-down:px-4 md-down:py-3 sm-down:px-4 sm-down:py-3 xs-down:px-3 xs-down:py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg xl-down:rounded-md lg-down:rounded-md md-down:rounded-lg border border-gray-200 dark:border-gray-600">
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 text-sm xl-down:text-xs lg-down:text-xs md-down:text-sm sm-down:text-sm xs-down:text-xs"
                    dangerouslySetInnerHTML={{ __html: note.content }}
                  />
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 xl-down:gap-1.5 lg-down:gap-1.5 md-down:gap-2 sm-down:gap-2 xs-down:gap-1.5">
              {note.category && typeof note.category === 'object' && note.category.name ? (
                <div 
                  className="px-3 py-1.5 xl-down:px-2.5 xl-down:py-1 lg-down:px-2 lg-down:py-1 md-down:px-3 md-down:py-1.5 sm-down:px-3 sm-down:py-1.5 xs-down:px-2.5 xs-down:py-1 rounded-full xl-down:rounded-lg lg-down:rounded-lg md-down:rounded-full text-sm xl-down:text-xs lg-down:text-xs md-down:text-sm sm-down:text-sm xs-down:text-xs font-medium flex items-center gap-2 xl-down:gap-1.5 lg-down:gap-1.5 md-down:gap-2 sm-down:gap-2 xs-down:gap-1.5"
                  style={{ 
                    backgroundColor: `${note.category.color}20`,
                    color: note.category.color
                  }}
                >
                  {(() => {
                    const Icon = (LucideIcons as any)[note.category.icon] || LucideIcons.Tag;
                    return <Icon className="w-4 h-4 xl-down:w-3.5 xl-down:h-3.5 lg-down:w-3.5 lg-down:h-3.5 md-down:w-4 md-down:h-4 sm-down:w-4 sm-down:h-4 xs-down:w-3.5 xs-down:h-3.5" style={{ color: note.category.color }} />;
                  })()}
                  {note.category.name}
                </div>
              ) : (
                <div className={`px-3 py-1.5 xl-down:px-2.5 xl-down:py-1 lg-down:px-2 lg-down:py-1 md-down:px-3 md-down:py-1.5 sm-down:px-3 sm-down:py-1.5 xs-down:px-2.5 xs-down:py-1 rounded-full xl-down:rounded-lg lg-down:rounded-lg md-down:rounded-full text-sm xl-down:text-xs lg-down:text-xs md-down:text-sm sm-down:text-sm xs-down:text-xs font-medium flex items-center gap-2 xl-down:gap-1.5 lg-down:gap-1.5 md-down:gap-2 sm-down:gap-2 xs-down:gap-1.5 ${getCategoryColor(typeof note.category === 'string' ? note.category : 'general')}`}>
                  <Tag className="w-4 h-4 xl-down:w-3.5 xl-down:h-3.5 lg-down:w-3.5 lg-down:h-3.5 md-down:w-4 md-down:h-4 sm-down:w-4 sm-down:h-4 xs-down:w-3.5 xs-down:h-3.5" />
                  {typeof note.category === 'string' ? (t(`filters.category.${note.category}`) || note.category) : t('filters.category.general')}
                </div>
              )}
              <div className={`px-3 py-1.5 xl-down:px-2.5 xl-down:py-1 lg-down:px-2 lg-down:py-1 md-down:px-3 md-down:py-1.5 sm-down:px-3 sm-down:py-1.5 xs-down:px-2.5 xs-down:py-1 rounded-full xl-down:rounded-lg lg-down:rounded-lg md-down:rounded-full text-sm xl-down:text-xs lg-down:text-xs md-down:text-sm sm-down:text-sm xs-down:text-xs font-medium flex items-center gap-2 xl-down:gap-1.5 lg-down:gap-1.5 md-down:gap-2 sm-down:gap-2 xs-down:gap-1.5 ${getPriorityColor(note.priority)}`}>
                <AlertCircle className="w-4 h-4 xl-down:w-3.5 xl-down:h-3.5 lg-down:w-3.5 lg-down:h-3.5 md-down:w-4 md-down:h-4 sm-down:w-4 sm-down:h-4 xs-down:w-3.5 xs-down:h-3.5" />
                {t(`filters.priority.${note.priority}`) || note.priority}
              </div>
            </div>

            {/* Video */}
            {note.videoUrl && (
              <div>
                <label className="block text-sm xl-down:text-xs lg-down:text-xs md-down:text-sm sm-down:text-sm xs-down:text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 xl-down:mb-1.5 lg-down:mb-1.5 md-down:mb-2 sm-down:mb-2 xs-down:mb-1.5">
                  {t('sharedNotes.modal.video') || 'Video'}
                </label>
                <div className="w-full rounded-lg xl-down:rounded-md lg-down:rounded md-down:rounded-sm overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  <video
                    controls
                    src={note.videoUrl}
                    preload="metadata"
                    className="w-full max-h-96 xl-down:max-h-80 lg-down:max-h-64 md-down:max-h-64 sm-down:max-h-56 xs-down:max-h-48 object-contain"
                  />
                </div>
              </div>
            )}

            {/* Image */}
            {note.imageUrl && !note.videoUrl && (
              <div>
                <label className="block text-sm xl-down:text-xs lg-down:text-xs md-down:text-sm sm-down:text-sm xs-down:text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 xl-down:mb-1.5 lg-down:mb-1.5 md-down:mb-2 sm-down:mb-2 xs-down:mb-1.5">
                  {t('sharedNotes.modal.image') || 'Hình ảnh'}
                </label>
                <div className="w-full h-64 xl-down:h-56 lg-down:h-48 md-down:h-56 sm-down:h-48 xs-down:h-40 rounded-lg xl-down:rounded-md lg-down:rounded md-down:rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
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
                <label className="block text-sm xl-down:text-xs lg-down:text-xs md-down:text-sm sm-down:text-sm xs-down:text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 xl-down:mb-1.5 lg-down:mb-1.5 md-down:mb-2 sm-down:mb-2 xs-down:mb-1.5">
                  {t('sharedNotes.modal.youtube') || 'YouTube'}
                </label>
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={getYouTubeEmbedUrl(note.youtubeUrl) || ''}
                    title={note.title}
                    className="absolute top-0 left-0 w-full h-full rounded-lg xl-down:rounded-md lg-down:rounded md-down:rounded-sm border border-gray-200 dark:border-gray-600"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            

            {/* Created Date */}
            <div className="text-xs xl-down:text-xs lg-down:text-xs md-down:text-sm sm-down:text-sm xs-down:text-xs text-gray-500 dark:text-gray-400">
              {t('notes.createdAt') || 'Tạo lúc'}: {new Date(note.createdAt).toLocaleString('vi-VN')}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 xl-down:gap-2.5 lg-down:gap-2 md-down:gap-3 sm-down:gap-3 xs-down:gap-2 p-6 xl-down:p-5 lg-down:p-4 md-down:p-4 sm-down:p-4 xs-down:p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 xl-down:px-5 xl-down:py-1.5 lg-down:px-4 lg-down:py-1.5 md-down:px-6 md-down:py-2 sm-down:px-6 sm-down:py-2 xs-down:px-5 xs-down:py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg xl-down:rounded-md lg-down:rounded-md md-down:rounded-lg font-medium text-base xl-down:text-sm lg-down:text-sm md-down:text-base sm-down:text-base xs-down:text-sm transition-colors"
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

