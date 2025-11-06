import { useEffect, useRef } from 'react';
import { socketService } from '@/services/socketService';
import type { AppDispatch } from '@/store';
import { fetchNotes, fetchNoteStats } from '@/store/slices/notesSlice';
import { addTagRealtime, updateTagRealtime, deleteTagRealtime, fetchTags } from '@/store/slices/noteTagsSlice';

type ViewMode = 'active' | 'archived' | 'folders' | 'tags';

interface UseSocketListenersEffectsProps {
  dispatch: AppDispatch;
  currentPage: number;
  searchTerm: string;
  selectedCategory: string;
  selectedPriority: string;
  viewMode: ViewMode;
}

export const useSocketListenersEffects = ({
  dispatch,
  currentPage,
  searchTerm,
  selectedCategory,
  selectedPriority,
  viewMode,
}: UseSocketListenersEffectsProps) => {
  // Use refs to store latest values without re-subscribing
  const filtersRef = useRef({ currentPage, searchTerm, selectedCategory, selectedPriority, viewMode });
  
  // Update refs when filters change
  useEffect(() => {
    filtersRef.current = { currentPage, searchTerm, selectedCategory, selectedPriority, viewMode };
  }, [currentPage, searchTerm, selectedCategory, selectedPriority, viewMode]);

  // Listen to note_moved_to_folder event to refresh Active/Archived tabs
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleNoteMoved = () => {
      const filters = filtersRef.current;
      // Refresh notes list and stats
      dispatch(fetchNotes({
        page: filters.currentPage,
        limit: 9, // Match ITEMS_PER_PAGE from useDashboard
        search: filters.searchTerm,
        category: filters.selectedCategory || undefined,
        priority: filters.selectedPriority || undefined,
        isArchived: filters.viewMode === 'archived',
      }));
      dispatch(fetchNoteStats());
    };

    const handleNotePinned = () => {
      const filters = filtersRef.current;
      // Refresh notes list to show updated order (pinned notes on top)
      dispatch(fetchNotes({
        page: filters.currentPage,
        limit: 9, // Match ITEMS_PER_PAGE from useDashboard
        search: filters.searchTerm,
        category: filters.selectedCategory || undefined,
        priority: filters.selectedPriority || undefined,
        isArchived: filters.viewMode === 'archived',
      }));
    };

    socket.on('note_moved_to_folder', handleNoteMoved);
    socket.on('note:pinned', handleNotePinned);
    socket.on('note:unpinned', handleNotePinned);

    return () => {
      socket.off('note_moved_to_folder', handleNoteMoved);
      socket.off('note:pinned', handleNotePinned);
      socket.off('note:unpinned', handleNotePinned);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // Listen to folder and note events to refresh stats
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleStatsUpdate = () => {
      dispatch(fetchNoteStats());
    };

    // Listen to folder-related events
    socket.on('folder_created', handleStatsUpdate);
    socket.on('folder_deleted', handleStatsUpdate);
    socket.on('folder_updated', handleStatsUpdate);
    socket.on('admin_folder_created', handleStatsUpdate);
    socket.on('admin_folder_deleted', handleStatsUpdate);
    socket.on('admin_folder_updated', handleStatsUpdate);
    
    // Listen to note events (for notes in folders count)
    socket.on('note_created', handleStatsUpdate);
    socket.on('note_deleted', handleStatsUpdate);
    socket.on('note_updated', handleStatsUpdate);
    socket.on('admin_note_created', handleStatsUpdate);
    socket.on('admin_note_deleted', handleStatsUpdate);
    socket.on('admin_note_updated', handleStatsUpdate);

    return () => {
      socket.off('folder_created', handleStatsUpdate);
      socket.off('folder_deleted', handleStatsUpdate);
      socket.off('folder_updated', handleStatsUpdate);
      socket.off('admin_folder_created', handleStatsUpdate);
      socket.off('admin_folder_deleted', handleStatsUpdate);
      socket.off('admin_folder_updated', handleStatsUpdate);
      socket.off('note_created', handleStatsUpdate);
      socket.off('note_deleted', handleStatsUpdate);
      socket.off('note_updated', handleStatsUpdate);
      socket.off('admin_note_created', handleStatsUpdate);
      socket.off('admin_note_deleted', handleStatsUpdate);
      socket.off('admin_note_updated', handleStatsUpdate);
    };
  }, [dispatch]);

  // Listen to tag events for real-time updates
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleTagCreated = (data: any) => {
      dispatch(addTagRealtime(data.tag));
    };

    const handleTagUpdated = (data: any) => {
      dispatch(updateTagRealtime(data.tag));
    };

    const handleTagDeleted = (data: any) => {
      dispatch(deleteTagRealtime({ id: data.id }));
    };

    const handleTagPinned = () => {
      // Fetch lại danh sách tags để backend sắp xếp lại theo isPinned
      dispatch(fetchTags({}));
    };

    const handleTagUnpinned = () => {
      // Fetch lại danh sách tags để backend sắp xếp lại theo isPinned
      dispatch(fetchTags({}));
    };

    const handleNoteTagAdded = () => {
      const filters = filtersRef.current;
      // Refresh notes to show updated tags
      dispatch(fetchNotes({
        page: filters.currentPage,
        limit: 9,
        search: filters.searchTerm,
        category: filters.selectedCategory || undefined,
        priority: filters.selectedPriority || undefined,
        isArchived: filters.viewMode === 'archived',
      }));
    };

    const handleNoteTagRemoved = () => {
      const filters = filtersRef.current;
      // Refresh notes to show updated tags
      dispatch(fetchNotes({
        page: filters.currentPage,
        limit: 9,
        search: filters.searchTerm,
        category: filters.selectedCategory || undefined,
        priority: filters.selectedPriority || undefined,
        isArchived: filters.viewMode === 'archived',
      }));
    };

    socket.on('tag_created', handleTagCreated);
    socket.on('tag_updated', handleTagUpdated);
    socket.on('tag_deleted', handleTagDeleted);
    socket.on('tag_pinned', handleTagPinned);
    socket.on('tag_unpinned', handleTagUnpinned);
    socket.on('admin_tag_created', handleTagCreated);
    socket.on('admin_tag_updated', handleTagUpdated);
    socket.on('admin_tag_deleted', handleTagDeleted);
    socket.on('admin_tag_pinned', handleTagPinned);
    socket.on('admin_tag_unpinned', handleTagUnpinned);
    socket.on('note_tag_added', handleNoteTagAdded);
    socket.on('note_tag_removed', handleNoteTagRemoved);

    return () => {
      socket.off('tag_created', handleTagCreated);
      socket.off('tag_updated', handleTagUpdated);
      socket.off('tag_deleted', handleTagDeleted);
      socket.off('tag_pinned', handleTagPinned);
      socket.off('tag_unpinned', handleTagUnpinned);
      socket.off('admin_tag_created', handleTagCreated);
      socket.off('admin_tag_updated', handleTagUpdated);
      socket.off('admin_tag_deleted', handleTagDeleted);
      socket.off('admin_tag_pinned', handleTagPinned);
      socket.off('admin_tag_unpinned', handleTagUnpinned);
      socket.off('note_tag_added', handleNoteTagAdded);
      socket.off('note_tag_removed', handleNoteTagRemoved);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);
};
