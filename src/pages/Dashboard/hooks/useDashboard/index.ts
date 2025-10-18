import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import toast from 'react-hot-toast';
import { fetchNotes, fetchNoteStats, createNote, deleteNote, archiveNote, setFilters, updateNote, ackReminder } from '@/store/slices/notesSlice';
import { socketService } from '@/services/socketService';
import { useTranslation } from 'react-i18next';
import { startReminderRinging, stopReminderRinging } from '@/utils/notificationSound';
import { notesService, type NoteCategory } from '@/services/notesService';

export type Priority = 'low' | 'medium' | 'high';

export const useDashboard = () => {
  const { t, i18n } = useTranslation('dashboard');

  // Local UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;
  const [categories, setCategories] = useState<NoteCategory[]>([]);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    imageUrl: '' as string,
    videoUrl: '' as string,
    youtubeUrl: '' as string,
    categoryId: undefined as number | undefined,
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
    videoUrl: '' as string,
    youtubeUrl: '' as string,
    categoryId: undefined as number | undefined,
    priority: 'medium' as Priority,
    reminderAtLocal: '',
  });

  // View note modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewNote, setViewNote] = useState<any | null>(null);

  // Tag management modal state
  const [showTagManagementModal, setShowTagManagementModal] = useState(false);

  // Removed dashboard-level create permissions UI/state; this logic lives in SharedNoteCard only.

  const dispatch = useAppDispatch();
  const { notes, isLoading, stats, dueReminderNoteIds, pagination } = useAppSelector((state) => state.notes);

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

  // Reset về trang 1 khi filters thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedPriority, showArchived]);

  // Fetch stats only once on mount
  useEffect(() => {
    dispatch(fetchNoteStats());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync filters + fetch notes (without stats)
  useEffect(() => {
    dispatch(setFilters({
      search: searchTerm,
      category: selectedCategory,
      priority: selectedPriority,
      isArchived: showArchived,
    }));

    dispatch(fetchNotes({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      search: searchTerm,
      category: selectedCategory || undefined,
      priority: selectedPriority || undefined,
      isArchived: showArchived,
    }));
  }, [dispatch, searchTerm, selectedCategory, selectedPriority, showArchived, currentPage]);

  // Fetch categories function
  const loadCategories = useCallback(async () => {
    try {
      const response = await notesService.getCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  // Fetch categories only once on mount
  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Socket listeners for category real-time updates
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleCategoryCreated = (category: NoteCategory) => {
      setCategories(prev => {
        if (prev.some(c => c.id === category.id)) return prev;
        return [...prev, category];
      });
    };

    const handleCategoryUpdated = (category: NoteCategory) => {
      setCategories(prev => prev.map(c => c.id === category.id ? { ...c, ...category } : c));
    };

    const handleCategoryDeleted = (data: { id: number }) => {
      setCategories(prev => prev.filter(c => c.id !== data.id));
    };

    const handleCategoriesReorderNeeded = async () => {
      // Fetch lại danh sách categories từ backend (đã được sắp xếp)
      await loadCategories();
    };

    socket.on('category_created', handleCategoryCreated);
    socket.on('category_updated', handleCategoryUpdated);
    socket.on('category_deleted', handleCategoryDeleted);
    socket.on('categories_reorder_needed', handleCategoriesReorderNeeded);

    return () => {
      socket.off('category_created', handleCategoryCreated);
      socket.off('category_updated', handleCategoryUpdated);
      socket.off('category_deleted', handleCategoryDeleted);
      socket.off('categories_reorder_needed', handleCategoriesReorderNeeded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Removed: load create permissions for dashboard buttons

  // Date helpers
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

  const localInputToIso = useCallback((local: string | undefined) => {
    if (!local) return undefined;
    const date = new Date(local);
    if (isNaN(date.getTime())) return undefined;
    return date.toISOString();
  }, []);

  const handleCreateNote = useCallback(async () => {
    if (!newNote.title.trim()) return;
    
    // Close modal immediately for better UX
    setShowCreateModal(false);
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
  }, [newNote, dispatch, localInputToIso]);

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
    dispatch(fetchNotes({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      search: searchTerm,
      category: selectedCategory || undefined,
      priority: selectedPriority || undefined,
      isArchived: showArchived,
    }));
    
    // Show success toast
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(t('toasts.archiveSuccess'), {
        duration: 3000,
        className: 'dark:bg-gray-800 dark:text-white',
      });
    }
  }, [dispatch, currentPage, searchTerm, selectedCategory, selectedPriority, showArchived, t]);

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
  }, [isoToLocalInput]);

  const openView = useCallback((note: any) => {
    setViewNote(note);
    setShowViewModal(true);
  }, []);

  const handleUpdateNote = useCallback(async () => {
    if (!editNote.title.trim()) return;
    
    // Close modal immediately for better UX
    setShowEditModal(false);
    
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
  }, [editNote, localInputToIso, dispatch]);

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;
    await Promise.all(selectedIds.map((id) => dispatch(deleteNote(id))));
    setSelectedIds([]);
    dispatch(fetchNotes({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      search: searchTerm,
      category: selectedCategory || undefined,
      priority: selectedPriority || undefined,
      isArchived: showArchived,
    }));
  }, [selectedIds, dispatch, currentPage, searchTerm, selectedCategory, selectedPriority, showArchived]);

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

  return {
    // i18n
    t,
    i18n,

    // data
    notes,
    isLoading,
    stats,
    dueReminderNoteIds,
    pagination,

    // filters & view
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedPriority,
    setSelectedPriority,
    showArchived,
    setShowArchived,
    currentPage,
    setCurrentPage,

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
    acknowledgeReminderNote: useCallback((id: number) => dispatch(ackReminder(id)), [dispatch]),

    // view modal
    showViewModal,
    setShowViewModal,
    viewNote,
    openView,

    // actions
    confirmDeleteNote,
    confirmArchiveNote,

    // helpers
    getPriorityColor,
    getPriorityText,

    // categories
    categories,

    // tag management
    showTagManagementModal,
    setShowTagManagementModal,

    // create permissions removed from dashboard scope
  };
};
