import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchTags,
  createTag,
  updateTag,
  deleteTag,
  togglePinTag,
  addTagToNote,
  removeTagFromNote,
} from '@/store/slices/noteTagsSlice';
import type { CreateTagData, UpdateTagData } from '@/services/notesService';

export const useNoteTagsHandler = () => {
  const dispatch = useAppDispatch();
  const { tags, currentTag, isLoading, error } = useAppSelector((state) => state.noteTags);

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

  const handleTogglePinTag = useCallback((id: number) => {
    return dispatch(togglePinTag(id));
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
    togglePinTag: handleTogglePinTag,
    addTagToNote: handleAddTagToNote,
    removeTagFromNote: handleRemoveTagFromNote,
  };
};
