import { useCallback } from 'react';
import type { NoteFolder } from '@/services/notesService';

interface UseDashboardPinHandlerProps {
  pinFolder: (folderId: number) => void;
  unpinFolder: (folderId: number) => void;
}

export const useDashboardPinHandler = ({
  pinFolder,
  unpinFolder,
}: UseDashboardPinHandlerProps) => {
  const handlePinUpdate = useCallback((updatedNote: any) => {
    console.log('Note pinned/unpinned:', updatedNote);
  }, []);

  const handlePinFolder = useCallback((folder: NoteFolder) => {
    pinFolder(folder.id);
  }, [pinFolder]);

  const handleUnpinFolder = useCallback((folder: NoteFolder) => {
    unpinFolder(folder.id);
  }, [unpinFolder]);

  return {
    handlePinUpdate,
    handlePinFolder,
    handleUnpinFolder,
  };
};
