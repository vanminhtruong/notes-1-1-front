import { useEffect } from 'react';
import { getSocket } from '@/services/socket';
import type { SharedNote, GroupSharedNote } from '@/services/notesService';

interface UseSharedNotesEffectsProps {
  refreshSharedNotes: () => Promise<void>;
  fetchSharedWithMe: (page: number) => Promise<void>;
  fetchSharedByMe: (page: number) => Promise<void>;
  fetchGroupSharedNotes: (page: number) => Promise<void>;
  setSharedWithMe: React.Dispatch<React.SetStateAction<SharedNote[]>>;
  setSharedByMe: React.Dispatch<React.SetStateAction<SharedNote[]>>;
  setGroupSharedNotes: React.Dispatch<React.SetStateAction<GroupSharedNote[]>>;
}

export const useSharedNotesEffects = ({
  refreshSharedNotes,
  fetchSharedWithMe,
  fetchSharedByMe,
  fetchGroupSharedNotes,
  setSharedWithMe,
  setSharedByMe,
  setGroupSharedNotes,
}: UseSharedNotesEffectsProps) => {
  // Initial load
  useEffect(() => {
    refreshSharedNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      try {
        await fetchSharedWithMe(1);
      } catch (err) {
        console.error('Error refreshing sharedWithMe:', err);
      }
    };

    // Listen for new shared notes sent by me - refresh để có đầy đủ data
    const handleNoteSharedByMe = async (data: any) => {
      console.log('📤 Received note_shared_by_me event:', data);
      try {
        await fetchSharedByMe(1);
      } catch (err) {
        console.error('Error refreshing sharedByMe:', err);
      }
    };

    // Listen for group shared notes - realtime update when note shared to group
    const handleGroupNoteShared = async (data: any) => {
      console.log('👥 Received group_note_shared event:', data);
      try {
        await fetchGroupSharedNotes(1);
      } catch (err) {
        console.error('Error refreshing groupSharedNotes:', err);
      }
    };

    // Listen for group note permissions updated
    const handleGroupNotePermissionsUpdated = (data: any) => {
      console.log('🔐 Received group_note_permissions_updated event:', data);
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
      
      setSharedWithMe(prev => prev.filter(sn => sn.noteId !== data.id));
      setSharedByMe(prev => prev.filter(sn => sn.noteId !== data.id));
      setGroupSharedNotes(prev => prev.filter(gsn => gsn.noteId !== data.id));
    };

    // Listen for group note removed
    const handleGroupNoteRemoved = (data: { id: number }) => {
      console.log('🗑️ Received group_note_removed event:', data);
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
      
      setSharedWithMe(prev => prev.map(sn => 
        sn.id === updatedSharedNote.id 
          ? { ...sn, canEdit: updatedSharedNote.canEdit, canDelete: updatedSharedNote.canDelete, canCreate: updatedSharedNote.canCreate }
          : sn
      ));
      
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
  }, [fetchSharedWithMe, fetchSharedByMe, fetchGroupSharedNotes, setSharedWithMe, setSharedByMe, setGroupSharedNotes]);
};
