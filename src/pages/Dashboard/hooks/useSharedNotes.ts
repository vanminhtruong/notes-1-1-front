import { useState, useEffect, useCallback } from 'react';
import { notesService, type SharedNote } from '@/services/notesService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import type { UseSharedNotesReturn } from '../components/interface/SharedNotes.interface';
import { getSocket } from '@/services/socket';

const ITEMS_PER_PAGE = 3;

export const useSharedNotes = (): UseSharedNotesReturn => {
  const { t } = useTranslation('dashboard');
  const [sharedWithMe, setSharedWithMe] = useState<SharedNote[]>([]);
  const [sharedByMe, setSharedByMe] = useState<SharedNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination states
  const [pageWithMe, setPageWithMe] = useState(1);
  const [pageByMe, setPageByMe] = useState(1);
  const [totalPagesWithMe, setTotalPagesWithMe] = useState(1);
  const [totalPagesByMe, setTotalPagesByMe] = useState(1);
  const [totalWithMe, setTotalWithMe] = useState(0);
  const [totalByMe, setTotalByMe] = useState(0);

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
  }, [t]);

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
  }, [t]);

  const refreshSharedNotes = useCallback(async () => {
    setError(null);
    await Promise.all([
      fetchSharedWithMe(1),
      fetchSharedByMe(1),
    ]);
  }, [fetchSharedWithMe, fetchSharedByMe]);

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
  }, [t]);

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

  useEffect(() => {
    refreshSharedNotes();
  }, []);

  // Real-time socket listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      console.warn('⚠️ Socket not available for shared notes listeners');
      return;
    }

    console.log('🔌 Setting up shared notes socket listeners');

    // Listen for new shared notes received - refresh để có đầy đủ data
    const handleNoteSharedWithMe = async (data: any) => {
      console.log('📩 Received note_shared_with_me event:', data);
      // Refresh để lấy data đầy đủ từ server
      try {
        await fetchSharedWithMe(1);
      } catch (err) {
        console.error('Error refreshing sharedWithMe:', err);
      }
    };

    // Listen for new shared notes sent by me - refresh để có đầy đủ data
    const handleNoteSharedByMe = async (data: any) => {
      console.log('📤 Received note_shared_by_me event:', data);
      // Refresh để lấy data đầy đủ từ server
      try {
        await fetchSharedByMe(1);
      } catch (err) {
        console.error('Error refreshing sharedByMe:', err);
      }
    };

    // Listen for shared note removal
    const handleSharedNoteRemoved = (data: { id: number }) => {
      console.log('🗑️ Received shared_note_removed event:', data);
      setSharedWithMe(prev => prev.filter(sn => sn.id !== data.id));
      setSharedByMe(prev => prev.filter(sn => sn.id !== data.id));
    };

    socket.on('note_shared_with_me', handleNoteSharedWithMe);
    socket.on('note_shared_by_me', handleNoteSharedByMe);
    socket.on('shared_note_removed', handleSharedNoteRemoved);

    return () => {
      console.log('🔌 Cleaning up shared notes socket listeners');
      socket.off('note_shared_with_me', handleNoteSharedWithMe);
      socket.off('note_shared_by_me', handleNoteSharedByMe);
      socket.off('shared_note_removed', handleSharedNoteRemoved);
    };
  }, [fetchSharedWithMe, fetchSharedByMe]);

  return {
    sharedWithMe,
    sharedByMe,
    isLoading,
    error,
    refreshSharedNotes,
    removeSharedNote,
    pagination: {
      withMe: {
        currentPage: pageWithMe,
        totalPages: totalPagesWithMe,
        total: totalWithMe,
      },
      byMe: {
        currentPage: pageByMe,
        totalPages: totalPagesByMe,
        total: totalByMe,
      },
    },
    changePage: {
      withMe: changePageWithMe,
      byMe: changePageByMe,
    },
  };
};
