import { useCallback, useEffect, useRef } from 'react';
import { socketService } from '@/services/socketService';
import { notesService, type NoteFolder, type CreateFolderData, type UpdateFolderData } from '@/services/notesService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface UseFoldersHandlerProps {
  setFolders: React.Dispatch<React.SetStateAction<NoteFolder[]>>;
  setIsLoading: (loading: boolean) => void;
  setFolderNotes: React.Dispatch<React.SetStateAction<any[]>>;
  setIsFolderNotesLoading: (loading: boolean) => void;
  setFolderNotesPagination: React.Dispatch<React.SetStateAction<{
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }>>;
  setCurrentPage: (page: number) => void;
  selectedFolder: NoteFolder | null;
  setSelectedFolder: React.Dispatch<React.SetStateAction<NoteFolder | null>>;
}

export const useFoldersHandler = ({
  setFolders,
  setIsLoading,
  setFolderNotes,
  setIsFolderNotesLoading,
  setFolderNotesPagination,
  setCurrentPage,
  selectedFolder,
  setSelectedFolder,
}: UseFoldersHandlerProps) => {
  const { t } = useTranslation('dashboard');
  const folderRequest = useRef(0);

  const fetchFolders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await notesService.getFolders();
      setFolders(response.folders);
    } catch (error: any) {
      toast.error(error.message || t('toasts.fetchFoldersError'));
    } finally {
      setIsLoading(false);
    }
  }, [t, setIsLoading, setFolders]);

  const fetchFolderNotes = useCallback(async (folderId: number, page: number = 1) => {
    const request = ++folderRequest.current;
    setIsFolderNotesLoading(true);
    setFolderNotes([]);
    setCurrentPage(page);
    try {
      let response = await notesService.getFolderById(folderId, { page, limit: 9 });
      if (request !== folderRequest.current) return;
      const lastPage = Math.max(1, response.pagination.totalPages);
      if (page > lastPage) {
        response = await notesService.getFolderById(folderId, { page: lastPage, limit: 9 });
        if (request !== folderRequest.current) return;
      }
      setCurrentPage(response.pagination.page);
      setFolderNotes(response.notes);
      setFolderNotesPagination({
        currentPage: response.pagination.page,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.total,
      });
      setFolders(previous => previous.map(folder => folder.id === folderId
        ? { ...folder, notesCount: response.pagination.total } : folder));
    } catch (error: any) {
      if (request === folderRequest.current) {
        toast.error(error.message || t('toasts.fetchFolderNotesError'));
      }
    } finally {
      if (request === folderRequest.current) setIsFolderNotesLoading(false);
    }
  }, [t, setIsFolderNotesLoading, setCurrentPage, setFolderNotes, setFolderNotesPagination, setFolders]);

  // Keep folder counts and the open folder in sync after changes from any client.
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;
    const refresh = () => {
      void fetchFolders();
      if (selectedFolder) void fetchFolderNotes(selectedFolder.id);
    };
    const events = ['note_created', 'note_updated', 'note_deleted', 'note_archived', 'note_moved_to_folder',
      'note:pinned', 'note:unpinned', 'folder_created', 'folder_updated', 'folder_deleted'];
    events.forEach(event => socket.on(event, refresh));
    return () => { events.forEach(event => socket.off(event, refresh)); };
  }, [fetchFolders, fetchFolderNotes, selectedFolder?.id]);

  const createFolder = useCallback(async (data: CreateFolderData) => {
    try {
      await notesService.createFolder(data);
      toast.success(t('toasts.createFolderSuccess'));
      await fetchFolders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || t('toasts.createFolderError'));
      throw error;
    }
  }, [t, fetchFolders]);

  const updateFolder = useCallback(async (folderId: number, data: UpdateFolderData) => {
    try {
      const response = await notesService.updateFolder(folderId, data);
      toast.success(t('toasts.updateFolderSuccess'));
      await fetchFolders();
      if (selectedFolder?.id === folderId) {
        setSelectedFolder(response.folder);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || t('toasts.updateFolderError'));
      throw error;
    }
  }, [t, fetchFolders, selectedFolder, setSelectedFolder]);

  const deleteFolder = useCallback(async (folderId: number) => {
    try {
      await notesService.deleteFolder(folderId);
      toast.success(t('toasts.deleteFolderSuccess'));
      await fetchFolders();
    } catch (error: any) {
      toast.error(error.message || t('toasts.deleteFolderError'));
      throw error;
    }
  }, [t, fetchFolders]);

  const moveNoteToFolder = useCallback(async (noteId: number, folderId: number | null) => {
    try {
      await notesService.moveNoteToFolder(noteId, folderId);
      toast.success(t(folderId === null ? 'qaFixes.movedOut' : 'toasts.moveNoteSuccess'));
      await fetchFolders();
      if (selectedFolder) await fetchFolderNotes(selectedFolder.id);
    } catch (error: any) {
      toast.error(error.message || t('toasts.moveNoteError'));
      throw error;
    }
  }, [t, fetchFolders, fetchFolderNotes, selectedFolder]);

  const pinFolder = useCallback(async (folderId: number) => {
    try {
      await notesService.pinFolder(folderId);
      await fetchFolders();
    } catch (error: any) {
      toast.error(error.message || t('toasts.pinFolderError'));
    }
  }, [t, fetchFolders]);

  const unpinFolder = useCallback(async (folderId: number) => {
    try {
      await notesService.unpinFolder(folderId);
      await fetchFolders();
    } catch (error: any) {
      toast.error(error.message || t('toasts.unpinFolderError'));
    }
  }, [t, fetchFolders]);

  return {
    fetchFolders,
    fetchFolderNotes,
    createFolder,
    updateFolder,
    deleteFolder,
    moveNoteToFolder,
    pinFolder,
    unpinFolder,
  };
};
