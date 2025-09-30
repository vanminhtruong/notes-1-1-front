import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import toast from 'react-hot-toast';
import { fetchNotes, fetchNoteStats, createNote, deleteNote, archiveNote, setFilters, updateNote, ackReminder } from '@/store/slices/notesSlice';
import { socketService } from '@/services/socketService';
import { useTranslation } from 'react-i18next';
import { startReminderRinging, stopReminderRinging } from '@/utils/notificationSound';

export type Priority = 'low' | 'medium' | 'high';

export const useDashboard = () => {
  const { t, i18n } = useTranslation('dashboard');

  // Local UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    imageUrl: '' as string,
    category: 'general',
    priority: 'medium' as Priority,
    reminderAtLocal: '', // YYYY-MM-DDTHH:mm for input type="datetime-local"
    sharedFromUserId: undefined as number | undefined,
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editNote, setEditNote] = useState({
    id: 0,
    title: '',
    content: '',
    imageUrl: '' as string,
    category: 'general',
    priority: 'medium' as Priority,
    reminderAtLocal: '',
  });

  // View note modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewNote, setViewNote] = useState<any | null>(null);

  // Removed dashboard-level create permissions UI/state; this logic lives in SharedNoteCard only.

  const dispatch = useAppDispatch();
  const { notes, isLoading, stats, dueReminderNoteIds } = useAppSelector((state) => state.notes);

  // Continuous ringing while any due reminders exist; vibrate on new arrivals
  const prevDueCount = useRef(0);
  useEffect(() => {
    if (dueReminderNoteIds.length > 0) {
      // Start continuous ringing every 3s (plays immediately and then repeats)
      startReminderRinging(3000);
      // Vibrate only when count increases (new reminder comes in)
      if (dueReminderNoteIds.length > prevDueCount.current) {
        try {
          (window.navigator as any).vibrate?.(150);
        } catch {}
      }
    } else {
      // No due reminders => stop ringing
      stopReminderRinging();
    }
    prevDueCount.current = dueReminderNoteIds.length;
  }, [dueReminderNoteIds]);

  // If audio was blocked, start continuous ringing once audio gets unlocked
  useEffect(() => {
    const onUnlocked = () => {
      if (dueReminderNoteIds.length > 0) startReminderRinging(3000);
    };
    window.addEventListener('audio-unlocked', onUnlocked);
    return () => window.removeEventListener('audio-unlocked', onUnlocked);
  }, [dueReminderNoteIds]);

  // Stop ringing on unmount just in case
  useEffect(() => () => stopReminderRinging(), []);

  // Sync filters + fetch notes and stats
  useEffect(() => {
    dispatch(setFilters({
      search: searchTerm,
      category: selectedCategory,
      priority: selectedPriority,
      isArchived: showArchived,
    }));

    dispatch(fetchNotes({
      search: searchTerm,
      category: selectedCategory || undefined,
      priority: selectedPriority || undefined,
      isArchived: showArchived,
    }));
    dispatch(fetchNoteStats());
  }, [dispatch, searchTerm, selectedCategory, selectedPriority, showArchived]);

  // Socket lifecycle
  useEffect(() => {
    socketService.connect();
    return () => {
      socketService.disconnect();
    };
  }, []);

  // Removed: load create permissions for dashboard buttons

  // Date helpers
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

  const localInputToIso = (local: string | undefined) => {
    if (!local) return undefined;
    const date = new Date(local);
    if (isNaN(date.getTime())) return undefined;
    return date.toISOString();
  };

  const handleCreateNote = async () => {
    if (!newNote.title.trim()) return;
    await dispatch(createNote({
      title: newNote.title,
      content: newNote.content || undefined,
      imageUrl: newNote.imageUrl ? newNote.imageUrl : undefined,
      category: newNote.category,
      priority: newNote.priority,
      reminderAt: localInputToIso(newNote.reminderAtLocal),
      sharedFromUserId: newNote.sharedFromUserId,
    }));
    setNewNote({ title: '', content: '', imageUrl: '', category: 'general', priority: 'medium', reminderAtLocal: '', sharedFromUserId: undefined });
    setShowCreateModal(false);
    dispatch(fetchNotes({
      search: searchTerm,
      category: selectedCategory || undefined,
      priority: selectedPriority || undefined,
      isArchived: showArchived,
    }));
  };

  const handleDeleteNote = async (id: number) => {
    await dispatch(deleteNote(id));
    dispatch(fetchNotes({
      search: searchTerm,
      category: selectedCategory || undefined,
      priority: selectedPriority || undefined,
      isArchived: showArchived,
    }));
  };

  const confirmDeleteNote = (id: number) => {
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
  };

  const handleArchiveNote = async (id: number) => {
    await dispatch(archiveNote(id));
    dispatch(fetchNotes({
      search: searchTerm,
      category: selectedCategory || undefined,
      priority: selectedPriority || undefined,
      isArchived: showArchived,
    }));
  };

  const openEdit = (note: any) => {
    setEditNote({
      id: note.id,
      title: note.title || '',
      content: note.content || '',
      imageUrl: note.imageUrl || '',
      category: note.category || 'general',
      priority: (note.priority as Priority) || 'medium',
      reminderAtLocal: isoToLocalInput(note.reminderAt),
    });
    setShowEditModal(true);
  };

  const openView = (note: any) => {
    setViewNote(note);
    setShowViewModal(true);
  };

  const handleUpdateNote = async () => {
    if (!editNote.title.trim()) return;
    await dispatch(updateNote({
      id: editNote.id,
      data: {
        title: editNote.title,
        content: editNote.content,
        imageUrl: editNote.imageUrl ? editNote.imageUrl : null,
        category: editNote.category,
        priority: editNote.priority,
        reminderAt: editNote.reminderAtLocal ? localInputToIso(editNote.reminderAtLocal) ?? null : null,
      },
    }));
    setShowEditModal(false);
    dispatch(fetchNotes({
      search: searchTerm,
      category: selectedCategory || undefined,
      priority: selectedPriority || undefined,
      isArchived: showArchived,
    }));
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const clearSelection = () => setSelectedIds([]);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    await Promise.all(selectedIds.map((id) => dispatch(deleteNote(id))));
    setSelectedIds([]);
    dispatch(fetchNotes({
      search: searchTerm,
      category: selectedCategory || undefined,
      priority: selectedPriority || undefined,
      isArchived: showArchived,
    }));
  };

  const confirmBulkDelete = () => {
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
  };

  const getPriorityColor = (priority: string) => {
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
  };

  const getPriorityText = (priority: string) => {
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
  };

  return {
    // i18n
    t,
    i18n,

    // data
    notes,
    isLoading,
    stats,
    dueReminderNoteIds,

    // filters & view
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedPriority,
    setSelectedPriority,
    showArchived,
    setShowArchived,

    // create modal
    showCreateModal,
    setShowCreateModal,
    newNote,
    setNewNote,
    handleCreateNote,

    // selection
    selectedIds,
    toggleSelect,
    clearSelection,
    confirmBulkDelete,

    // edit modal
    showEditModal,
    setShowEditModal,
    editNote,
    setEditNote,
    openEdit,
    handleUpdateNote,
    acknowledgeReminderNote: (id: number) => dispatch(ackReminder(id)),

    // view modal
    showViewModal,
    setShowViewModal,
    viewNote,
    openView,

    // actions
    confirmDeleteNote,
    handleArchiveNote,

    // helpers
    getPriorityColor,
    getPriorityText,

    // create permissions removed from dashboard scope
  };
};
