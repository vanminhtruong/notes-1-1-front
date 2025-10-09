import { useState, useCallback } from 'react';
import { notesService } from '@/services/notesService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export type Priority = 'low' | 'medium' | 'high';

interface NewNote {
  title: string;
  content: string;
  imageUrl: string;
  videoUrl: string;
  youtubeUrl: string;
  category: string;
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
  category: string;
  priority: Priority;
  reminderAtLocal: string;
}

export const useFolderNotes = (folderId: number | null, onRefreshFolder: () => void) => {
  const { t } = useTranslation('dashboard');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newNote, setNewNote] = useState<NewNote>({
    title: '',
    content: '',
    imageUrl: '',
    videoUrl: '',
    youtubeUrl: '',
    category: 'general',
    priority: 'medium' as Priority,
    reminderAtLocal: '',
    folderId: folderId || 0,
  });

  const [editNote, setEditNote] = useState<EditNote | null>(null);

  // Open create modal
  const handleOpenCreateModal = useCallback(() => {
    if (!folderId) return;
    setNewNote({
      title: '',
      content: '',
      imageUrl: '',
      videoUrl: '',
      youtubeUrl: '',
      category: 'general',
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
      const reminderAt = newNote.reminderAtLocal
        ? new Date(newNote.reminderAtLocal).toISOString()
        : null;

      const payload = {
        title: newNote.title,
        content: newNote.content,
        imageUrl: newNote.imageUrl || null,
        videoUrl: newNote.videoUrl || null,
        youtubeUrl: newNote.youtubeUrl || null,
        category: newNote.category,
        priority: newNote.priority,
        reminderAt: reminderAt,
        folderId: newNote.folderId,
      };

      await notesService.createNote(payload);
      
      toast.success(t('toasts.noteCreated'));
      setShowCreateModal(false);
      
      // Refresh folder notes
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
      category: note.category || 'general',
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
      const reminderAt = editNote.reminderAtLocal
        ? new Date(editNote.reminderAtLocal).toISOString()
        : null;

      const payload = {
        title: editNote.title,
        content: editNote.content,
        imageUrl: editNote.imageUrl || null,
        videoUrl: editNote.videoUrl || null,
        youtubeUrl: editNote.youtubeUrl || null,
        category: editNote.category,
        priority: editNote.priority,
        reminderAt: reminderAt,
      };

      await notesService.updateNote(editNote.id, payload);
      
      toast.success(t('toasts.noteUpdated'));
      setShowEditModal(false);
      setEditNote(null);
      
      // Refresh folder notes
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
  };
};
