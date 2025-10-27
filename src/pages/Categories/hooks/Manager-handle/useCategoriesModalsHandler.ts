import { useCallback } from 'react';
import type { NoteCategory } from '@/services/notesService';

interface UseCategoriesModalsHandlerProps {
  setCreateModalOpen: (value: boolean) => void;
  setEditModalOpen: (value: boolean) => void;
  setDeleteModalOpen: (value: boolean) => void;
  setViewNotesModalOpen: (value: boolean) => void;
  setSelectedCategory: (category: NoteCategory | null) => void;
}

export const useCategoriesModalsHandler = ({
  setCreateModalOpen,
  setEditModalOpen,
  setDeleteModalOpen,
  setViewNotesModalOpen,
  setSelectedCategory,
}: UseCategoriesModalsHandlerProps) => {
  const handleCreateCategory = useCallback(() => {
    setCreateModalOpen(true);
  }, [setCreateModalOpen]);

  const handleEditCategory = useCallback((category: NoteCategory) => {
    setSelectedCategory(category);
    setEditModalOpen(true);
  }, [setSelectedCategory, setEditModalOpen]);

  const handleDeleteCategory = useCallback((category: NoteCategory) => {
    setSelectedCategory(category);
    setDeleteModalOpen(true);
  }, [setSelectedCategory, setDeleteModalOpen]);

  const handleViewNotes = useCallback((category: NoteCategory) => {
    setSelectedCategory(category);
    setViewNotesModalOpen(true);
  }, [setSelectedCategory, setViewNotesModalOpen]);

  const handleCloseModals = useCallback(() => {
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setViewNotesModalOpen(false);
    setSelectedCategory(null);
  }, [setCreateModalOpen, setEditModalOpen, setDeleteModalOpen, setViewNotesModalOpen, setSelectedCategory]);

  return {
    handleCreateCategory,
    handleEditCategory,
    handleDeleteCategory,
    handleViewNotes,
    handleCloseModals,
  };
};
