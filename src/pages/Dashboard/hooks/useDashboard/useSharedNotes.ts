import { useState, useEffect, useCallback } from 'react';
import { notesService, type SharedNote, type GroupSharedNote } from '@/services/notesService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import type { UseSharedNotesReturn } from '../../components/interface/SharedNotes.interface';
import { getSocket } from '@/services/socket';

const ITEMS_PER_PAGE = 3;

export const useSharedNotes = (): UseSharedNotesReturn => {
  const { t } = useTranslation('dashboard');
  const [sharedWithMe, setSharedWithMe] = useState<SharedNote[]>([]);
  const [sharedByMe, setSharedByMe] = useState<SharedNote[]>([]);
  const [groupSharedNotes, setGroupSharedNotes] = useState<GroupSharedNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination states
  const [pageWithMe, setPageWithMe] = useState(1);
  const [pageByMe, setPageByMe] = useState(1);
  const [pageGroups, setPageGroups] = useState(1);
  const [totalPagesWithMe, setTotalPagesWithMe] = useState(1);
  const [totalPagesByMe, setTotalPagesByMe] = useState(1);
  const [totalPagesGroups, setTotalPagesGroups] = useState(1);
  const [totalWithMe, setTotalWithMe] = useState(0);
  const [totalByMe, setTotalByMe] = useState(0);
  const [totalGroups, setTotalGroups] = useState(0);

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
  }, [t]);

  const refreshSharedNotes = useCallback(async () => {
    setError(null);
    await Promise.all([
      fetchSharedWithMe(1),
      fetchSharedByMe(1),
      fetchGroupSharedNotes(1),
    ]);
  }, [fetchSharedWithMe, fetchSharedByMe, fetchGroupSharedNotes]);

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

  const changePageGroups = useCallback(async (page: number) => {
    if (!isLoading) {
      await fetchGroupSharedNotes(page);
    }
  }, [isLoading, fetchGroupSharedNotes]);

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

    // Listen for group shared notes - realtime update when note shared to group
    const handleGroupNoteShared = async (data: any) => {
      console.log('👥 Received group_note_shared event:', data);
      // Refresh to get full data from server
      try {
        await fetchGroupSharedNotes(1);
      } catch (err) {
        console.error('Error refreshing groupSharedNotes:', err);
      }
    };

    // Listen for group note permissions updated
    const handleGroupNotePermissionsUpdated = (data: any) => {
      console.log('🔐 Received group_note_permissions_updated event:', data);
      // Update in local state
      setGroupSharedNotes(prev => prev.map(gsn => 
        gsn.id === data.id 
          ? { ...gsn, canEdit: data.canEdit, canDelete: data.canDelete, canCreate: data.canCreate }
          : gsn
      ));
    };

    // Listen for note updated - update in all shared lists
    const handleNoteUpdated = (updatedNote: any) => {
      console.log('📝 Received note_updated event:', updatedNote);
      
      // Update in sharedWithMe
      setSharedWithMe(prev => prev.map(sn => 
        sn.noteId === updatedNote.id 
          ? { ...sn, note: { ...sn.note, ...updatedNote } }
          : sn
      ));
      
      // Update in sharedByMe
      setSharedByMe(prev => prev.map(sn => 
        sn.noteId === updatedNote.id 
          ? { ...sn, note: { ...sn.note, ...updatedNote } }
          : sn
      ));
      
      // Update in groupSharedNotes
      setGroupSharedNotes(prev => prev.map(gsn => 
        gsn.noteId === updatedNote.id 
          ? { ...gsn, note: { ...gsn.note, ...updatedNote } }
          : gsn
      ));
    };

    // Listen for note deleted - remove from all shared lists
    const handleNoteDeleted = (data: { id: number }) => {
      console.log('🗑️ Received note_deleted event:', data);
      
      // Remove from sharedWithMe
      setSharedWithMe(prev => prev.filter(sn => sn.noteId !== data.id));
      
      // Remove from sharedByMe
      setSharedByMe(prev => prev.filter(sn => sn.noteId !== data.id));
      
      // Remove from groupSharedNotes
      setGroupSharedNotes(prev => prev.filter(gsn => gsn.noteId !== data.id));
    };

    // Listen for group note removed
    const handleGroupNoteRemoved = (data: { id: number }) => {
      console.log('🗑️ Received group_note_removed event:', data);
      // Remove from local state
      setGroupSharedNotes(prev => prev.filter(gsn => gsn.id !== data.id));
    };

    // Listen for shared note removal
    const handleSharedNoteRemoved = (data: { id: number }) => {
      console.log('🗑️ Received shared_note_removed event:', data);
      setSharedWithMe(prev => prev.filter(sn => sn.id !== data.id));
      setSharedByMe(prev => prev.filter(sn => sn.id !== data.id));
    };

    // Listen for individual shared note permissions updated
    const handleSharedNotePermissionsUpdated = (updatedSharedNote: any) => {
      console.log('🔄 Received shared_note_permissions_updated event:', updatedSharedNote);
      
      // Update in sharedWithMe
      setSharedWithMe(prev => prev.map(sn => 
        sn.id === updatedSharedNote.id 
          ? { ...sn, canEdit: updatedSharedNote.canEdit, canDelete: updatedSharedNote.canDelete, canCreate: updatedSharedNote.canCreate }
          : sn
      ));
      
      // Update in sharedByMe
      setSharedByMe(prev => prev.map(sn => 
        sn.id === updatedSharedNote.id 
          ? { ...sn, canEdit: updatedSharedNote.canEdit, canDelete: updatedSharedNote.canDelete, canCreate: updatedSharedNote.canCreate }
          : sn
      ));
    };

    socket.on('note_shared_with_me', handleNoteSharedWithMe);
    socket.on('note_shared_by_me', handleNoteSharedByMe);
    socket.on('group_note_shared', handleGroupNoteShared);
    socket.on('group_note_permissions_updated', handleGroupNotePermissionsUpdated);
    socket.on('group_shared_note_updated_by_admin', handleGroupNotePermissionsUpdated);
    socket.on('shared_note_permissions_updated', handleSharedNotePermissionsUpdated);
    socket.on('note_updated', handleNoteUpdated);
    socket.on('note_deleted', handleNoteDeleted);
    socket.on('group_note_removed', handleGroupNoteRemoved);
    socket.on('shared_note_removed', handleSharedNoteRemoved);

    return () => {
      console.log('🔌 Cleaning up shared notes socket listeners');
      socket.off('note_shared_with_me', handleNoteSharedWithMe);
      socket.off('note_shared_by_me', handleNoteSharedByMe);
      socket.off('group_note_shared', handleGroupNoteShared);
      socket.off('group_note_permissions_updated', handleGroupNotePermissionsUpdated);
      socket.off('group_shared_note_updated_by_admin', handleGroupNotePermissionsUpdated);
      socket.off('shared_note_permissions_updated', handleSharedNotePermissionsUpdated);
      socket.off('note_updated', handleNoteUpdated);
      socket.off('note_deleted', handleNoteDeleted);
      socket.off('group_note_removed', handleGroupNoteRemoved);
      socket.off('shared_note_removed', handleSharedNoteRemoved);
    };
  }, [fetchSharedWithMe, fetchSharedByMe, fetchGroupSharedNotes]);

  return {
    sharedWithMe,
    sharedByMe,
    groupSharedNotes,
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
      groups: {
        currentPage: pageGroups,
        totalPages: totalPagesGroups,
        total: totalGroups,
      },
    },
    changePage: {
      withMe: changePageWithMe,
      byMe: changePageByMe,
      groups: changePageGroups,
    },
  };
};
