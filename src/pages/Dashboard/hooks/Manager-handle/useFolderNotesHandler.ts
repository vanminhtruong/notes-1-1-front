import { useCallback } from 'react';
import { notesService, type NoteCategory } from '@/services/notesService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import type { Priority } from '../Manager-useState/useFolderNotesState';

interface UseFolderNotesHandlerProps {
  folderId: number | null;
  newNote: {
    title: string;
    content: string;
    imageUrl: string;
    videoUrl: string;
    youtubeUrl: string;
    categoryId: number | undefined;
    priority: Priority;
    reminderAtLocal: string;
  };
  editNote: {
    id: number;
    title: string;
    content: string;
    imageUrl: string;
    videoUrl: string;
    youtubeUrl: string;
    categoryId: number | undefined;
    priority: Priority;
    reminderAtLocal: string;
  };
  setShowCreateModal: (show: boolean) => void;
  setNewNote: React.Dispatch<React.SetStateAction<any>>;
  setShowEditModal: (show: boolean) => void;
  setEditNote: React.Dispatch<React.SetStateAction<any>>;
  onSuccess: () => void;
}

export const useFolderNotesHandler = ({
  folderId,
  newNote,
  editNote,
  setShowCreateModal,
  setNewNote,
  setShowEditModal,
  setEditNote,
  onSuccess,
}: UseFolderNotesHandlerProps) => {
  const { t } = useTranslation('dashboard');

  const handleOpenCreateModal = useCallback(() => setShowCreateModal(true), [setShowCreateModal]);
  
  const handleCloseCreateModal = useCallback(() => {
    setShowCreateModal(false);
    setNewNote({
      title: '',
      content: '',
      imageUrl: '',
      videoUrl: '',
      youtubeUrl: '',
      categoryId: undefined,
      priority: 'medium',
      reminderAtLocal: '',
    });
  }, [setShowCreateModal, setNewNote]);

  const handleOpenEditModal = useCallback((note: any) => {
    const isoToLocalInput = (iso?: string | null) => {
      if (!iso) return '';
      const d = new Date(iso);
      const pad = (n: number) => String(n).padStart(2, '0');
      const yyyy = d.getFullYear();
      const MM = pad(d.getMonth() + 1);
      const dd = pad(d.getDate());
      const hh = pad(d.getHours());
      const mm = pad(d.getMinutes());
      return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
    };

    setEditNote({
      id: note.id,
      title: note.title || '',
      content: note.content || '',
      imageUrl: note.imageUrl || '',
      videoUrl: note.videoUrl || '',
      youtubeUrl: note.youtubeUrl || '',
      categoryId: note.categoryId || undefined,
      priority: (note.priority as Priority) || 'medium',
      reminderAtLocal: isoToLocalInput(note.reminderAt),
    });
    setShowEditModal(true);
  }, [setEditNote, setShowEditModal]);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditNote({
      id: 0,
      title: '',
      content: '',
      imageUrl: '',
      videoUrl: '',
      youtubeUrl: '',
      categoryId: undefined,
      priority: 'medium',
      reminderAtLocal: '',
    });
  }, [setShowEditModal, setEditNote]);

  const handleCreateNote = useCallback(async () => {
    if (!newNote.title.trim() || !folderId) return;

    const localInputToIso = (local: string | undefined) => {
      if (!local) return undefined;
      const date = new Date(local);
      if (isNaN(date.getTime())) return undefined;
      return date.toISOString();
    };

    try {
      await notesService.createNote({
        title: newNote.title,
        content: newNote.content || undefined,
        imageUrl: newNote.imageUrl || undefined,
        videoUrl: newNote.videoUrl || undefined,
        youtubeUrl: newNote.youtubeUrl || undefined,
        categoryId: newNote.categoryId,
        priority: newNote.priority,
        reminderAt: localInputToIso(newNote.reminderAtLocal),
      } as any);
      toast.success(t('toasts.createNoteSuccess'));
      handleCloseCreateModal();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || t('toasts.createNoteError'));
    }
  }, [newNote, folderId, t, handleCloseCreateModal, onSuccess]);

  const handleUpdateNote = useCallback(async () => {
    if (!editNote.title.trim()) return;

    const localInputToIso = (local: string | undefined) => {
      if (!local) return undefined;
      const date = new Date(local);
      if (isNaN(date.getTime())) return undefined;
      return date.toISOString();
    };

    try {
      await notesService.updateNote(editNote.id, {
        title: editNote.title,
        content: editNote.content,
        imageUrl: editNote.imageUrl?.trim() || null,
        videoUrl: editNote.videoUrl?.trim() || null,
        youtubeUrl: editNote.youtubeUrl?.trim() || null,
        categoryId: editNote.categoryId,
        priority: editNote.priority,
        reminderAt: editNote.reminderAtLocal ? localInputToIso(editNote.reminderAtLocal) ?? null : null,
      });
      toast.success(t('toasts.updateNoteSuccess'));
      handleCloseEditModal();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || t('toasts.updateNoteError'));
    }
  }, [editNote, t, handleCloseEditModal, onSuccess]);

  return {
    handleOpenCreateModal,
    handleCloseCreateModal,
    handleOpenEditModal,
    handleCloseEditModal,
    handleCreateNote,
    handleUpdateNote,
  };
};
