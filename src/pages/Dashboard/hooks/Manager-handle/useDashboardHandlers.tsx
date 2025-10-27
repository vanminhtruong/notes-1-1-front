import React, { useCallback } from 'react';
import { useAppDispatch } from '@/store';
import toast from 'react-hot-toast';
import { createNote, deleteNote, archiveNote, updateNote, ackReminder } from '@/store/slices/notesSlice';
import { useTranslation } from 'react-i18next';
import type { Priority } from '../Interface/types';
import type { NoteCategory } from '@/services/notesService';

interface UseDashboardHandlersProps {
  newNote: {
    title: string;
    content: string;
    imageUrl: string;
    videoUrl: string;
    youtubeUrl: string;
    categoryId: number | undefined;
    priority: Priority;
    reminderAtLocal: string;
    sharedFromUserId: number | undefined;
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
  setShowCreateModal: (value: boolean) => void;
  setNewNote: (value: any) => void;
  setShowEditModal: (value: boolean) => void;
  setEditNote: (value: any) => void;
  setShowViewModal: (value: boolean) => void;
  setViewNote: (value: any) => void;
  setCategories: React.Dispatch<React.SetStateAction<NoteCategory[]>>;
  moveToFront: (arr: NoteCategory[], id?: number) => NoteCategory[];
  selectedIds: number[];
  setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>;
}

export const useDashboardHandlers = ({
  newNote,
  editNote,
  setShowCreateModal,
  setNewNote,
  setShowEditModal,
  setEditNote,
  setShowViewModal,
  setViewNote,
  setCategories,
  moveToFront,
  selectedIds,
  setSelectedIds,
}: UseDashboardHandlersProps) => {
  const { t } = useTranslation('dashboard');
  const dispatch = useAppDispatch();

  const localInputToIso = useCallback((local: string | undefined) => {
    if (!local) return undefined;
    const date = new Date(local);
    if (isNaN(date.getTime())) return undefined;
    return date.toISOString();
  }, []);

  const isoToLocalInput = useCallback((iso?: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
  }, []);

  const handleCreateNote = useCallback(async () => {
    if (!newNote.title.trim()) return;
    
    // Close modal immediately for better UX
    setShowCreateModal(false);
    // Optimistic: đưa category đã chọn lên đầu ngay
    if (newNote.categoryId) {
      setCategories(prev => moveToFront(prev, newNote.categoryId as number));
    }
    setNewNote({ title: '', content: '', imageUrl: '', videoUrl: '', youtubeUrl: '', categoryId: undefined, priority: 'medium', reminderAtLocal: '', sharedFromUserId: undefined });
    
    // Create note in background
    dispatch(createNote({
      title: newNote.title,
      content: newNote.content || undefined,
      imageUrl: newNote.imageUrl ? newNote.imageUrl : undefined,
      videoUrl: newNote.videoUrl ? newNote.videoUrl : undefined,
      youtubeUrl: newNote.youtubeUrl ? newNote.youtubeUrl : undefined,
      categoryId: newNote.categoryId,
      priority: newNote.priority,
      reminderAt: localInputToIso(newNote.reminderAtLocal),
      sharedFromUserId: newNote.sharedFromUserId,
    }));
    
    // No need to fetchNotes - socket event 'note_created' will auto-add the note to the list
  }, [newNote, dispatch, localInputToIso, setShowCreateModal, setCategories, moveToFront, setNewNote]);

  const handleDeleteNote = useCallback(async (id: number) => {
    // Delete note in background
    dispatch(deleteNote(id));
    
    // No need to fetchNotes - socket event 'note_deleted' will auto-remove the note from list
  }, [dispatch]);

  const confirmDeleteNote = useCallback((id: number) => {
    const tId = toast.custom((toastData) => {
      const containerClass = `max-w-sm w-full rounded-xl shadow-lg border ${toastData.visible ? 'animate-enter' : 'animate-leave'} bg-white/90 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 p-4`;
      return React.createElement(
        'div',
        { className: containerClass },
        React.createElement(
          'div',
          { className: 'flex items-start gap-3' },
          React.createElement(
            'div',
            { className: 'flex-1' },
            React.createElement('p', { className: 'font-semibold' }, t('modals.confirm.deleteTitle')),
            React.createElement('p', { className: 'text-sm text-gray-600 dark:text-gray-300' }, t('modals.confirm.irreversible'))
          )
        ),
        React.createElement(
          'div',
          { className: 'mt-3 flex justify-end gap-2' },
          React.createElement(
            'button',
            {
              onClick: () => toast.dismiss(toastData.id),
              className: 'px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm',
            },
            t('actions.cancel')
          ),
          React.createElement(
            'button',
            {
              onClick: async () => {
                await handleDeleteNote(id);
                toast.dismiss(toastData.id);
              },
              className: 'px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm',
            },
            t('actions.delete')
          )
        )
      );
    }, { duration: 8000 });
    return tId;
  }, [handleDeleteNote, t]);

  const handleArchiveNote = useCallback(async (id: number) => {
    const result = await dispatch(archiveNote(id));
    // No need to fetchNotes - socket event 'note_archived' will auto-update the list
    
    // Show success toast
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(t('toasts.archiveSuccess'), {
        duration: 3000,
        className: 'dark:bg-gray-800 dark:text-white',
      });
    }
  }, [dispatch, t]);

