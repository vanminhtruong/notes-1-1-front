import { useState, useEffect, useCallback } from 'react';
import { notesService, type Note, type NoteTag } from '@/services/notesService';
import { useAppSelector } from '@/store';
import { socketService } from '@/services/socketService';

export const useTagsView = () => {
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
  
  const dueReminderNoteIds = useAppSelector((state) => state.notes.dueReminderNoteIds);

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
  }, []);

  // Client-side filtering by search term
  const filteredNotes = searchTerm
    ? allNotes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allNotes;

  // Refresh notes when tag or page changes
  useEffect(() => {
    if (selectedTag) {
      fetchNotesByTag(selectedTag.id, currentPage);
    }
  }, [selectedTag, currentPage, fetchNotesByTag]);

  // Socket listener for real-time updates
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket || !selectedTag) return;

    const handleNoteUpdated = () => {
      // Refresh notes list
      if (selectedTag) {
        fetchNotesByTag(selectedTag.id, currentPage);
      }
    };

    // Listen to various note events
    socket.on('note_created', handleNoteUpdated);
    socket.on('note_updated', handleNoteUpdated);
    socket.on('note_deleted', handleNoteUpdated);
    socket.on('note_tag_added', handleNoteUpdated);
    socket.on('note_tag_removed', handleNoteUpdated);
    socket.on('note_archived', handleNoteUpdated);
    socket.on('note_unarchived', handleNoteUpdated);

    return () => {
      socket.off('note_created', handleNoteUpdated);
      socket.off('note_updated', handleNoteUpdated);
      socket.off('note_deleted', handleNoteUpdated);
      socket.off('note_tag_added', handleNoteUpdated);
      socket.off('note_tag_removed', handleNoteUpdated);
      socket.off('note_archived', handleNoteUpdated);
      socket.off('note_unarchived', handleNoteUpdated);
    };
  }, [selectedTag, currentPage, fetchNotesByTag]);

  // Reset when changing tags
  const handleSelectTag = useCallback((tag: NoteTag | null) => {
    setSelectedTag(tag);
    setCurrentPage(1);
    setSearchTerm('');
    if (!tag) {
      setAllNotes([]);
      setPagination({ total: 0, page: 1, limit: 9, totalPages: 0 });
    }
  }, []);

  return {
    selectedTag,
    setSelectedTag: handleSelectTag,
    notes: filteredNotes,
    isLoading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    pagination,
    dueReminderNoteIds,
  };
};
