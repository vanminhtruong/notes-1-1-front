import { useCallback } from 'react';

interface UseMoveToFolderHandlerProps {
  noteToMove: any | null;
  moveNoteToFolder: (noteId: number, folderId: number | null) => Promise<void>;
  handleCloseMoveToFolder: () => void;
}

export const useMoveToFolderHandler = ({
  noteToMove,
  moveNoteToFolder,
  handleCloseMoveToFolder,
}: UseMoveToFolderHandlerProps) => {
  const handleSelectFolder = useCallback(async (folderId: number) => {
    if (!noteToMove) return;
    
    try {
      await moveNoteToFolder(noteToMove.id, folderId);
      handleCloseMoveToFolder();
    } catch (error) {
      // Error already handled in moveNoteToFolder
    }
  }, [noteToMove, moveNoteToFolder, handleCloseMoveToFolder]);

  return {
    handleSelectFolder,
  };
};
