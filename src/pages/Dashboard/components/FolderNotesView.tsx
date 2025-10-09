import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, FolderOutput } from 'lucide-react';
import { type NoteFolder, type Note } from '@/services/notesService';
import NoteCard from './NoteCard';
import toast from 'react-hot-toast';
import { getFolderIcon, getFolderColorClass } from '@/pages/Dashboard/utils/folderIcons';

interface FolderNotesViewProps {
  folder: NoteFolder | null;
  notes: Note[];
  isLoading: boolean;
  dueReminderNoteIds: number[];
  onBack: () => void;
  onView: (note: Note) => void;
  onEdit: (note: Note) => void;
  onArchive: (note: Note) => void;
  onDelete: (note: Note) => void;
  onAcknowledgeReminder: (noteId: number) => void;
  onCreateNote?: () => void;
  onRemoveFromFolder?: (noteId: number) => void;
  onMoveOutOfFolder?: (note: Note) => void;
  getPriorityColor: (priority: string) => string;
  getPriorityText: (priority: string) => string;
}


const FolderNotesView = ({
  folder,
  notes,
  isLoading,
  dueReminderNoteIds,
  onBack,
  onView,
  onEdit,
  onArchive,
  onDelete,
  onAcknowledgeReminder,
  onCreateNote,
  onRemoveFromFolder,
  onMoveOutOfFolder,
  getPriorityColor,
  getPriorityText,
}: FolderNotesViewProps) => {
  const { t } = useTranslation('dashboard');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelect = useCallback((noteId: number) => {
    setSelectedIds(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const handleRemoveSelected = useCallback(() => {
    if (!onRemoveFromFolder) return;
    
    toast.custom((toastData) => {
      const containerClass = `max-w-sm w-full rounded-xl shadow-lg border ${toastData.visible ? 'animate-enter' : 'animate-leave'} bg-white/90 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 p-4`;
      return (
        <div className={containerClass}>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="font-semibold">{t('folders.removeFromFolder')}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {t('messages.confirmBulkRemove', { count: selectedIds.length })}
              </p>
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => toast.dismiss(toastData.id)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
            >
              {t('actions.cancel')}
            </button>
            <button
              onClick={() => {
                selectedIds.forEach(id => onRemoveFromFolder(id));
                setSelectedIds([]);
                toast.dismiss(toastData.id);
              }}
              className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm"
            >
              {t('actions.remove')}
            </button>
          </div>
        </div>
      );
    }, { duration: 8000 });
  }, [selectedIds, onRemoveFromFolder, t]);

  if (!folder) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('actions.back') || 'Quay lại'}</span>
        </button>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl">
              {(() => {
                const IconComponent = getFolderIcon(folder.icon || 'folder');
                const colorClass = getFolderColorClass(folder.color);
                return <IconComponent className={`w-10 h-10 ${colorClass}`} strokeWidth={2} />;
              })()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{folder.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('folders.notesCount', { count: notes.length })}
              </p>
            </div>
          </div>
          
          {onCreateNote && (
            <button
              onClick={onCreateNote}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>{t('actions.createNote')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar - fixed like Active tab */}
      {selectedIds.length > 0 && onRemoveFromFolder && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-2xl
                        flex items-center justify-between bg-white/70 dark:bg-gray-800/90 
                        backdrop-blur-lg rounded-2xl p-4 border border-white/20 dark:border-gray-700/30 shadow-2xl
                        animate-in slide-in-from-bottom duration-300
                        lg-down:p-3.5 md-down:p-3 md-down:bottom-4 sm-down:flex-col sm-down:gap-3 sm-down:items-stretch xs-down:w-[calc(100%-1rem)] xs-down:bottom-3">
          <span className="text-sm text-gray-900 dark:text-white font-semibold md-down:text-xs sm-down:text-center">
            {t('messages.selectedNotes', { count: selectedIds.length })}
          </span>
          <div className="flex gap-2 sm-down:gap-2 sm-down:w-full">
            <button
              onClick={clearSelection}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-all hover:scale-105 active:scale-95 md-down:px-3 md-down:py-1.5 md-down:text-xs sm-down:flex-1"
            >
              {t('actions.cancel')}
            </button>
            <button
              onClick={handleRemoveSelected}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg md-down:px-3 md-down:py-1.5 md-down:text-xs md-down:gap-1.5 sm-down:flex-1"
            >
              <FolderOutput className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" />
              {t('folders.removeFromFolder')}
            </button>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {t('messages.noNotes')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl-down:gap-5 lg-down:gap-4 md-down:gap-3 sm-down:gap-2.5 xs-down:gap-2">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isSelected={selectedIds.includes(note.id)}
              showArchived={false}
              showReminder={dueReminderNoteIds.includes(note.id)}
              onToggleSelect={() => toggleSelect(note.id)}
              onView={() => onView(note)}
              onEdit={() => onEdit(note)}
              onArchive={() => onArchive(note)}
              onDelete={() => onDelete(note)}
              onMoveOutOfFolder={onMoveOutOfFolder ? () => onMoveOutOfFolder(note) : undefined}
              onAcknowledgeReminder={() => onAcknowledgeReminder(note.id)}
              getPriorityColor={getPriorityColor}
              getPriorityText={getPriorityText}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FolderNotesView;
