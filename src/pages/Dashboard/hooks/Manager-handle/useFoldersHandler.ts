import { useCallback } from 'react';
import { notesService, type NoteFolder } from '@/services/notesService';
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

  const fetchFolderNotes = useCallback(async (_folderId: number, page: number = 1) => {
    setIsFolderNotesLoading(true);
    setCurrentPage(page);
    try {
      const response = await notesService.getNotes({ page, limit: 9 } as any);
      setFolderNotes(response.notes);
      setFolderNotesPagination({
        currentPage: response.pagination.page,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.total,
      });
    } catch (error: any) {
      toast.error(error.message || t('toasts.fetchFolderNotesError'));
    } finally {
      setIsFolderNotesLoading(false);
    }
  }, [t, setIsFolderNotesLoading, setCurrentPage, setFolderNotes, setFolderNotesPagination]);

  const createFolder = useCallback(async (name: string, _description?: string) => {
    try {
      const response = await notesService.createFolder({ name } as any);
      toast.success(t('toasts.createFolderSuccess'));
      await fetchFolders();
      return response;
    } catch (error: any) {
      toast.error(error.message || t('toasts.createFolderError'));
      throw error;
    }
  }, [t, fetchFolders]);

  const updateFolder = useCallback(async (folderId: number, name: string, _description?: string) => {
    try {
      const response = await notesService.updateFolder(folderId, { name } as any);
      toast.success(t('toasts.updateFolderSuccess'));
      await fetchFolders();
      if (selectedFolder?.id === folderId) {
        setSelectedFolder(response.folder);
      }
      return response;
    } catch (error: any) {
      toast.error(error.message || t('toasts.updateFolderError'));
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
      toast.success(t('toasts.moveNoteSuccess'));
    } catch (error: any) {
      toast.error(error.message || t('toasts.moveNoteError'));
      throw error;
    }
  }, [t]);

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
