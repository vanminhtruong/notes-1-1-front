import { useState } from 'react';
import type { NoteCategory } from '@/services/notesService';

export type Priority = 'low' | 'medium' | 'high';

export const useFolderNotesState = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    imageUrl: '' as string,
    videoUrl: '' as string,
    youtubeUrl: '' as string,
    categoryId: undefined as number | undefined,
    priority: 'medium' as Priority,
    reminderAtLocal: '',
  });

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

  const [categories, setCategories] = useState<NoteCategory[]>([]);

  return {
    showCreateModal,
    setShowCreateModal,
    newNote,
    setNewNote,
    showEditModal,
    setShowEditModal,
    editNote,
    setEditNote,
    categories,
    setCategories,
  };
};
