import { useCallback } from 'react';
import { notesService, type SharedNote, type GroupSharedNote } from '@/services/notesService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const ITEMS_PER_PAGE = 3;

interface UseSharedNotesHandlersProps {
  setIsLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
  setSharedWithMe: React.Dispatch<React.SetStateAction<SharedNote[]>>;
  setSharedByMe: React.Dispatch<React.SetStateAction<SharedNote[]>>;
  setGroupSharedNotes: React.Dispatch<React.SetStateAction<GroupSharedNote[]>>;
  setTotalPagesWithMe: (value: number) => void;
  setTotalPagesByMe: (value: number) => void;
  setTotalPagesGroups: (value: number) => void;
  setTotalWithMe: (value: number) => void;
  setTotalByMe: (value: number) => void;
  setTotalGroups: (value: number) => void;
  setPageWithMe: (value: number) => void;
  setPageByMe: (value: number) => void;
  setPageGroups: (value: number) => void;
  isLoading: boolean;
}

export const useSharedNotesHandlers = ({
  setIsLoading,
  setError,
  setSharedWithMe,
  setSharedByMe,
  setGroupSharedNotes,
  setTotalPagesWithMe,
  setTotalPagesByMe,
  setTotalPagesGroups,
  setTotalWithMe,
  setTotalByMe,
  setTotalGroups,
  setPageWithMe,
  setPageByMe,
  setPageGroups,
  isLoading,
}: UseSharedNotesHandlersProps) => {
  const { t } = useTranslation('dashboard');

  const fetchSharedWithMe = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await notesService.getSharedWithMe({
        page,
        limit: ITEMS_PER_PAGE,
        sortBy: 'sharedAt',
        sortOrder: 'DESC',
      });

      setSharedWithMe(response.sharedNotes);
      setTotalPagesWithMe(response.pagination.totalPages);
      setTotalWithMe(response.pagination.total);
      setPageWithMe(page);
    } catch (err: any) {
      setError(err?.response?.data?.message || t('sharedNotes.errors.fetchFailed'));
      toast.error(t('sharedNotes.errors.fetchFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [t, setIsLoading, setSharedWithMe, setTotalPagesWithMe, setTotalWithMe, setPageWithMe, setError]);

  const fetchSharedByMe = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await notesService.getSharedByMe({
        page,
        limit: ITEMS_PER_PAGE,
        sortBy: 'sharedAt',
        sortOrder: 'DESC',
      });

      setSharedByMe(response.sharedNotes);
      setTotalPagesByMe(response.pagination.totalPages);
      setTotalByMe(response.pagination.total);
      setPageByMe(page);
    } catch (err: any) {
      setError(err?.response?.data?.message || t('sharedNotes.errors.fetchFailed'));
      toast.error(t('sharedNotes.errors.fetchFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [t, setIsLoading, setSharedByMe, setTotalPagesByMe, setTotalByMe, setPageByMe, setError]);

  const fetchGroupSharedNotes = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await notesService.getGroupSharedNotes({
        page,
        limit: ITEMS_PER_PAGE,
        sortBy: 'sharedAt',
        sortOrder: 'DESC',
      });

      setGroupSharedNotes(response.groupSharedNotes);
      setTotalPagesGroups(response.pagination.totalPages);
      setTotalGroups(response.pagination.total);
      setPageGroups(page);
    } catch (err: any) {
      setError(err?.response?.data?.message || t('sharedNotes.errors.fetchFailed'));
      toast.error(t('sharedNotes.errors.fetchFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [t, setIsLoading, setGroupSharedNotes, setTotalPagesGroups, setTotalGroups, setPageGroups, setError]);

  const refreshSharedNotes = useCallback(async () => {
    setError(null);
    await Promise.all([
      fetchSharedWithMe(1),
      fetchSharedByMe(1),
      fetchGroupSharedNotes(1),
    ]);
  }, [fetchSharedWithMe, fetchSharedByMe, fetchGroupSharedNotes, setError]);

  const removeSharedNote = useCallback(async (sharedNoteId: number) => {
    try {
      await notesService.removeSharedNote(sharedNoteId);
      
      // Remove from local state
      setSharedWithMe(prev => prev.filter(sn => sn.id !== sharedNoteId));
      setSharedByMe(prev => prev.filter(sn => sn.id !== sharedNoteId));
      
      toast.success(t('sharedNotes.removeSuccess'));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('sharedNotes.errors.removeFailed'));
      throw err;
    }
  }, [t, setSharedWithMe, setSharedByMe]);

  const changePageWithMe = useCallback(async (page: number) => {
    if (!isLoading) {
      await fetchSharedWithMe(page);
    }
  }, [isLoading, fetchSharedWithMe]);

  const changePageByMe = useCallback(async (page: number) => {
    if (!isLoading) {
      await fetchSharedByMe(page);
    }
  }, [isLoading, fetchSharedByMe]);

  const changePageGroups = useCallback(async (page: number) => {
    if (!isLoading) {
      await fetchGroupSharedNotes(page);
    }
  }, [isLoading, fetchGroupSharedNotes]);

  return {
    fetchSharedWithMe,
    fetchSharedByMe,
    fetchGroupSharedNotes,
    refreshSharedNotes,
    removeSharedNote,
    changePageWithMe,
    changePageByMe,
    changePageGroups,
  };
};
