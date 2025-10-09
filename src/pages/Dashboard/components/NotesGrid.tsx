import { memo } from 'react';
import { StickyNote, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import NoteCard, { type Note } from './NoteCard';
import type { Note as ServiceNote } from '@/services/notesService';
import Pagination from '@/components/Pagination';
import LazyLoad from '@/components/LazyLoad';

interface NotesGridProps {
  notes: Note[];
  isLoading: boolean;
  showArchived: boolean;
  selectedIds: number[];
  dueReminderNoteIds: number[];
  onToggleSelect: (id: number) => void;
  onView: (note: Note) => void;
  onEdit: (note: Note) => void;
  onArchive: (id: number) => void;
  onDelete: (id: number) => void;
  onMoveToFolder?: (note: Note) => void;
  onPinUpdate?: (note: ServiceNote) => void;
  onAcknowledgeReminder: (id: number) => void;
  onCreateNote: () => void;
  getPriorityColor: (priority: string) => string;
  getPriorityText: (priority: string) => string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const NotesGrid = memo(({
  notes,
  isLoading,
  showArchived,
  selectedIds,
  dueReminderNoteIds,
  onToggleSelect,
  onView,
  onEdit,
  onArchive,
  onDelete,
  onMoveToFolder,
  onPinUpdate,
  onAcknowledgeReminder,
  onCreateNote,
  getPriorityColor,
  getPriorityText,
  currentPage,
  totalPages,
  onPageChange
}: NotesGridProps) => {
  const { t } = useTranslation('dashboard');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 lg-down:py-10 md-down:py-8 sm-down:py-6">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin md-down:w-6 md-down:h-6 md-down:border-2"></div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-12 lg-down:py-10 md-down:py-8 sm-down:py-6 xs-down:py-5">
        <StickyNote className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 lg-down:w-14 lg-down:h-14 md-down:w-12 md-down:h-12 sm-down:w-10 sm-down:h-10 sm-down:mb-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 lg-down:text-base md-down:text-sm sm-down:mb-1.5">
          {showArchived ? t('messages.noArchived') : t('messages.noNotes')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4 md-down:text-sm sm-down:text-sm sm-down:mb-3">
          {showArchived ? t('messages.switchToActive') : t('messages.createFirst')}
        </p>
        {!showArchived && (
          <button
            onClick={onCreateNote}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 lg-down:px-3.5 lg-down:py-1.5 md-down:px-3 md-down:text-sm sm-down:gap-1.5 xs-down:text-xs xs-down:px-2.5"
          >
            <Plus className="w-4 h-4 md-down:w-3.5 md-down:h-3.5 xs-down:w-3 xs-down:h-3" />
            {t('actions.createNote')}
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl-down:gap-5 lg-down:gap-4 md-down:gap-3 sm-down:gap-2.5 xs-down:gap-2">
        {notes.map((note, index) => (
          <LazyLoad
            key={note.id}
            threshold={0.1}
            rootMargin="100px"
            animationDuration={500}
            delay={index * 80}
            reAnimate={true}
          >
            <NoteCard
              note={note}
              isSelected={selectedIds.includes(note.id)}
              onToggleSelect={() => onToggleSelect(note.id)}
              onView={() => onView(note)}
              onEdit={() => onEdit(note)}
              onArchive={() => onArchive(note.id)}
              onDelete={() => onDelete(note.id)}
              onMoveToFolder={onMoveToFolder ? () => onMoveToFolder(note) : undefined}
              onPinUpdate={onPinUpdate}
              showArchived={showArchived}
              showReminder={dueReminderNoteIds.includes(note.id)}
              onAcknowledgeReminder={() => onAcknowledgeReminder(note.id)}
              getPriorityColor={getPriorityColor}
              getPriorityText={getPriorityText}
            />
          </LazyLoad>
        ))}
      </div>

      {/* Pagination Component */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </>
  );
});

NotesGrid.displayName = 'NotesGrid';

export default NotesGrid;
