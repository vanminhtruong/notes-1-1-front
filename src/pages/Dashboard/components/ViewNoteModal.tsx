import { memo } from 'react';
import { Clock, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDateMDYY } from '@/utils/utils';
import { type Note } from './NoteCard';
import { getYouTubeEmbedUrl } from '@/utils/youtube';

interface ViewNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  onOpenShare: () => void;
  getPriorityColor: (priority: string) => string;
  getPriorityText: (priority: string) => string;
}

const ViewNoteModal = memo(({ isOpen, onClose, note, onOpenShare, getPriorityColor, getPriorityText }: ViewNoteModalProps) => {
  const { t } = useTranslation('dashboard');

  if (!isOpen || !note) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 xl-down:p-3.5 lg-down:p-3 md-down:p-2.5 sm-down:p-2 xs-down:p-1.5 z-[99999]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl xl-down:rounded-xl lg-down:rounded-xl md-down:rounded-lg sm-down:rounded-lg shadow-xl max-w-2xl md-down:max-w-md sm-down:max-w-sm w-full p-6 xl-down:p-5 lg-down:p-5 md-down:p-4 sm-down:p-3.5 xs-down:p-3 max-h-[85vh] flex flex-col">
        <div className="flex items-start justify-between mb-4 xl-down:mb-3.5 md-down:mb-3 sm-down:mb-2.5">
          <h2 className="text-xl xl-down:text-lg md-down:text-base sm-down:text-base xs-down:text-sm font-bold text-gray-900 dark:text-white">{t('modals.view.title')}</h2>
          <button 
            onClick={onClose} 
            className="p-1 md-down:p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" 
            title="Đóng"
          >
            <X className="w-5 h-5 md-down:w-4 md-down:h-4 xs-down:w-3.5 xs-down:h-3.5" />
          </button>
        </div>

        <div className="space-y-4 xl-down:space-y-3.5 lg-down:space-y-3 md-down:space-y-3 sm-down:space-y-2.5 flex-1 overflow-y-auto pr-1">
          <div>
            <h3 className="text-lg xl-down:text-base md-down:text-base sm-down:text-sm font-semibold text-gray-900 dark:text-white">{note.title}</h3>
            <div className="mt-2 md-down:mt-1.5 sm-down:mt-1 text-gray-700 dark:text-gray-200 whitespace-pre-wrap text-sm md-down:text-sm sm-down:text-xs">{note.content || t('messages.noContent')}</div>
          </div>

          {note.imageUrl && (
            <img src={note.imageUrl} alt={note.title} className="w-full max-h-80 xl-down:max-h-72 lg-down:max-h-72 md-down:max-h-64 sm-down:max-h-56 object-contain rounded-xl border" />
          )}
          
          {note.videoUrl && (
            <video
              controls
              preload="metadata"
              className="w-full max-h-80 xl-down:max-h-72 lg-down:max-h-72 md-down:max-h-64 sm-down:max-h-56 rounded-xl border"
              src={note.videoUrl}
            >
              {t('messages.videoNotSupported') || 'Trình duyệt của bạn không hỗ trợ video.'}
            </video>
          )}
          
          {note.youtubeUrl && getYouTubeEmbedUrl(note.youtubeUrl) && (
            <div className="relative w-full">
              <div className="pb-[56.25%]" />
              <iframe
                src={getYouTubeEmbedUrl(note.youtubeUrl) || ''}
                title={note.title}
                className="absolute top-0 left-0 w-full h-full rounded-xl border"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 text-sm xs-down:text-xs">
            <span className={`px-2 py-1 rounded-lg border ${getPriorityColor(note.priority)}`}>{getPriorityText(note.priority)}</span>
            <span className="px-2 py-1 rounded-lg border bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600">{t(`category.${note.category}`)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3 xs-down:w-2.5 xs-down:h-2.5" />
            {formatDateMDYY(note.createdAt)}
          </div>

          <div className="mt-4 p-4 xl-down:p-3.5 md-down:p-3 sm-down:p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
            <div className="flex items-center justify-between mb-3 md-down:mb-2.5 sm-down:mb-2">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm md-down:text-sm sm-down:text-xs">{t('notes.share.title') || 'Chia sẻ ghi chú'}</h4>
            </div>
            <p className="text-sm md-down:text-sm sm-down:text-xs text-gray-600 dark:text-gray-400 mb-4 md-down:mb-3 sm-down:mb-2.5">
              {t('notes.share.description') || 'Chia sẻ ghi chú này với người dùng khác và thiết lập quyền hạn phù hợp.'}
            </p>
            <button 
              onClick={onOpenShare}
              className="w-full px-4 py-3 md-down:px-3.5 md-down:py-2.5 sm-down:px-3 sm-down:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm md-down:text-sm sm-down:text-xs"
            >
              <svg className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              {t('actions.share') || 'Chia sẻ'}
            </button>
          </div>

          <div className="flex justify-end gap-3 md-down:gap-2.5 sm-down:gap-2 mt-6 md-down:mt-5 sm-down:mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 md-down:px-3 md-down:py-1.5 sm-down:px-2.5 sm-down:py-1.5 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-sm md-down:text-sm sm-down:text-xs"
            >
              {t('actions.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ViewNoteModal.displayName = 'ViewNoteModal';

export default ViewNoteModal;
