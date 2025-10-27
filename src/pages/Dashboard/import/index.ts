// React imports
export { useState, useCallback, useEffect } from 'react';
export { useTranslation } from 'react-i18next';
export { default as toast } from 'react-hot-toast';

// Custom hooks - Manager-useState
export { useDashboardState } from '@/pages/Dashboard/hooks/Manager-useState/useDashboardState';
export { useFoldersState } from '@/pages/Dashboard/hooks/Manager-useState/useFoldersState';
export { useFolderNotesState } from '@/pages/Dashboard/hooks/Manager-useState/useFolderNotesState';
export { useViewModeState } from '@/pages/Dashboard/hooks/Manager-useState/useViewModeState';
export { useModalsState } from '@/pages/Dashboard/hooks/Manager-useState/useModalsState';
export { useSharedNotesState } from '@/pages/Dashboard/hooks/Manager-useState/useSharedNotesState';

// Custom hooks - Manager-handle
export { useDashboardHandlers } from '@/pages/Dashboard/hooks/Manager-handle/useDashboardHandlers';
export { useFolderHandlers } from '@/pages/Dashboard/hooks/Manager-handle/useFolderHandlers';
export { useMoveToFolderHandler } from '@/pages/Dashboard/hooks/Manager-handle/useMoveToFolderHandler';
export { useMoveOutOfFolderHandler } from '@/pages/Dashboard/hooks/Manager-handle/useMoveOutOfFolderHandler';
export { useUtilityHandlers } from '@/pages/Dashboard/hooks/Manager-handle/useUtilityHandlers';
export { useSharedNotesHandlers } from '@/pages/Dashboard/hooks/Manager-handle/useSharedNotesHandlers';

// Custom hooks - Manager-Effects
export { useReminderEffects } from '@/pages/Dashboard/hooks/Manager-Effects/useReminderEffects';
export { useFilterEffects } from '@/pages/Dashboard/hooks/Manager-Effects/useFilterEffects';
export { useCategoryEffects } from '@/pages/Dashboard/hooks/Manager-Effects/useCategoryEffects';
export { useSocketListenersEffects } from '@/pages/Dashboard/hooks/Manager-Effects/useSocketListenersEffects';
export { useLazyLoadDataEffects } from '@/pages/Dashboard/hooks/Manager-Effects/useLazyLoadDataEffects';
export { useLazyLoadCategoriesEffects } from '@/pages/Dashboard/hooks/Manager-Effects/useLazyLoadCategoriesEffects';
export { useBodyScrollLockEffect } from '@/pages/Dashboard/hooks/Manager-Effects/useBodyScrollLockEffect';
export { useSharedNotesEffects } from '@/pages/Dashboard/hooks/Manager-Effects/useSharedNotesEffects';

// Other hooks

// Components - Dashboard specific
export { default as StatsCards } from '@/pages/Dashboard/components/StatsCards';
export { default as ViewToggle, type ViewMode } from '@/pages/Dashboard/components/ViewToggle';
export { default as SearchAndFilters } from '@/pages/Dashboard/components/SearchAndFilters';
export { default as BulkActionsBar } from '@/pages/Dashboard/components/BulkActionsBar';
export { default as NotesGrid } from '@/pages/Dashboard/components/NotesGrid';
export { default as FoldersView } from '@/pages/Dashboard/components/FoldersView';
export { default as FolderNotesView } from '@/pages/Dashboard/components/FolderNotesView';
export { default as TagsView } from '@/pages/Dashboard/components/TagsView';

// Modal components - Notes
export { default as CreateNoteModal } from '@/pages/Dashboard/components/CreateNoteModal';
export { default as ViewNoteModal } from '@/pages/Dashboard/components/ViewNoteModal';
export { default as EditNoteModal } from '@/pages/Dashboard/components/EditNoteModal';
export { default as CreateNoteInFolderModal } from '@/pages/Dashboard/components/CreateNoteInFolderModal';
export { default as EditNoteInFolderModal } from '@/pages/Dashboard/components/EditNoteInFolderModal';

// Modal components - Folders
export { default as CreateFolderModal } from '@/pages/Dashboard/components/CreateFolderModal';
export { default as EditFolderModal } from '@/pages/Dashboard/components/EditFolderModal';
export { default as MoveToFolderModal } from '@/pages/Dashboard/components/MoveToFolderModal';
export { default as MoveOutOfFolderModal } from '@/pages/Dashboard/components/MoveOutOfFolderModal';

// Modal components - Tags
export { default as TagManagementModal } from '@/pages/Dashboard/components/TagManagementModal';

// Shared components
export { default as ShareNoteModal } from '@/components/ShareNoteModal';
export { default as LazyLoad } from '@/components/LazyLoad';

// Services and types
export { type NoteFolder } from '@/services/notesService';
export { socketService } from '@/services/socketService';

// Redux
export { useAppDispatch } from '@/store';
export { fetchNotes, fetchNoteStats } from '@/store/slices/notesSlice';
