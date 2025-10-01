import { Archive, ArchiveRestore, Trash2, Pencil, Bell, Eye, Clock, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDateMDYY } from '@/utils/utils';

export interface Note {
  id: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: string;
}

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onToggleSelect: () => void;
  onView: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
  showArchived: boolean;
  showReminder: boolean;
  onAcknowledgeReminder: () => void;
  getPriorityColor: (priority: string) => string;
  getPriorityText: (priority: string) => string;
}

const NoteCard = ({
  note,
  isSelected,
  onToggleSelect,
  onView,
  onEdit,
  onArchive,
  onDelete,
  showArchived,
  showReminder,
  onAcknowledgeReminder,
  getPriorityColor,
  getPriorityText
}: NoteCardProps) => {
  const { t } = useTranslation('dashboard');

  return (
    <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] lg-down:p-5 md-down:p-4 sm-down:p-3.5 xs-down:p-3">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-2 sm-down:gap-1.5">
          {!showArchived && (
            <label className="mt-1 inline-flex items-center cursor-pointer select-none group" title={t('actions.selectNote')}>
              <input
                type="checkbox"
                aria-label={t('actions.selectNote')}
                checked={isSelected}
                onChange={onToggleSelect}
                className="peer sr-only"
              />
              <span
                className="w-6 h-6 inline-flex items-center justify-center rounded-md border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 transition-all
                           peer-focus:ring-2 peer-focus:ring-blue-500/50
                           hover:border-gray-400 dark:hover:border-gray-500 group-active:scale-95
                           peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:dark:bg-blue-600 peer-checked:dark:border-blue-600 
                           peer-checked:[&>svg]:w-4 peer-checked:[&>svg]:h-4 peer-checked:[&>svg]:opacity-100
                           sm-down:w-5 sm-down:h-5 xs-down:w-4 xs-down:h-4 
                           sm-down:peer-checked:[&>svg]:w-3.5 sm-down:peer-checked:[&>svg]:h-3.5 
                           xs-down:peer-checked:[&>svg]:w-3 xs-down:peer-checked:[&>svg]:h-3"
              >
                <Check strokeWidth={3} className="w-0 h-0 opacity-0 transition-all duration-150 text-white" />
              </span>
            </label>
          )}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 lg-down:text-base md-down:text-sm sm-down:text-sm">
            {note.title}
          </h3>
        </div>
        <div className="flex gap-2">
          {showReminder && (
            <button
              onClick={onAcknowledgeReminder}
              className="p-1 text-amber-500 sm-down:p-0.5"
              title={t('actions.reminderDue')}
            >
              <Bell className="w-4 h-4 bell-strong md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3" />
            </button>
          )}
          <button
            onClick={onView}
            className="p-1 text-gray-400 hover:text-indigo-600 transition-colors duration-200 sm-down:p-0.5"
            title={t('actions.viewDetails')}
          >
            <Eye className="w-4 h-4 md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3" />
          </button>
          {showArchived ? (
            <button
              onClick={onArchive}
              title={t('actions.restore')}
              className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200 sm-down:p-0.5"
            >
              <ArchiveRestore className="w-4 h-4 md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3" />
            </button>
          ) : (
            <button
              onClick={onArchive}
              title={t('actions.archive')}
              className="p-1 text-gray-400 hover:text-orange-600 transition-colors duration-200 sm-down:p-0.5"
            >
              <Archive className="w-4 h-4 md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3" />
            </button>
          )}
          <button
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200 sm-down:p-0.5"
            title={t('actions.edit')}
          >
            <Pencil className="w-4 h-4 md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200 sm-down:p-0.5"
          >
            <Trash2 className="w-4 h-4 md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3" />
          </button>
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 md-down:text-xs sm-down:mb-3 xs-down:mb-2.5">
        {note.content || t('messages.noContent')}
      </p>

      {note.imageUrl && (
        <div className="mb-4 sm-down:mb-3 xs-down:mb-2.5">
          <img src={note.imageUrl} alt={note.title} className="w-full h-40 object-cover rounded-xl border lg-down:h-36 md-down:h-32 sm-down:h-28 xs-down:h-24" />
        </div>
      )}

      <div className="flex items-center justify-between sm-down:flex-col sm-down:gap-2 sm-down:items-start">
        <div className="flex gap-2 sm-down:gap-1.5 xs-down:gap-1">
          <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${getPriorityColor(note.priority)} xs-down:px-1.5 xs-down:py-0.5 xs-down:text-[10px]`}>
            {getPriorityText(note.priority)}
          </span>
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600 xs-down:px-1.5 xs-down:py-0.5 xs-down:text-[10px]">
            {t(`category.${note.category}`)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 xs-down:text-[10px]">
          <Clock className="w-3 h-3 xs-down:w-2.5 xs-down:h-2.5" />
          {formatDateMDYY(note.createdAt)}
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
