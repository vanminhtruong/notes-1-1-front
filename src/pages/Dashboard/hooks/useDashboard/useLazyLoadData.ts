import { useEffect } from 'react';
import { useAppDispatch } from '@/store';
import { fetchNotes, fetchNoteStats, setFilters } from '@/store/slices/notesSlice';
import type { ViewMode } from '../../components/ViewToggle';

interface UseLazyLoadDataProps {
  viewMode: ViewMode;
  currentPage: number;
  searchTerm: string;
  selectedCategory: string;
  selectedPriority: string;
  folders: any[];
  fetchFolders: () => void;
  showMoveToFolderModal?: boolean;
}

export const useLazyLoadData = ({
  viewMode,
  currentPage,
  searchTerm,
  selectedCategory,
  selectedPriority,
  folders,
  fetchFolders,
  showMoveToFolderModal,
}: UseLazyLoadDataProps) => {
  const dispatch = useAppDispatch();

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
    } else if (viewMode === 'folders' && folders.length === 0) {
      // Fetch folders only when entering folders view for the first time
      fetchFolders();
    }
    // Tags view doesn't need initial fetch - handled by TagsView component
  }, [viewMode, currentPage, searchTerm, selectedCategory, selectedPriority, dispatch, folders.length, fetchFolders]);

  // Fetch folders when Move to Folder modal opens (if not already loaded)
  useEffect(() => {
    if (showMoveToFolderModal && folders.length === 0) {
      fetchFolders();
    }
  }, [showMoveToFolderModal, folders.length, fetchFolders]);
};
