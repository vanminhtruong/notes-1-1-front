import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { notesService, type NoteFolder, type Note } from '@/services/notesService';
import { toast } from 'react-hot-toast';
import { socketService } from '@/services/socketService';

export const useFolders = () => {
  const { t } = useTranslation('dashboard');
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<NoteFolder | null>(null);
  const [folderNotes, setFolderNotes] = useState<Note[]>([]);
  const [isFolderNotesLoading, setIsFolderNotesLoading] = useState(false);

  // Fetch all folders
  const fetchFolders = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await notesService.getFolders();
      setFolders(response.folders);
    } catch (error) {
      console.error('Fetch folders error:', error);
      toast.error(t('folders.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  // Fetch folder with notes
  const fetchFolderNotes = useCallback(async (folderId: number) => {
    try {
      setIsFolderNotesLoading(true);
      const response = await notesService.getFolderById(folderId);
      setSelectedFolder(response.folder);
      setFolderNotes(response.notes);
    } catch (error) {
      console.error('Fetch folder notes error:', error);
      toast.error(t('folders.loadError'));
    } finally {
      setIsFolderNotesLoading(false);
    }
  }, [t]);

  // Create folder
  const createFolder = useCallback(async (data: { name: string; color: string; icon: string }) => {
    try {
      await notesService.createFolder(data);
      // Don't add here - socket listener will handle it to avoid duplicates
      
      toast.success(t('folders.createSuccess'));
    } catch (error: any) {
      console.error('Create folder error:', error);
      toast.error(error.response?.data?.message || t('folders.createError'));
      throw error;
    }
  }, [t]);

  // Update folder
  const updateFolder = useCallback(async (id: number, data: { name: string; color: string; icon: string }) => {
    try {
      await notesService.updateFolder(id, data);
      // Socket listener will handle it to avoid duplicates
      
      toast.success(t('folders.updateSuccess'));
    } catch (error: any) {
      console.error('Update folder error:', error);
      toast.error(error.response?.data?.message || t('folders.updateError'));
      throw error;
    }
  }, [t]);

  // Delete folder
  const deleteFolder = useCallback(async (id: number) => {
    try {
      await notesService.deleteFolder(id);    
      toast.success(t('folders.deleteSuccess'));
    } catch (error: any) {
      console.error('Delete folder error:', error);
      toast.error(error.response?.data?.message || t('folders.deleteError'));
      throw error;
    }
  }, [t]);

  // Move note to folder
  const moveNoteToFolder = useCallback(async (noteId: number, folderId: number | null) => {
    try {
      await notesService.moveNoteToFolder(noteId, folderId);
      // Socket listener will handle it
      
      toast.success(t('folders.moveSuccess'));
    } catch (error: any) {
      console.error('Move note to folder error:', error);
      toast.error(error.response?.data?.message || t('folders.moveError'));
      throw error;
    }
  }, [t]);

  // Socket listeners for real-time updates
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleFolderCreated = (folder: NoteFolder) => {
      setFolders(prev => {
        // Avoid duplicates
        if (prev.some(f => f.id === folder.id)) return prev;
        return [...prev, folder];
      });
    };

    const handleFolderUpdated = (folder: NoteFolder) => {
      setFolders(prev => prev.map(f => {
        if (f.id !== folder.id) return f;
        // một số payload từ socket không kèm notesCount => giữ lại giá trị cũ để tránh nhảy về 0
        const merged = { ...f, ...folder } as NoteFolder & { notesCount?: number };
        if (typeof (folder as any).notesCount === 'undefined' && typeof (f as any).notesCount !== 'undefined') {
          (merged as any).notesCount = (f as any).notesCount;
        }
        return merged as NoteFolder;
      }));
      // Also update selected folder if it's being viewed
      if (selectedFolder?.id === folder.id) {
        const mergedSelected = { ...selectedFolder, ...folder } as NoteFolder & { notesCount?: number };
        if (typeof (folder as any).notesCount === 'undefined' && typeof (selectedFolder as any).notesCount !== 'undefined') {
          (mergedSelected as any).notesCount = (selectedFolder as any).notesCount;
        }
        setSelectedFolder(mergedSelected as NoteFolder);
      }
    };

    const handleFolderDeleted = (data: { id: number }) => {
      setFolders(prev => prev.filter(f => f.id !== data.id));
      // Also clear selected folder if it's being viewed
      if (selectedFolder?.id === data.id) {
        setSelectedFolder(null);
        setFolderNotes([]);
      }
    };

    const handleNoteMovedToFolder = (note: Note & { folderId?: number }) => {
      // Refresh folder notes if viewing the affected folder
      if (selectedFolder && note.folderId === selectedFolder.id) {
        setFolderNotes(prev => {
          // Avoid duplicates
          if (prev.some(n => n.id === note.id)) return prev;
          return [...prev, note];
        });
      }
      // Refresh folders list to update count
      fetchFolders();
    };

    const handleNoteCreated = (note: Note & { folderId?: number }) => {
      // If note has folderId, refresh folders to update count
      if (note.folderId) {
        fetchFolders();
        // Add to folder notes if viewing that folder
        if (selectedFolder && note.folderId === selectedFolder.id) {
          setFolderNotes(prev => {
            if (prev.some(n => n.id === note.id)) return prev;
            return [...prev, note];
          });
        }
      }
    };

    const handleNoteDeleted = (data: { id: number; folderId?: number }) => {
      // If deleted note was in a folder, refresh folders to update count
      if (data.folderId) {
        fetchFolders();
        // Remove from folder notes if viewing that folder
        if (selectedFolder && data.folderId === selectedFolder.id) {
          setFolderNotes(prev => prev.filter(n => n.id !== data.id));
        }
      }
    };

    const handleNoteUpdated = (note: Note & { folderId?: number }) => {
      // Update note in folder notes if viewing that folder
      if (selectedFolder && note.folderId === selectedFolder.id) {
        setFolderNotes(prev => prev.map(n => n.id === note.id ? note : n));
      }
    };

    const handleNoteArchived = (data: { id: number; isArchived: boolean; folderId?: number }) => {
      // If archived/unarchived note was in a folder, refresh folders to update count
      if (data.folderId) {
        fetchFolders();
        // Remove from folder notes if viewing that folder (archived notes don't show in folder view)
        if (selectedFolder && data.folderId === selectedFolder.id) {
          setFolderNotes(prev => prev.filter(n => n.id !== data.id));
        }
      }
    };

    socket.on('folder_created', handleFolderCreated);
    socket.on('folder_updated', handleFolderUpdated);
    socket.on('folder_deleted', handleFolderDeleted);
    socket.on('note_moved_to_folder', handleNoteMovedToFolder);
    socket.on('note_created', handleNoteCreated);
    socket.on('note_deleted', handleNoteDeleted);
    socket.on('note_updated', handleNoteUpdated);
    socket.on('note_archived', handleNoteArchived);

    return () => {
      socket.off('folder_created', handleFolderCreated);
      socket.off('folder_updated', handleFolderUpdated);
      socket.off('folder_deleted', handleFolderDeleted);
      socket.off('note_moved_to_folder', handleNoteMovedToFolder);
      socket.off('note_created', handleNoteCreated);
      socket.off('note_deleted', handleNoteDeleted);
      socket.off('note_updated', handleNoteUpdated);
      socket.off('note_archived', handleNoteArchived);
    };
  }, [selectedFolder, fetchFolders]);

  // Initial fetch
  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  return {
    folders,
    isLoading,
    selectedFolder,
    folderNotes,
    isFolderNotesLoading,
    fetchFolders,
    fetchFolderNotes,
    createFolder,
    updateFolder,
    deleteFolder,
    moveNoteToFolder,
    setSelectedFolder,
  };
};
