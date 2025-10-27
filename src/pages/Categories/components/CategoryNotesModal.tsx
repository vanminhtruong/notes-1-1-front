import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, FileText, Calendar, AlertCircle, Pin, Image, Video, Youtube, User, Clock } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { useCategoryNotesState } from '@/pages/Categories/hooks/Manager-useState/useCategoryNotesState';
import { useCategoryNotesHandler } from '@/pages/Categories/hooks/Manager-handle/useCategoryNotesHandler';
import { useCategoryNotesEffects } from '@/pages/Categories/hooks/Manager-Effects/useCategoryNotesEffects';
import type { NoteCategory } from '@/services/notesService';
import * as LucideIcons from 'lucide-react';

interface CategoryNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: NoteCategory;
}

const CategoryNotesModal = ({ isOpen, onClose, category }: CategoryNotesModalProps) => {
  const { t } = useTranslation('categories');
  const categoryId = isOpen ? category.id : null;
  const pageSize = 3;

  // State management
  const state = useCategoryNotesState();
  const { notes, isLoading, currentPage, totalPages, setCurrentPage } = state;

  // Handlers
  const handlers = useCategoryNotesHandler({
    categoryId,
    pageSize,
    currentPage,
    setNotes: state.setNotes,
    setIsLoading: state.setIsLoading,
    setError: state.setError,
    setTotalPages: state.setTotalPages,
  });

  // Effects
  useCategoryNotesEffects({
    categoryId,
    fetchNotes: handlers.fetchNotes,
    setCurrentPage: state.setCurrentPage,
  });

  const getCategoryIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || FileText;
    return Icon;
  };

  const CategoryIcon = getCategoryIcon(category.icon);

  useEffect(() => {
    if (!isOpen) {
      setCurrentPage(1);
    }
  }, [isOpen, setCurrentPage]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPriorityLabel = (priority: string) => {
    return t(`priority.${priority}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 xs-down:p-2">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-modalSlideIn lg-down:max-w-2xl md-down:max-w-xl sm-down:max-w-lg xs-down:max-w-full xs-down:rounded-xl">
        {/* Header */}
        <div
          className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between lg-down:px-5 lg-down:py-3.5 md-down:px-4 md-down:py-3 sm-down:px-3.5 sm-down:py-2.5"
          style={{ backgroundColor: `${category.color}15` }}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0 sm-down:gap-2">
            <CategoryIcon
              className="w-8 h-8 flex-shrink-0 lg-down:w-7 lg-down:h-7 md-down:w-6 md-down:h-6"
              style={{ color: category.color }}
              strokeWidth={1.5}
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate lg-down:text-lg md-down:text-base sm-down:text-sm">
                {category.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 lg-down:text-xs">
                {t('notesInCategory', { count: category.notesCount || 0 })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors flex-shrink-0 lg-down:p-1.5"
            aria-label={t('close')}
          >
            <X className="w-5 h-5 lg-down:w-4 lg-down:h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 lg-down:px-5 lg-down:py-3.5 md-down:px-4 md-down:py-3 sm-down:px-3.5 sm-down:py-2.5">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4 lg-down:w-14 lg-down:h-14 md-down:w-12 md-down:h-12" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 lg-down:text-base md-down:text-sm">
                {t('noNotesInCategory')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center text-sm lg-down:text-xs">
                {t('noNotesInCategoryDesc')}
              </p>
            </div>
          ) : (
            <div className="space-y-4 md-down:space-y-3 sm-down:space-y-2.5">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-700/50 rounded-xl p-5 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200 md-down:p-4 sm-down:p-3 xs-down:rounded-lg"
                >
                  {/* Header with Title and Badges */}
                  <div className="flex items-start justify-between gap-3 mb-3 sm-down:gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {note.isPinned && (
                          <Pin className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 md-down:w-3.5 md-down:h-3.5" />
                        )}
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 lg-down:text-base md-down:text-sm">
                          {note.title}
                        </h3>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full ${getPriorityColor(
                        note.priority
                      )} bg-opacity-10 flex-shrink-0 shadow-sm lg-down:text-xs md-down:px-2 md-down:py-1 sm-down:px-2 sm-down:py-1`}
                    >
                      {getPriorityLabel(note.priority)}
                    </span>
                  </div>

                  {/* Content */}
                  {note.content && (
                    <div className="mb-4 md-down:mb-3">
                      <div 
                        className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed lg-down:text-xs prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: note.content }}
                      />
                    </div>
                  )}

                  {/* Media Section */}
                  {(note.imageUrl || note.videoUrl || note.youtubeUrl) && (
                    <div className="mb-4 space-y-2 md-down:mb-3">
                      {note.imageUrl && (
                        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                          <Image className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" />
                          <span className="truncate lg-down:text-xs">
                            {t('hasImage')}
                          </span>
                        </div>
                      )}
                      {note.videoUrl && (
                        <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                          <Video className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" />
                          <span className="truncate lg-down:text-xs">
                            {t('hasVideo')}
                          </span>
                        </div>
                      )}
                      {note.youtubeUrl && (
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                          <Youtube className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" />
                          <span className="truncate lg-down:text-xs">
                            {t('hasYoutube')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reminder Alert */}
                  {note.reminderAt && !note.reminderAcknowledged && (
                    <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg md-down:mb-3 md-down:p-2">
                      <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 md-down:w-3.5 md-down:h-3.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium lg-down:text-xs">{t('hasReminder')}</p>
                          <p className="text-xs text-orange-600 dark:text-orange-500 mt-0.5">
                            {formatDate(note.reminderAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer with metadata */}
                  <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400 sm-down:gap-3 xs-down:gap-2">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 xs-down:w-3 xs-down:h-3" />
                      <span className="font-medium">{note.user.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 xs-down:w-3 xs-down:h-3" />
                      <span>{formatDate(note.createdAt)}</span>
                    </div>
                    {note.updatedAt !== note.createdAt && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 xs-down:w-3 xs-down:h-3" />
                        <span>{t('updated')}: {formatDate(note.updatedAt)}</span>
                      </div>
                    )}
                    {note.isArchived && (
                      <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs font-medium">
                        {t('archived')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Pagination */}
        {!isLoading && notes.length > 0 && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 lg-down:px-5 lg-down:py-3.5 md-down:px-4 md-down:py-3 sm-down:px-3.5 sm-down:py-2.5">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryNotesModal;
