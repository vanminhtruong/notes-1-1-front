import { useState } from 'react';
import type { NoteCategory } from '@/services/notesService';

export const useCategoriesModalsState = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewNotesModalOpen, setViewNotesModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | null>(null);

  return {
    createModalOpen,
    setCreateModalOpen,
    editModalOpen,
    setEditModalOpen,
    deleteModalOpen,
    setDeleteModalOpen,
    viewNotesModalOpen,
    setViewNotesModalOpen,
    selectedCategory,
    setSelectedCategory,
  };
};
