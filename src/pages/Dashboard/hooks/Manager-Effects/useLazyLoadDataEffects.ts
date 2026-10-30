import { useEffect } from 'react';
import type { AppDispatch } from '@/store';
import { fetchNotes, fetchNoteStats, setFilters } from '@/store/slices/notesSlice';
import type { NoteFolder } from '@/services/notesService';

type ViewMode = 'active' | 'archived' | 'folders' | 'tags';

interface UseLazyLoadDataEffectsProps {
  dispatch: AppDispatch;
  viewMode: ViewMode;
  currentPage: number;
  searchTerm: string;
  selectedCategory: string;
  selectedPriority: string;
  folders: NoteFolder[];
  fetchFolders: () => void;
  showMoveToFolderModal?: boolean;
}

export const useLazyLoadDataEffects = ({
  dispatch,
  viewMode,
  currentPage,
  searchTerm,
  selectedCategory,
  selectedPriority,
  fetchFolders,
  showMoveToFolderModal,
}: UseLazyLoadDataEffectsProps) => {
  // Lazy load data based on viewMode
  useEffect(() => {
    if (viewMode === 'active' || viewMode === 'archived') {
      // Fetch notes and stats only when in active/archived view
      dispatch(setFilters({
        search: searchTerm,
        category: selectedCategory,
        priority: selectedPriority,
        isArchived: viewMode === 'archived',
      }));
      
      dispatch(fetchNotes({
        page: currentPage,
        limit: 9,
        search: searchTerm,
        category: selectedCategory || undefined,
        priority: selectedPriority || undefined,
        isArchived: viewMode === 'archived',
      }));
      
      dispatch(fetchNoteStats());
    } else if (viewMode === 'folders') {
      // Refresh counts when returning to the folders view.
      fetchFolders();
    }
    // Tags view doesn't need initial fetch - handled by TagsView component
  }, [viewMode, currentPage, searchTerm, selectedCategory, selectedPriority, dispatch, fetchFolders]);

  // Refresh destination counts each time the move dialog opens.
  useEffect(() => {
    if (showMoveToFolderModal) {
      fetchFolders();
    }
  }, [showMoveToFolderModal, fetchFolders]);
};
