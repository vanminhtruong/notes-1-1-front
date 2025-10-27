import { useEffect } from 'react';
import { socketService } from '@/services/socketService';
import type { NoteTag } from '@/services/notesService';

interface UseTagsViewEffectsProps {
  selectedTag: NoteTag | null;
  currentPage: number;
  fetchNotesByTag: (tagId: number, page: number) => Promise<void>;
}

export const useTagsViewEffects = ({
  selectedTag,
  currentPage,
  fetchNotesByTag,
}: UseTagsViewEffectsProps) => {
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
};
