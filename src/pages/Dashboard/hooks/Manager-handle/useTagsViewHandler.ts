import { useCallback, useMemo } from 'react';
import { notesService, type Note, type NoteTag } from '@/services/notesService';

interface UseTagsViewHandlerProps {
  setIsLoading: (loading: boolean) => void;
  setAllNotes: (notes: Note[]) => void;
  setPagination: (pagination: any) => void;
  setSelectedTag: (tag: NoteTag | null) => void;
  setCurrentPage: (page: number) => void;
  setSearchTerm: (term: string) => void;
  allNotes: Note[];
  searchTerm: string;
}

export const useTagsViewHandler = ({
  setIsLoading,
  setAllNotes,
  setPagination,
  setSelectedTag,
  setCurrentPage,
  setSearchTerm,
  allNotes,
  searchTerm,
}: UseTagsViewHandlerProps) => {
  // Fetch notes by tag
  const fetchNotesByTag = useCallback(async (tagId: number, page: number = 1) => {
    if (!tagId) return;
    
    setIsLoading(true);
    try {
      const response = await notesService.getNotesByTag(tagId, {
        page,
        limit: 9,
      });
      
      setAllNotes(response.notes || []);
      setPagination(response.pagination || {
        total: 0,
        page: 1,
        limit: 9,
        totalPages: 0,
      });
    } catch (error) {
      console.error('Error fetching notes by tag:', error);
      setAllNotes([]);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setAllNotes, setPagination]);

  // Client-side filtering by search term
  const filteredNotes = useMemo(() => {
    return searchTerm
      ? allNotes.filter(
          (note) =>
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.content.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : allNotes;
  }, [allNotes, searchTerm]);

  // Reset when changing tags
  const handleSelectTag = useCallback((tag: NoteTag | null) => {
    setSelectedTag(tag);
    setCurrentPage(1);
    setSearchTerm('');
    if (!tag) {
      setAllNotes([]);
      setPagination({ total: 0, page: 1, limit: 9, totalPages: 0 });
    }
  }, [setSelectedTag, setCurrentPage, setSearchTerm, setAllNotes, setPagination]);

  return {
    fetchNotesByTag,
    filteredNotes,
    handleSelectTag,
  };
};
