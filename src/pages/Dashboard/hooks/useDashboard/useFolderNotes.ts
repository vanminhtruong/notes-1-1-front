import { useState, useCallback, useEffect } from 'react';
import { notesService, type NoteCategory } from '@/services/notesService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { socketService } from '@/services/socketService';

export type Priority = 'low' | 'medium' | 'high';

interface NewNote {
  title: string;
  content: string;
  imageUrl: string;
  videoUrl: string;
  youtubeUrl: string;
  categoryId: number | undefined;
  priority: Priority;
  reminderAtLocal: string;
  folderId: number;
}

interface EditNote {
  id: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  youtubeUrl?: string | null;
  categoryId: number | undefined;
  priority: Priority;
  reminderAtLocal: string;
}

export const useFolderNotes = (folderId: number | null, onRefreshFolder: () => void) => {
  const { t } = useTranslation('dashboard');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categories, setCategories] = useState<NoteCategory[]>([]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await notesService.getCategories({ sortBy: 'maxSelectionCount', sortOrder: 'DESC' });
      setCategories(response.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  const [newNote, setNewNote] = useState<NewNote>({
    title: '',
    content: '',
    imageUrl: '',
    videoUrl: '',
    youtubeUrl: '',
    categoryId: undefined,
    priority: 'medium' as Priority,
    reminderAtLocal: '',
    folderId: folderId || 0,
  });

  const [editNote, setEditNote] = useState<EditNote | null>(null);

  // Fetch categories
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Realtime: refresh categories when backend signals reorder/changes
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const refresh = () => {
      loadCategories();
    };

    socket.on('categories_reorder_needed', refresh);
    socket.on('category_created', refresh);
    socket.on('category_updated', refresh);
    socket.on('category_deleted', refresh);

    return () => {
      socket.off('categories_reorder_needed', refresh);
      socket.off('category_created', refresh);
      socket.off('category_updated', refresh);
      socket.off('category_deleted', refresh);
    };
  }, [loadCategories]);

  // UX: đưa category vừa chọn lên đầu danh sách ngay lập tức
  const moveToFront = useCallback((arr: NoteCategory[], id?: number) => {
    if (!id) return arr;
    const idx = arr.findIndex(c => c.id === id);
    if (idx <= 0) return arr;
    const copy = arr.slice();
    const [item] = copy.splice(idx, 1);
    return [item, ...copy];
  }, []);

  useEffect(() => {
    if (newNote.categoryId) {
      setCategories(prev => moveToFront(prev, newNote.categoryId as number));
    }
  }, [newNote.categoryId, moveToFront]);

  useEffect(() => {
    if (editNote?.categoryId) {
      setCategories(prev => moveToFront(prev, editNote.categoryId as number));
    }
  }, [editNote?.categoryId, moveToFront]);

  // Open create modal
  const handleOpenCreateModal = useCallback(() => {
    if (!folderId) return;
    setNewNote({
      title: '',
      content: '',
      imageUrl: '',
      videoUrl: '',
      youtubeUrl: '',
      categoryId: undefined,
      priority: 'medium' as Priority,
      reminderAtLocal: '',
      folderId: folderId,
    });
    setShowCreateModal(true);
  }, [folderId]);

  // Close create modal
  const handleCloseCreateModal = useCallback(() => {
    setShowCreateModal(false);
  }, []);

  // Create note
  const handleCreateNote = useCallback(async () => {
    if (!newNote.title.trim()) {
      toast.error(t('modals.create.fields.titlePlaceholder'));
      return;
    }

    try {
      // Close modal immediately for better UX
      setShowCreateModal(false);
      // Optimistic: đưa category đã chọn lên đầu ngay
      if (newNote.categoryId) {
        setCategories(prev => moveToFront(prev, newNote.categoryId as number));
      }
      
      const reminderAt = newNote.reminderAtLocal
        ? new Date(newNote.reminderAtLocal).toISOString()
        : null;

      const payload = {
        title: newNote.title,
        content: newNote.content,
        imageUrl: newNote.imageUrl || null,
        videoUrl: newNote.videoUrl || null,
        youtubeUrl: newNote.youtubeUrl || null,
        categoryId: newNote.categoryId,
        priority: newNote.priority,
        reminderAt: reminderAt,
        folderId: newNote.folderId,
      };

      await notesService.createNote(payload);
      
      toast.success(t('toasts.noteCreated'));
      
      // Socket event 'note_created' will auto-add the note to folder
      // Only refresh if needed for pagination/sorting
      onRefreshFolder();
    } catch (error: any) {
      console.error('Create note error:', error);
      toast.error(error.response?.data?.message || t('toasts.noteCreateFailed'));
    }
  }, [newNote, t, onRefreshFolder]);

  // Open edit modal
  const handleOpenEditModal = useCallback((note: any) => {
    const reminderAtLocal = note.reminderAt
      ? new Date(note.reminderAt).toISOString().slice(0, 16)
      : '';

    setEditNote({
      id: note.id,
      title: note.title,
      content: note.content || '',
      imageUrl: note.imageUrl || '',
      videoUrl: note.videoUrl || '',
      youtubeUrl: note.youtubeUrl || '',
      categoryId: note.categoryId || undefined,
      priority: note.priority || 'medium',
      reminderAtLocal: reminderAtLocal,
    });
    setShowEditModal(true);
  }, []);

  // Close edit modal
  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditNote(null);
  }, []);

  // Update note
  const handleUpdateNote = useCallback(async () => {
    if (!editNote || !editNote.title.trim()) {
      toast.error(t('modals.create.fields.titlePlaceholder'));
      return;
    }

    try {
      // Close modal immediately for better UX
      setShowEditModal(false);
      setEditNote(null);
      // Optimistic: đưa category đã chọn lên đầu ngay
      if (editNote.categoryId) {
        setCategories(prev => moveToFront(prev, editNote.categoryId as number));
      }
      
      const reminderAt = editNote.reminderAtLocal
        ? new Date(editNote.reminderAtLocal).toISOString()
        : null;

      const payload = {
        title: editNote.title,
        content: editNote.content,
        imageUrl: editNote.imageUrl || null,
        videoUrl: editNote.videoUrl || null,
        youtubeUrl: editNote.youtubeUrl || null,
        categoryId: editNote.categoryId,
        priority: editNote.priority,
        reminderAt: reminderAt,
      };

      await notesService.updateNote(editNote.id, payload);
      
      toast.success(t('toasts.noteUpdated'));
      
      // Socket event 'note_updated' will auto-update the note in folder
      // Only refresh if needed for re-sorting
      onRefreshFolder();
    } catch (error: any) {
      console.error('Update note error:', error);
      toast.error(error.response?.data?.message || t('toasts.noteUpdateFailed'));
    }
  }, [editNote, t, onRefreshFolder]);

  return {
    // Create modal
    showCreateModal,
    newNote,
    setNewNote,
    handleOpenCreateModal,
    handleCloseCreateModal,
    handleCreateNote,

    // Edit modal
    showEditModal,
    editNote,
    setEditNote,
    handleOpenEditModal,
    handleCloseEditModal,
    handleUpdateNote,

    // Categories
    categories,
  };
};
