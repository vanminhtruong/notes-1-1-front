import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchTags,
  createTag,
  updateTag,
  deleteTag,
  addTagToNote,
  removeTagFromNote,
  addTagRealtime,
  updateTagRealtime,
  deleteTagRealtime,
} from '@/store/slices/noteTagsSlice';
import type { CreateTagData, UpdateTagData, NoteTag } from '@/services/notesService';
import { getSocket } from '@/services/socket';

export const useNoteTags = () => {
  const dispatch = useAppDispatch();
  const { tags, currentTag, isLoading, error } = useAppSelector((state) => state.noteTags);

  // Socket listeners for real-time updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleTagCreated = (data: { tag: NoteTag }) => {
      dispatch(addTagRealtime(data.tag));
    };

    const handleTagUpdated = (data: { tag: NoteTag }) => {
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

  const loadTags = useCallback((params?: {
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) => {
    return dispatch(fetchTags(params || {}));
  }, [dispatch]);

  const handleCreateTag = useCallback((data: CreateTagData) => {
    return dispatch(createTag(data));
  }, [dispatch]);

  const handleUpdateTag = useCallback((id: number, data: UpdateTagData) => {
    return dispatch(updateTag({ id, data }));
  }, [dispatch]);

  const handleDeleteTag = useCallback((id: number) => {
    return dispatch(deleteTag(id));
  }, [dispatch]);

  const handleAddTagToNote = useCallback((noteId: number, tagId: number) => {
    return dispatch(addTagToNote({ noteId, tagId }));
  }, [dispatch]);

  const handleRemoveTagFromNote = useCallback((noteId: number, tagId: number) => {
    return dispatch(removeTagFromNote({ noteId, tagId }));
  }, [dispatch]);

  return {
    tags,
    currentTag,
    isLoading,
    error,
    loadTags,
    createTag: handleCreateTag,
    updateTag: handleUpdateTag,
    deleteTag: handleDeleteTag,
    addTagToNote: handleAddTagToNote,
    removeTagFromNote: handleRemoveTagFromNote,
  };
};
