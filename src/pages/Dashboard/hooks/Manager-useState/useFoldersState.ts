import { useState } from 'react';
import type { NoteFolder } from '@/services/notesService';

export const useFoldersState = () => {
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<NoteFolder | null>(null);
  const [folderNotes, setFolderNotes] = useState<any[]>([]);
  const [isFolderNotesLoading, setIsFolderNotesLoading] = useState(false);
  const [folderNotesPagination, setFolderNotesPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);

  return {
    folders,
    setFolders,
    isLoading,
    setIsLoading,
    selectedFolder,
    setSelectedFolder,
    folderNotes,
    setFolderNotes,
    isFolderNotesLoading,
    setIsFolderNotesLoading,
    folderNotesPagination,
    setFolderNotesPagination,
    currentPage,
    setCurrentPage,
  };
};