  const confirmArchiveNote = useCallback((id: number) => {
    const tId = toast.custom((toastData) => {
      const containerClass = `max-w-sm w-full rounded-xl shadow-lg border ${toastData.visible ? 'animate-enter' : 'animate-leave'} bg-white/90 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 p-4`;
      return React.createElement(
        'div',
        { className: containerClass },
        React.createElement(
          'div',
          { className: 'flex items-start gap-3' },
          React.createElement(
            'div',
            { className: 'flex-1' },
            React.createElement('p', { className: 'font-semibold' }, t('modals.confirm.archiveTitle')),
            React.createElement('p', { className: 'text-sm text-gray-600 dark:text-gray-300' }, t('modals.confirm.archiveMessage'))
          )
        ),
        React.createElement(
          'div',
          { className: 'mt-3 flex justify-end gap-2' },
          React.createElement(
            'button',
            {
              onClick: () => toast.dismiss(toastData.id),
              className: 'px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm',
            },
            t('actions.cancel')
          ),
          React.createElement(
            'button',
            {
              onClick: async () => {
                await handleArchiveNote(id);
                toast.dismiss(toastData.id);
              },
              className: 'px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm',
            },
            t('actions.archive')
          )
        )
      );
    }, { duration: 8000 });
    return tId;
  }, [handleArchiveNote, t]);

  const openEdit = useCallback((note: any) => {
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
  }, [isoToLocalInput, setEditNote, setShowEditModal]);

  const openView = useCallback((note: any) => {
    setViewNote(note);
    setShowViewModal(true);
  }, [setViewNote, setShowViewModal]);

  const handleUpdateNote = useCallback(async () => {
    if (!editNote.title.trim()) return;
    
    // Close modal immediately for better UX
    setShowEditModal(false);
    // Optimistic: đưa category đã chọn lên đầu ngay
    if (editNote.categoryId) {
      setCategories(prev => moveToFront(prev, editNote.categoryId as number));
    }
    
    const updateData = {
      title: editNote.title,
      content: editNote.content,
      imageUrl: editNote.imageUrl?.trim() || null,
      videoUrl: editNote.videoUrl?.trim() || null,
      youtubeUrl: editNote.youtubeUrl?.trim() || null,
      categoryId: editNote.categoryId,
      priority: editNote.priority,
      reminderAt: editNote.reminderAtLocal ? localInputToIso(editNote.reminderAtLocal) ?? null : null,
    };
    
    // Update note in background
    dispatch(updateNote({
      id: editNote.id,
      data: updateData,
    }));
    
    // No need to fetchNotes - socket event 'note_updated' will auto-update the note in the list
  }, [editNote, localInputToIso, dispatch, setShowEditModal, setCategories, moveToFront]);

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev: number[]) => (prev.includes(id) ? prev.filter((x: number) => x !== id) : [...prev, id]));
  }, [setSelectedIds]);

  const clearSelection = useCallback(() => setSelectedIds([]), [setSelectedIds]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;
    await Promise.all(selectedIds.map((id) => dispatch(deleteNote(id))));
    setSelectedIds([]);
    // No need to fetchNotes - socket events will auto-remove deleted notes from list
  }, [selectedIds, dispatch, setSelectedIds]);

  const confirmBulkDelete = useCallback(() => {
    const tId = toast.custom((toastData) => {
      const containerClass = `max-w-sm w-full rounded-xl shadow-lg border ${toastData.visible ? 'animate-enter' : 'animate-leave'} bg-white/90 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 p-4`;
      return React.createElement(
        'div',
        { className: containerClass },
        React.createElement(
          'div',
          { className: 'flex items-start gap-3' },
          React.createElement(
            'div',
            { className: 'flex-1' },
            React.createElement('p', { className: 'font-semibold' }, t('modals.confirm.bulkDeleteTitle')),
            React.createElement('p', { className: 'text-sm text-gray-600 dark:text-gray-300' }, t('modals.confirm.irreversible'))
          )
        ),
        React.createElement(
          'div',
          { className: 'mt-3 flex justify-end gap-2' },
          React.createElement(
            'button',
            {
              onClick: () => toast.dismiss(toastData.id),
              className: 'px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm',
            },
            t('actions.cancel')
          ),
          React.createElement(
            'button',
            {
              onClick: async () => {
                await handleBulkDelete();
                toast.dismiss(toastData.id);
              },
              className: 'px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm',
            },
            t('actions.delete')
          )
        )
      );
    }, { duration: 8000 });
    return tId;
  }, [handleBulkDelete, t]);

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  const getPriorityText = useCallback((priority: string) => {
    switch (priority) {
      case 'high':
        return t('priority.high');
      case 'medium':
        return t('priority.medium');
      case 'low':
        return t('priority.low');
      default:
        return t('priority.medium');
    }
  }, [t]);

  const acknowledgeReminderNote = useCallback((id: number) => dispatch(ackReminder(id)), [dispatch]);

  return {
    handleCreateNote,
    handleDeleteNote,
    confirmDeleteNote,
    handleArchiveNote,
    confirmArchiveNote,
    openEdit,
    openView,
    handleUpdateNote,
    toggleSelect,
    clearSelection,
    handleBulkDelete,
    confirmBulkDelete,
    getPriorityColor,
    getPriorityText,
    acknowledgeReminderNote,
  };
};
