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
  const [folderNotesPagination, setFolderNotesPagination] = useState({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);

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
  const fetchFolderNotes = useCallback(async (folderId: number, page: number = 1) => {
    try {
      setIsFolderNotesLoading(true);
      const response = await notesService.getFolderById(folderId, { page, limit: 9 });
      setSelectedFolder(response.folder);
      setFolderNotes(response.notes);
      setFolderNotesPagination(response.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error('Fetch folder notes error:', error);
      toast.error(t('folders.loadError'));
    } finally {
      setIsFolderNotesLoading(false);
    }
  }, [t]);

  // Create folder - Tối ưu: Optimistic update
  const createFolder = useCallback(async (data: { name: string; color: string; icon: string }) => {
    // Tạo temp folder với negative ID
    const tempId = -Date.now();
    const tempFolder: NoteFolder = {
      id: tempId,
      name: data.name,
      color: data.color,
      icon: data.icon,
      isPinned: false,
      userId: 0,
      notesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistic update: Thêm vào đầu danh sách ngay
    setFolders(prev => [tempFolder, ...prev]);

    try {
      const response = await notesService.createFolder(data);
      // Replace temp folder với real folder
      setFolders(prev => 
        prev.map(f => f.id === tempId ? response.folder : f)
      );
      toast.success(t('folders.createSuccess'));
    } catch (error: any) {
      console.error('Create folder error:', error);
      // Rollback optimistic update
      setFolders(prev => prev.filter(f => f.id !== tempId));
      toast.error(error.response?.data?.message || t('folders.createError'));
      throw error;
    }
  }, [t]);

  // Update folder - Tối ưu: Optimistic update
  const updateFolder = useCallback(async (id: number, data: { name: string; color: string; icon: string }) => {
    // Lưu old data để rollback nếu lỗi
    let oldFolder: NoteFolder | undefined;
    
    // Optimistic update: Cập nhật UI ngay
    setFolders(prev => {
      oldFolder = prev.find(f => f.id === id);
      return prev.map(f => f.id === id ? { ...f, ...data } : f);
    });

    try {
      const response = await notesService.updateFolder(id, data);
      // Sync với server data
      if (response.folder) {
        setFolders(prev => prev.map(f => 
          f.id === id ? { ...f, ...response.folder } : f
        ));
      }
      toast.success(t('folders.updateSuccess'));
    } catch (error: any) {
      console.error('Update folder error:', error);
      // Rollback
      if (oldFolder) {
        setFolders(prev => prev.map(f => f.id === id ? oldFolder! : f));
      }
      toast.error(error.response?.data?.message || t('folders.updateError'));
      throw error;
    }
  }, [t]);

  // Delete folder - Tối ưu: Optimistic update
  const deleteFolder = useCallback(async (id: number) => {
    // Lưu folder để rollback
    let deletedFolder: NoteFolder | undefined;
    
    // Optimistic update: Xóa ngay
    setFolders(prev => {
      deletedFolder = prev.find(f => f.id === id);
      return prev.filter(f => f.id !== id);
    });

    try {
      await notesService.deleteFolder(id);    
      toast.success(t('folders.deleteSuccess'));
    } catch (error: any) {
      console.error('Delete folder error:', error);
      // Rollback
      if (deletedFolder) {
        setFolders(prev => [...prev, deletedFolder!]);
      }
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

  // Pin folder - Tối ưu: Optimistic update
  const pinFolder = useCallback(async (id: number) => {
    // Lưu old data để rollback nếu lỗi
    let oldFolder: NoteFolder | undefined;
    
    // Optimistic update: Cập nhật UI ngay
    setFolders(prev => {
      oldFolder = prev.find(f => f.id === id);
      return prev.map(f => f.id === id ? { ...f, isPinned: true } : f);
    });

    try {
      const response = await notesService.pinFolder(id);
      // Sync với server data
      if (response.folder) {
        setFolders(prev => prev.map(f => 
          f.id === id ? { ...f, ...response.folder } : f
        ));
      }
      // Refresh folders để lấy đúng thứ tự sắp xếp từ server
      fetchFolders();
      toast.success(t('folders.pinSuccess'));
    } catch (error: any) {
      console.error('Pin folder error:', error);
      // Rollback
      if (oldFolder) {
        setFolders(prev => prev.map(f => f.id === id ? oldFolder! : f));
      }
      toast.error(error.response?.data?.message || t('folders.pinError'));
      throw error;
    }
  }, [t, fetchFolders]);

  // Unpin folder - Tối ưu: Optimistic update
  const unpinFolder = useCallback(async (id: number) => {
    // Lưu old data để rollback nếu lỗi
    let oldFolder: NoteFolder | undefined;
    
    // Optimistic update: Cập nhật UI ngay
    setFolders(prev => {
      oldFolder = prev.find(f => f.id === id);
      return prev.map(f => f.id === id ? { ...f, isPinned: false } : f);
    });

    try {
      const response = await notesService.unpinFolder(id);
      // Sync với server data
      if (response.folder) {
        setFolders(prev => prev.map(f => 
          f.id === id ? { ...f, ...response.folder } : f
        ));
      }
      // Refresh folders để lấy đúng thứ tự sắp xếp từ server
      fetchFolders();
      toast.success(t('folders.unpinSuccess'));
    } catch (error: any) {
      console.error('Unpin folder error:', error);
      // Rollback
      if (oldFolder) {
        setFolders(prev => prev.map(f => f.id === id ? oldFolder! : f));
      }
      toast.error(error.response?.data?.message || t('folders.unpinError'));
      throw error;
    }
  }, [t, fetchFolders]);

  // Socket listeners for real-time updates
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleFolderCreated = (folder: NoteFolder) => {
      setFolders(prev => {
        // Kiểm tra duplicate
        const existingIndex = prev.findIndex(f => f.id === folder.id);
        if (existingIndex !== -1) {
          return prev;
        }
        
        // Kiểm tra temp folder (từ optimistic update)
        const tempIndex = prev.findIndex(f => 
          f.id < 0 && // Temp ID là negative
          f.name.toLowerCase() === folder.name.toLowerCase() &&
          f.color === folder.color &&
          f.icon === folder.icon
        );
        
        if (tempIndex !== -1) {
          // Replace temp với real folder (giữ vị trí ở đầu)
          return prev.map((f, idx) => idx === tempIndex ? folder : f);
        }
        
        // Thêm mới vào đầu danh sách
        return [folder, ...prev];
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
          
          // Chèn note vào đúng vị trí dựa trên isPinned
          if (note.isPinned) {
            // Note ghim -> thêm vào đầu
            return [note, ...prev];
          } else {
            // Note không ghim -> chèn sau tất cả notes ghim
            const firstUnpinnedIndex = prev.findIndex(n => !n.isPinned);
            if (firstUnpinnedIndex === -1) {
              // Tất cả notes đều ghim hoặc mảng rỗng -> thêm vào cuối
              return [...prev, note];
            } else {
              // Chèn vào vị trí đầu tiên của notes không ghim
              const newNotes = [...prev];
              newNotes.splice(firstUnpinnedIndex, 0, note);
              return newNotes;
            }
          }
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
            
            // Chèn note vào đúng vị trí dựa trên isPinned
            if (note.isPinned) {
              // Note ghim -> thêm vào đầu
              return [note, ...prev];
            } else {
              // Note không ghim -> chèn sau tất cả notes ghim
              const firstUnpinnedIndex = prev.findIndex(n => !n.isPinned);
              if (firstUnpinnedIndex === -1) {
                // Tất cả notes đều ghim hoặc mảng rỗng -> thêm vào cuối
                return [...prev, note];
              } else {
                // Chèn vào vị trí đầu tiên của notes không ghim
                const newNotes = [...prev];
                newNotes.splice(firstUnpinnedIndex, 0, note);
                return newNotes;
              }
            }
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

    const handleNotePinned = (data: { noteId: number; note: Note; isPinned: boolean }) => {
      // Update note in folder notes if viewing that folder and note is in this folder
      if (selectedFolder && (data.note as any).folderId === selectedFolder.id) {
        setFolderNotes(prev => prev.map(n => 
          n.id === data.noteId ? { ...n, isPinned: data.isPinned } : n
        ));
        // Re-fetch to get proper ordering (pinned notes first)
        fetchFolderNotes(selectedFolder.id, currentPage);
      }
    };

    const handleFolderPinned = (folder: NoteFolder) => {
      setFolders(prev => prev.map(f => f.id === folder.id ? { ...f, isPinned: true } : f));
      // Refresh folders để lấy đúng thứ tự sắp xếp từ server
      fetchFolders();
    };

    const handleFolderUnpinned = (folder: NoteFolder) => {
      setFolders(prev => prev.map(f => f.id === folder.id ? { ...f, isPinned: false } : f));
      // Refresh folders để lấy đúng thứ tự sắp xếp từ server
      fetchFolders();
    };

    socket.on('folder_created', handleFolderCreated);
    socket.on('folder_updated', handleFolderUpdated);
    socket.on('folder_deleted', handleFolderDeleted);
    socket.on('folder_pinned', handleFolderPinned);
    socket.on('folder_unpinned', handleFolderUnpinned);
    socket.on('note_moved_to_folder', handleNoteMovedToFolder);
    socket.on('note_created', handleNoteCreated);
    socket.on('note_deleted', handleNoteDeleted);
    socket.on('note_updated', handleNoteUpdated);
    socket.on('note_archived', handleNoteArchived);
    socket.on('note:pinned', handleNotePinned);
    socket.on('note:unpinned', handleNotePinned);

    return () => {
      socket.off('folder_created', handleFolderCreated);
      socket.off('folder_updated', handleFolderUpdated);
      socket.off('folder_deleted', handleFolderDeleted);
      socket.off('folder_pinned', handleFolderPinned);
      socket.off('folder_unpinned', handleFolderUnpinned);
      socket.off('note_moved_to_folder', handleNoteMovedToFolder);
      socket.off('note_created', handleNoteCreated);
      socket.off('note_deleted', handleNoteDeleted);
      socket.off('note_updated', handleNoteUpdated);
      socket.off('note_archived', handleNoteArchived);
      socket.off('note:pinned', handleNotePinned);
      socket.off('note:unpinned', handleNotePinned);
    };
  }, [selectedFolder, fetchFolders, fetchFolderNotes, currentPage]);

  // Initial fetch - REMOVED: will be lazy loaded when entering folders view
  // useEffect(() => {
  //   fetchFolders();
  // }, [fetchFolders]);

  return {
    folders,
    isLoading,
    selectedFolder,
    folderNotes,
    isFolderNotesLoading,
    folderNotesPagination,
    currentPage,
    fetchFolders,
    fetchFolderNotes,
    createFolder,
    updateFolder,
    deleteFolder,
    moveNoteToFolder,
    pinFolder,
    unpinFolder,
    setSelectedFolder,
    setCurrentPage,
  };
};
