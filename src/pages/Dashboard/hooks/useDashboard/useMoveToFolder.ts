import { useCallback } from 'react';

interface UseMoveToFolderProps {
  noteToMove: any;
  moveNoteToFolder: (noteId: number, folderId: number | null) => Promise<void>;
  handleCloseMoveToFolder: () => void;
}

export const useMoveToFolder = ({
  noteToMove,
  moveNoteToFolder,
  handleCloseMoveToFolder,
}: UseMoveToFolderProps) => {
  const handleSelectFolder = useCallback(async (folderId: number) => {
    if (!noteToMove) return;
    
    try {
      await moveNoteToFolder(noteToMove.id, folderId);
      handleCloseMoveToFolder();
    } catch (error) {
      // Error already handled by hook
    }
  }, [noteToMove, moveNoteToFolder, handleCloseMoveToFolder]);

  return {
    handleSelectFolder,
  };
};
