import type { SharedNote } from '@/services/notesService';

export interface SharedNotesTabProps {
  searchTerm: string;
  currentUserId?: number;
}

export interface SharedNoteItemProps {
  sharedNote: SharedNote;
  type: 'received' | 'sent';
  onRemove: (id: number) => void;
  onViewNote: (noteId: number) => void;
  onEditNote?: (noteId: number) => void;
  onCreateFromNote?: (noteId: number) => void;
  currentUserId?: number;
}

export interface UseSharedNotesReturn {
  sharedWithMe: SharedNote[];
  sharedByMe: SharedNote[];
  isLoading: boolean;
  error: string | null;
  refreshSharedNotes: () => Promise<void>;
  removeSharedNote: (sharedNoteId: number) => Promise<void>;
  hasMore: {
    withMe: boolean;
    byMe: boolean;
  };
  loadMore: {
    withMe: () => Promise<void>;
    byMe: () => Promise<void>;
  };
}
