import { useState } from 'react';
import { useAppSelector } from '@/store';
import type { NoteCategory } from '@/services/notesService';
import type { Priority } from '../Interface/types';

export const useDashboardState = () => {
  // Local UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<NoteCategory[]>([]);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    imageUrl: '' as string,
    videoUrl: '' as string,
    youtubeUrl: '' as string,
    categoryId: undefined as number | undefined,
    priority: 'medium' as 'low' | 'medium' | 'high',
    reminderAtLocal: '', // YYYY-MM-DDTHH:mm for input type="datetime-local"
    sharedFromUserId: undefined as number | undefined,
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
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

  // Redux state
  const { notes, isLoading, stats, dueReminderNoteIds, pagination } = useAppSelector((state) => state.notes);

  return {
    // Local states
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
    categories,
    setCategories,
    newNote,
    setNewNote,
    selectedIds,
    setSelectedIds,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    editNote,
    setEditNote,
    showViewModal,
    setShowViewModal,
    viewNote,
    setViewNote,
    showTagManagementModal,
    setShowTagManagementModal,

    // Redux states
    notes,
    isLoading,
    stats,
    dueReminderNoteIds,
    pagination,
  };
};
