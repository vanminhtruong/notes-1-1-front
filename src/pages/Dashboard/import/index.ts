// React imports
export { useState, useCallback, useEffect } from 'react';
export { useTranslation } from 'react-i18next';
export { default as toast } from 'react-hot-toast';

// Custom hooks
export { useDashboard } from '@/pages/Dashboard/hooks/useDashboard';
export { useFolders } from '@/pages/Dashboard/hooks/useFolders';
export { useBodyScrollLock } from '@/pages/Dashboard/hooks/useBodyScrollLock';
export { useFolderNotes } from '@/pages/Dashboard/hooks/useFolderNotes';

// Components - Dashboard specific
export { default as StatsCards } from '@/pages/Dashboard/components/StatsCards';
export { default as ViewToggle, type ViewMode } from '@/pages/Dashboard/components/ViewToggle';
export { default as SearchAndFilters } from '@/pages/Dashboard/components/SearchAndFilters';
export { default as BulkActionsBar } from '@/pages/Dashboard/components/BulkActionsBar';
export { default as NotesGrid } from '@/pages/Dashboard/components/NotesGrid';
export { default as FoldersView } from '@/pages/Dashboard/components/FoldersView';
export { default as FolderNotesView } from '@/pages/Dashboard/components/FolderNotesView';

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

// Shared components
export { default as ShareNoteModal } from '@/components/ShareNoteModal';
export { default as LazyLoad } from '@/components/LazyLoad';

// Services and types
export { type NoteFolder } from '@/services/notesService';
export { socketService } from '@/services/socketService';

// Redux
export { useAppDispatch } from '@/store';
export { fetchNotes, fetchNoteStats } from '@/store/slices/notesSlice';
