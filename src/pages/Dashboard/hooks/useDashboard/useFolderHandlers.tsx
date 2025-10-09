import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import type { NoteFolder } from '@/services/notesService';

interface UseFolderHandlersProps {
  deleteFolder: (folderId: number) => Promise<void>;
  fetchFolderNotes: (folderId: number, page?: number) => void;
  setSelectedFolder: (folder: NoteFolder | null) => void;
  confirmArchiveNote: (noteId: number) => void;
  confirmDeleteNote: (noteId: number) => void;
  moveNoteToFolder: (noteId: number, folderId: number | null) => Promise<void>;
  selectedFolder: NoteFolder | null;
  currentPage: number;
}

export const useFolderHandlers = ({
  deleteFolder,
  fetchFolderNotes,
  setSelectedFolder,
  confirmArchiveNote,
  confirmDeleteNote,
  moveNoteToFolder,
  selectedFolder,
  currentPage,
}: UseFolderHandlersProps) => {
  const { t } = useTranslation('dashboard');

  const handleDeleteFolder = useCallback((folder: NoteFolder) => {
    toast.custom((toastData) => {
      const containerClass = `max-w-sm w-full rounded-xl shadow-lg border ${toastData.visible ? 'animate-enter' : 'animate-leave'} bg-white/90 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 p-4`;
      return (
        <div className={containerClass}>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="font-semibold">{t('folders.confirmDelete')}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {t('folders.confirmDeleteDesc')}
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
              onClick={async () => {
                await deleteFolder(folder.id);
                toast.dismiss(toastData.id);
              }}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
            >
              {t('actions.delete')}
            </button>
          </div>
        </div>
      );
    }, { duration: 8000 });
  }, [deleteFolder, t]);

  const handleViewFolder = useCallback((folder: NoteFolder) => {
    fetchFolderNotes(folder.id);
  }, [fetchFolderNotes]);

  const handleBackFromFolder = useCallback(() => {
    setSelectedFolder(null);
  }, [setSelectedFolder]);

  const handleArchiveNoteInFolder = useCallback((note: any) => {
    confirmArchiveNote(note.id);
  }, [confirmArchiveNote]);

  const handleDeleteNoteInFolder = useCallback((note: any) => {
    confirmDeleteNote(note.id);
  }, [confirmDeleteNote]);

  const handleRemoveFromFolder = useCallback(async (noteId: number) => {
    await moveNoteToFolder(noteId, null);
    if (selectedFolder) {
      fetchFolderNotes(selectedFolder.id, currentPage);
    }
  }, [moveNoteToFolder, selectedFolder, fetchFolderNotes, currentPage]);

  return {
    handleDeleteFolder,
    handleViewFolder,
    handleBackFromFolder,
    handleArchiveNoteInFolder,
    handleDeleteNoteInFolder,
    handleRemoveFromFolder,
  };
};
