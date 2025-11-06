import { useEffect } from 'react';
import { useAppDispatch } from '@/store';
import {
  addTagRealtime,
  updateTagRealtime,
  deleteTagRealtime,
} from '@/store/slices/noteTagsSlice';
import type { NoteTag } from '@/services/notesService';
import { getSocket } from '@/services/socket';

export const useNoteTagsEffects = () => {
  const dispatch = useAppDispatch();

  // Socket listeners for real-time updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleTagCreated = (data: { tag: NoteTag }) => {
      dispatch(addTagRealtime(data.tag));
    };

    const handleTagUpdated = (data: { tag: NoteTag }) => {
      // Update tag và tự động sắp xếp lại vị trí trong reducer
      dispatch(updateTagRealtime(data.tag));
    };

    const handleTagDeleted = (data: { id: number }) => {
      dispatch(deleteTagRealtime(data));
    };

    const handleNoteTagAdded = (data: { noteId: number; tag: NoteTag }) => {
      // Update the note in notes slice to include the new tag
      // This would require fetching the note again or updating it optimistically
      console.log('Note tag added:', data);
    };

    const handleNoteTagRemoved = (data: { noteId: number; tagId: number }) => {
      // Update the note in notes slice to remove the tag
      console.log('Note tag removed:', data);
    };

    socket.on('tag_created', handleTagCreated);
    socket.on('tag_updated', handleTagUpdated);
    socket.on('tag_deleted', handleTagDeleted);
    socket.on('note_tag_added', handleNoteTagAdded);
    socket.on('note_tag_removed', handleNoteTagRemoved);

    return () => {
      socket.off('tag_created', handleTagCreated);
      socket.off('tag_updated', handleTagUpdated);
      socket.off('tag_deleted', handleTagDeleted);
      socket.off('note_tag_added', handleNoteTagAdded);
      socket.off('note_tag_removed', handleNoteTagRemoved);
    };
  }, [dispatch]);
};
