import { useEffect } from 'react';
import { socketService } from '@/services/socketService';
import type { AppDispatch } from '@/store';
import { fetchNotes, fetchNoteStats } from '@/store/slices/notesSlice';
import type { ViewMode } from '../../components/ViewToggle';

interface UseSocketListenersProps {
  dispatch: AppDispatch;
  currentPage: number;
  searchTerm: string;
  selectedCategory: string;
  selectedPriority: string;
  viewMode: ViewMode;
}

export const useSocketListeners = ({
  dispatch,
  currentPage,
  searchTerm,
  selectedCategory,
  selectedPriority,
  viewMode,
}: UseSocketListenersProps) => {
  // Listen to note_moved_to_folder event to refresh Active/Archived tabs
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleNoteMoved = () => {
      // Refresh notes list and stats
      dispatch(fetchNotes({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        category: selectedCategory || undefined,
        priority: selectedPriority || undefined,
        isArchived: viewMode === 'archived',
      }));
      dispatch(fetchNoteStats());
    };

    socket.on('note_moved_to_folder', handleNoteMoved);

    return () => {
      socket.off('note_moved_to_folder', handleNoteMoved);
    };
  }, [dispatch, currentPage, searchTerm, selectedCategory, selectedPriority, viewMode]);

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
};
