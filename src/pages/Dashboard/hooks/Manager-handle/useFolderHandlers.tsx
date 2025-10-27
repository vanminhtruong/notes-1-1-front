import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { NoteFolder } from '@/services/notesService';

interface UseFolderHandlersProps {
  deleteFolder: (folderId: number) => Promise<void>;
  fetchFolderNotes: (folderId: number, page?: number) => Promise<void>;
  setSelectedFolder: (folder: NoteFolder | null) => void;
  confirmArchiveNote: (id: number) => void;
  confirmDeleteNote: (id: number) => void;
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

  const handleDeleteFolder = useCallback(async (folder: NoteFolder) => {
    if (window.confirm(t('modals.confirm.deleteFolderMessage', { name: folder.name }))) {
      await deleteFolder(folder.id);
    }
  }, [deleteFolder, t]);

  const handleViewFolder = useCallback((folder: NoteFolder) => {
    setSelectedFolder(folder);
    fetchFolderNotes(folder.id);
  }, [setSelectedFolder, fetchFolderNotes]);

  const handleBackFromFolder = useCallback(() => {
    setSelectedFolder(null);
  }, [setSelectedFolder]);

  const handleArchiveNoteInFolder = useCallback((id: number) => {
    confirmArchiveNote(id);
    // Refresh folder notes after archive
    setTimeout(() => {
      if (selectedFolder) {
        fetchFolderNotes(selectedFolder.id, currentPage);
      }
    }, 500);
  }, [confirmArchiveNote, selectedFolder, fetchFolderNotes, currentPage]);

  const handleDeleteNoteInFolder = useCallback((id: number) => {
    confirmDeleteNote(id);
    // Refresh folder notes after delete
    setTimeout(() => {
      if (selectedFolder) {
        fetchFolderNotes(selectedFolder.id, currentPage);
      }
    }, 500);
  }, [confirmDeleteNote, selectedFolder, fetchFolderNotes, currentPage]);

  const handleRemoveFromFolder = useCallback(async (noteId: number) => {
    if (window.confirm(t('modals.confirm.removeFromFolderMessage'))) {
      try {
        await moveNoteToFolder(noteId, null);
        if (selectedFolder) {
          fetchFolderNotes(selectedFolder.id, currentPage);
        }
      } catch (error) {
        // Error already handled in moveNoteToFolder
      }
    }
  }, [moveNoteToFolder, selectedFolder, fetchFolderNotes, currentPage, t]);

  return {
    handleDeleteFolder,
    handleViewFolder,
    handleBackFromFolder,
    handleArchiveNoteInFolder,
    handleDeleteNoteInFolder,
    handleRemoveFromFolder,
  };
};
