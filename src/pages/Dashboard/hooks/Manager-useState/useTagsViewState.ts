import { useState } from 'react';
import type { Note, NoteTag } from '@/services/notesService';

export const useTagsViewState = () => {
  const [selectedTag, setSelectedTag] = useState<NoteTag | null>(null);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 0,
  });

  return {
    selectedTag,
    setSelectedTag,
    allNotes,
    setAllNotes,
    isLoading,
    setIsLoading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    pagination,
    setPagination,
  };
};
