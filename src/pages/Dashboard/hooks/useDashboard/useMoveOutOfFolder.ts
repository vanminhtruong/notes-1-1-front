import { useCallback } from 'react';
import type { NoteFolder } from '@/services/notesService';

interface UseMoveOutOfFolderProps {
  noteToMoveOut: any;
  moveNoteToFolder: (noteId: number, folderId: number | null) => Promise<void>;
  confirmArchiveNote: (noteId: number) => void;
  handleCloseMoveOutOfFolder: () => void;
  selectedFolder: NoteFolder | null;
  fetchFolderNotes: (folderId: number) => void;
}

export const useMoveOutOfFolder = ({
  noteToMoveOut,
  moveNoteToFolder,
  confirmArchiveNote,
  handleCloseMoveOutOfFolder,
  selectedFolder,
  fetchFolderNotes,
}: UseMoveOutOfFolderProps) => {
  const handleMoveToActive = useCallback(async () => {
    if (!noteToMoveOut) return;
    
    try {
      // Move out of folder (folderId = null) and unarchive (isArchived = false)
      await moveNoteToFolder(noteToMoveOut.id, null);
      // Also need to unarchive if it was archived
      if (noteToMoveOut.isArchived) {
        await confirmArchiveNote(noteToMoveOut.id);
      }
      handleCloseMoveOutOfFolder();
      // Refresh folder notes
      if (selectedFolder) {
        fetchFolderNotes(selectedFolder.id);
      }
    } catch (error) {
      // Error already handled
    }
  }, [noteToMoveOut, moveNoteToFolder, confirmArchiveNote, handleCloseMoveOutOfFolder, selectedFolder, fetchFolderNotes]);

  const handleMoveToArchived = useCallback(async () => {
    if (!noteToMoveOut) return;
    
    try {
      // Move out of folder (folderId = null) and archive (isArchived = true)
      await moveNoteToFolder(noteToMoveOut.id, null);
      // Also need to archive if not already archived
      if (!noteToMoveOut.isArchived) {
        await confirmArchiveNote(noteToMoveOut.id);
      }
      handleCloseMoveOutOfFolder();
      // Refresh folder notes
      if (selectedFolder) {
        fetchFolderNotes(selectedFolder.id);
      }
    } catch (error) {
      // Error already handled
    }
  }, [noteToMoveOut, moveNoteToFolder, confirmArchiveNote, handleCloseMoveOutOfFolder, selectedFolder, fetchFolderNotes]);

  return {
    handleMoveToActive,
    handleMoveToArchived,
  };
};
