import React, { useState, useEffect } from 'react';
import { Tag, ArrowLeft, Search, X, Trash2, Pin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/store';
import { useNoteTagsHandler } from '../hooks/Manager-handle/useNoteTagsHandler';
import { useNoteTagsEffects } from '../hooks/Manager-Effects/useNoteTagsEffects';
import { useTagsViewState } from '../hooks/Manager-useState/useTagsViewState';
import { useTagsViewHandler } from '../hooks/Manager-handle/useTagsViewHandler';
import { useTagsViewEffects } from '../hooks/Manager-Effects/useTagsViewEffects';
import NotesGrid from './NotesGrid';
import TagBadge from './TagBadge';

interface TagsViewProps {
  onView: (note: any) => void;
  onEdit: (note: any) => void;
  onArchive: (id: number) => void;
  onDelete: (id: number) => void;
  toggleSelect: (id: number) => void;
  selectedIds: number[];
  onPinUpdate?: (note: any) => void;
  acknowledgeReminderNote: (id: number) => void;
  getPriorityColor: (priority: string) => string;
  getPriorityText: (priority: string) => string;
}

const TagsView = ({
  onView,
  onEdit,
  onArchive,
  onDelete,
  toggleSelect,
  selectedIds,
  onPinUpdate,
  acknowledgeReminderNote,
  getPriorityColor,
  getPriorityText,
}: TagsViewProps) => {
  const { t } = useTranslation('dashboard');
  const { tags, loadTags, deleteTag, togglePinTag } = useNoteTagsHandler();
  useNoteTagsEffects();
  const dueReminderNoteIds = useAppSelector((state) => state.notes.dueReminderNoteIds);

  // State management
  const {
    selectedTag,
    setSelectedTag,
    allNotes,
    setAllNotes,
    isLoading,
    setIsLoading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    pagination,
    setPagination,
  } = useTagsViewState();

  // Handlers and computed values
  const { fetchNotesByTag, filteredNotes, handleSelectTag } = useTagsViewHandler({
    setIsLoading,
    setAllNotes,
    setPagination,
    setSelectedTag,
    setCurrentPage,
    setSearchTerm,
    allNotes,
    searchTerm,
  });

  // Effects
  useTagsViewEffects({
    selectedTag,
    currentPage,
    fetchNotesByTag,
  });

  const notes = filteredNotes;

  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [hoveredTagId, setHoveredTagId] = useState<number | null>(null);
  const [pinningTagId, setPinningTagId] = useState<number | null>(null);

  // Handler ghim tag
  const handleTogglePinTag = async (e: React.MouseEvent, tag: any) => {
    e.stopPropagation();
    setPinningTagId(tag.id);
    try {
      await togglePinTag(tag.id);
      // Không cần loadTags() vì WebSocket sẽ tự động cập nhật real-time
    } catch (error: any) {
      console.error('Error toggling pin tag:', error);
      toast.error(error.response?.data?.message || t('tags.pinError'));
    } finally {
      setPinningTagId(null);
    }
  };

  // Handler xóa tag
  const handleDeleteTag = async (e: React.MouseEvent, tag: any) => {
    e.stopPropagation(); // Ngăn không cho trigger handleSelectTag
    
    toast.custom((toastData) => {
      const containerClass = `max-w-sm w-full rounded-xl shadow-lg border ${
        toastData.visible ? 'animate-enter' : 'animate-leave'
      } bg-white/90 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 p-4`;
      
      return React.createElement(
        'div',
        { className: containerClass },
        React.createElement(
          'div',
          { className: 'flex items-start gap-3' },
          React.createElement(
            'div',
            { className: 'flex-1' },
            React.createElement('p', { className: 'font-semibold' }, t('tags.confirmDelete')),
            React.createElement('p', { className: 'text-sm text-gray-600 dark:text-gray-300 mt-1' }, tag.name),
            React.createElement('p', { className: 'text-xs text-gray-500 dark:text-gray-400 mt-1' }, t('tags.confirmDeleteDesc'))
          )
        ),
        React.createElement(
          'div',
          { className: 'mt-3 flex justify-end gap-2' },
          React.createElement(
            'button',
            {
              onClick: () => toast.dismiss(toastData.id),
              className: 'px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm',
            },
            t('tags.cancel')
          ),
          React.createElement(
            'button',
            {
              onClick: async () => {
                try {
                  await deleteTag(tag.id);
                  toast.dismiss(toastData.id);
                  toast.success(t('tags.deleteSuccess'));
                  loadTags();
                } catch (error: any) {
                  console.error('Error deleting tag:', error);
                  toast.dismiss(toastData.id);
                  toast.error(error.response?.data?.message || t('tags.deleteError'));
                }
              },
              className: 'px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm',
            },
            t('tags.delete')
          )
        )
      );
    }, { duration: 8000 });
  };

  // Load tags only if not already loaded (fallback)
  useEffect(() => {
    if (tags.length === 0) {
      loadTags();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );

  // Tag selection view
  if (!selectedTag) {
    return (
      <div className="space-y-4 xl-down:space-y-3 md-down:space-y-2.5 sm-down:space-y-2">
        {/* Search tags */}
        <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 xl-down:p-5 lg-down:p-4 md-down:p-3.5 sm-down:p-3 xs-down:p-2.5">
          <div className="flex items-center gap-3 mb-4 xl-down:gap-2.5 xl-down:mb-3.5 md-down:gap-2 md-down:mb-3 sm-down:mb-2.5 xs-down:gap-1.5">
            <Tag className="w-6 h-6 text-blue-600 dark:text-blue-400 xl-down:w-5.5 xl-down:h-5.5 md-down:w-5 md-down:h-5 sm-down:w-4.5 sm-down:h-4.5 xs-down:w-4 xs-down:h-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white xl-down:text-lg md-down:text-base sm-down:text-sm xs-down:text-xs">
              {t('tags.searchByTags')}
            </h2>
          </div>
          
          <div className="relative mb-4 xl-down:mb-3.5 md-down:mb-3 sm-down:mb-2.5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 xl-down:w-4.5 xl-down:h-4.5 md-down:w-4 md-down:h-4 sm-down:w-3.5 sm-down:h-3.5 md-down:left-2.5 sm-down:left-2" />
            <input
              type="text"
              value={tagSearchQuery}
              onChange={(e) => setTagSearchQuery(e.target.value)}
              placeholder={t('tags.searchTags')}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white xl-down:py-2.5 xl-down:pl-9 xl-down:pr-9 md-down:py-2 md-down:pl-8 md-down:pr-8 md-down:text-sm sm-down:py-1.5 sm-down:pl-7 sm-down:pr-7 sm-down:text-xs xs-down:rounded-lg"
            />
            {tagSearchQuery && (
              <button
                onClick={() => setTagSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5 xl-down:w-4.5 xl-down:h-4.5 md-down:w-4 md-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
              </button>
            )}
          </div>

          {/* Tags grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 xl-down:gap-2.5 md-down:gap-2 sm-down:grid-cols-2 xs-down:grid-cols-1">
            {filteredTags.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                {tagSearchQuery ? t('tags.noTagsFound') : t('tags.noTags')}
              </div>
            ) : (
              filteredTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleSelectTag(tag)}
                  onMouseEnter={() => setHoveredTagId(tag.id)}
                  onMouseLeave={() => setHoveredTagId(null)}
                  className="flex items-center justify-between gap-2 p-3 rounded-xl border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400 transition-all hover:shadow-md bg-gray-50 dark:bg-gray-700/50 xl-down:p-2.5 md-down:p-2 sm-down:p-1.5 xs-down:rounded-lg"
                  style={{ borderLeftColor: tag.color, borderLeftWidth: '4px' }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {tag.isPinned && (
                      <Pin className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0 xl-down:w-2.5 xl-down:h-2.5 sm-down:w-2 sm-down:h-2" fill="currentColor" />
                    )}
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 xl-down:w-2.5 xl-down:h-2.5 sm-down:w-2 sm-down:h-2"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="font-medium text-gray-900 dark:text-white truncate md-down:text-sm sm-down:text-xs">
                      {tag.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {hoveredTagId === tag.id ? (
                      <>
                        <button
                          onClick={(e) => handleTogglePinTag(e, tag)}
                          disabled={pinningTagId === tag.id}
                          className={`p-1.5 rounded-lg transition-all duration-200 ${
                            tag.isPinned
                              ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                              : 'text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
                          }`}
                          title={tag.isPinned ? t('tags.unpin') : t('tags.pin')}
                        >
                          <Pin className="w-3 h-3 sm-down:w-2.5 sm-down:h-2.5" fill={tag.isPinned ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteTag(e, tag)}
                          className="p-1.5 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200"
                          title={t('tags.deleteTag')}
                        >
                          <Trash2 className="w-3 h-3 sm-down:w-2.5 sm-down:h-2.5" />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs bg-gray-200 dark:bg-gray-600 rounded-full px-2 py-1 text-gray-500 dark:text-gray-400 sm-down:text-2xs">
                        {tag.notesCount || 0}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Notes by tag view
  return (
    <div className="space-y-4 xl-down:space-y-3 md-down:space-y-2.5 sm-down:space-y-2">
      {/* Header with back button */}
      <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-4 border border-white/20 dark:border-gray-700/30 xl-down:p-3.5 md-down:p-3 sm-down:p-2.5 xs-down:p-2">
        <div className="flex items-center justify-between flex-wrap gap-3 xl-down:gap-2.5 md-down:gap-2 sm-down:gap-1.5">
          <div className="flex items-center gap-3 xl-down:gap-2.5 md-down:gap-2 sm-down:gap-1.5">
            <button
              onClick={() => handleSelectTag(null)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors xl-down:p-1.5 sm-down:p-1"
              title={t('tags.backToTags')}
            >
              <ArrowLeft className="w-5 h-5 xl-down:w-4.5 xl-down:h-4.5 md-down:w-4 md-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
            </button>
            <TagBadge tag={selectedTag} size="md" />
            <span className="text-sm text-gray-500 dark:text-gray-400 sm-down:text-xs xs-down:text-2xs">
              {t('tags.notesCount', { count: pagination.total })}
            </span>
          </div>

          {/* Search notes */}
          <div className="relative flex-1 max-w-md xl-down:max-w-sm md-down:max-w-xs sm-down:max-w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 md-down:w-3.5 md-down:h-3.5 sm-down:w-3 sm-down:h-3 md-down:left-2.5 sm-down:left-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('tags.searchNotes')}
              className="w-full pl-9 pr-9 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm xl-down:py-1.5 md-down:pl-8 md-down:pr-8 md-down:text-xs sm-down:pl-7 sm-down:pr-7 sm-down:py-1 xs-down:rounded-md"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4 md-down:w-3.5 md-down:h-3.5 sm-down:w-3 sm-down:h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notes grid */}
      {isLoading ? (
        <div className="text-center py-12 xl-down:py-10 md-down:py-8 sm-down:py-6">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent xl-down:h-7 xl-down:w-7 md-down:h-6 md-down:w-6"></div>
          <p className="mt-3 text-gray-600 dark:text-gray-400 md-down:text-sm sm-down:text-xs">{t('sharedNotes.loading')}</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12 bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 xl-down:py-10 xl-down:p-5 md-down:py-8 md-down:p-4 sm-down:py-6 sm-down:p-3">
          <Tag className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4 xl-down:w-14 xl-down:h-14 md-down:w-12 md-down:h-12 sm-down:w-10 sm-down:h-10" />
          <p className="text-gray-500 dark:text-gray-400 md-down:text-sm sm-down:text-xs">
            {searchTerm ? t('tags.noNotesFound') : t('tags.noNotesWithTag')}
          </p>
        </div>
      ) : (
        <NotesGrid
          notes={notes}
          isLoading={isLoading}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onView={onView}
          onEdit={onEdit}
          onArchive={onArchive}
          onDelete={onDelete}
          onPinUpdate={onPinUpdate}
          onCreateNote={() => {}} // Empty function - no create in tags view
          showArchived={false}
          dueReminderNoteIds={dueReminderNoteIds}
          onAcknowledgeReminder={acknowledgeReminderNote}
          getPriorityColor={getPriorityColor}
          getPriorityText={getPriorityText}
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default TagsView;
