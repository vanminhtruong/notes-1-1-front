import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDateMDYY } from '@/utils/utils';
import { type Note } from './NoteCard';

interface ViewNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  onOpenShare: () => void;
  getPriorityColor: (priority: string) => string;
  getPriorityText: (priority: string) => string;
}

const ViewNoteModal = ({ isOpen, onClose, note, onOpenShare, getPriorityColor, getPriorityText }: ViewNoteModalProps) => {
  const { t } = useTranslation('dashboard');

  if (!isOpen || !note) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[85vh] flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('modals.view.title')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label={t('actions.close')}>✕</button>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{note.title}</h3>
            <div className="mt-2 text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{note.content || t('messages.noContent')}</div>
          </div>

          {note.imageUrl && (
            <img src={note.imageUrl} alt={note.title} className="w-full max-h-80 object-contain rounded-xl border" />
          )}

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className={`px-2 py-1 rounded-lg border ${getPriorityColor(note.priority)}`}>{getPriorityText(note.priority)}</span>
            <span className="px-2 py-1 rounded-lg border bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600">{t(`category.${note.category}`)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            {formatDateMDYY(note.createdAt)}
          </div>

          <div className="mt-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t('notes.share.title') || 'Chia sẻ ghi chú'}</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('notes.share.description') || 'Chia sẻ ghi chú này với người dùng khác và thiết lập quyền hạn phù hợp.'}
            </p>
            <button 
              onClick={onOpenShare}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              {t('actions.share') || 'Chia sẻ'}
            </button>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {t('actions.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewNoteModal;
