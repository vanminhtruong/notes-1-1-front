import { useCallback } from 'react';
import type { NoteFolder } from '@/services/notesService';

interface UseMoveOutOfFolderHandlerProps {
  noteToMoveOut: any | null;
  moveNoteToFolder: (noteId: number, folderId: number | null) => Promise<void>;
  confirmArchiveNote: (id: number) => void;
  handleCloseMoveOutOfFolder: () => void;
  selectedFolder: NoteFolder | null;
  fetchFolderNotes: (folderId: number, page?: number) => Promise<void>;
  currentPage: number;
}

export const useMoveOutOfFolderHandler = ({
  noteToMoveOut,
  moveNoteToFolder,
  confirmArchiveNote,
  handleCloseMoveOutOfFolder,
  selectedFolder,
  fetchFolderNotes,
  currentPage,
}: UseMoveOutOfFolderHandlerProps) => {
  const handleMoveToActive = useCallback(async () => {
    if (!noteToMoveOut) return;
    
    try {
      await moveNoteToFolder(noteToMoveOut.id, null);
      handleCloseMoveOutOfFolder();
      if (selectedFolder) {
        fetchFolderNotes(selectedFolder.id, currentPage);
      }
    } catch (error) {
      // Error already handled in moveNoteToFolder
    }
  }, [noteToMoveOut, moveNoteToFolder, handleCloseMoveOutOfFolder, selectedFolder, fetchFolderNotes, currentPage]);

  const handleMoveToArchived = useCallback(async () => {
    if (!noteToMoveOut) return;
    
    try {
      await moveNoteToFolder(noteToMoveOut.id, null);
      confirmArchiveNote(noteToMoveOut.id);
      handleCloseMoveOutOfFolder();
      setTimeout(() => {
        if (selectedFolder) {
          fetchFolderNotes(selectedFolder.id, currentPage);
        }
      }, 500);
    } catch (error) {
      // Error already handled in moveNoteToFolder
    }
  }, [noteToMoveOut, moveNoteToFolder, confirmArchiveNote, handleCloseMoveOutOfFolder, selectedFolder, fetchFolderNotes, currentPage]);

  return {
    handleMoveToActive,
    handleMoveToArchived,
  };
};
