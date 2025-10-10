import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { notesService, type NoteCategory } from '@/services/notesService';
import { toast } from 'react-hot-toast';
import { socketService } from '@/services/socketService';

export const useCategories = () => {
  const { t } = useTranslation('categories');
  const [categories, setCategories] = useState<NoteCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await notesService.getCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error('Fetch categories error:', error);
      toast.error(t('loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  // Create category
  const createCategory = useCallback(async (data: { name: string; color: string; icon: string }) => {
    try {
      await notesService.createCategory(data);
      toast.success(t('createSuccess'));
      // Refetch as fallback if socket not ready
      await fetchCategories();
    } catch (error: any) {
      console.error('Create category error:', error);
      toast.error(error.response?.data?.message || t('createError'));
      throw error;
    }
  }, [t, fetchCategories]);

  // Update category
  const updateCategory = useCallback(async (id: number, data: { name: string; color: string; icon: string }) => {
    try {
      await notesService.updateCategory(id, data);
      toast.success(t('updateSuccess'));
      // Refetch as fallback if socket not ready
      await fetchCategories();
    } catch (error: any) {
      console.error('Update category error:', error);
      toast.error(error.response?.data?.message || t('updateError'));
      throw error;
    }
  }, [t, fetchCategories]);

  // Delete category
  const deleteCategory = useCallback(async (id: number) => {
    try {
      await notesService.deleteCategory(id);    
      toast.success(t('deleteSuccess'));
      // Refetch as fallback if socket not ready
      await fetchCategories();
    } catch (error: any) {
      console.error('Delete category error:', error);
      toast.error(error.response?.data?.message || t('deleteError'));
      throw error;
    }
  }, [t, fetchCategories]);

  // Socket connection and listeners for real-time updates
  useEffect(() => {
    // Ensure socket is connected
    socketService.connect();
    
    const socket = socketService.getSocket();
    if (!socket) {
      console.warn('Socket not available for categories real-time updates');
      return;
    }

    const handleCategoryCreated = (category: NoteCategory) => {
      console.log('Category created event received:', category);
      setCategories(prev => {
        if (prev.some(c => c.id === category.id)) return prev;
        return [...prev, category];
      });
    };

    const handleCategoryUpdated = (category: NoteCategory) => {
      console.log('Category updated event received:', category);
      setCategories(prev => prev.map(c => {
        if (c.id !== category.id) return c;
        const merged = { ...c, ...category } as NoteCategory & { notesCount?: number };
        if (typeof (category as any).notesCount === 'undefined' && typeof (c as any).notesCount !== 'undefined') {
          (merged as any).notesCount = (c as any).notesCount;
        }
        return merged as NoteCategory;
      }));
    };

    const handleCategoryDeleted = (data: { id: number }) => {
      console.log('Category deleted event received:', data);
      setCategories(prev => prev.filter(c => c.id !== data.id));
    };

    const handleCategorySelectionUpdated = (data: { categoryId: number; selectionCount: number }) => {
      console.log('Category selection updated event received:', data);
      setCategories(prev => {
        // Cập nhật selectionCount
        const updated = prev.map(c => 
          c.id === data.categoryId 
            ? { ...c, selectionCount: data.selectionCount } as NoteCategory
            : c
        );
        
        // Sắp xếp lại: selectionCount DESC
        return updated.sort((a, b) => {
          const countA = (a as any).selectionCount || 0;
          const countB = (b as any).selectionCount || 0;
          return countB - countA;
        });
      });
    };

    socket.on('category_created', handleCategoryCreated);
    socket.on('category_updated', handleCategoryUpdated);
    socket.on('category_deleted', handleCategoryDeleted);
    socket.on('category_selection_updated', handleCategorySelectionUpdated);

    return () => {
      socket.off('category_created', handleCategoryCreated);
      socket.off('category_updated', handleCategoryUpdated);
      socket.off('category_deleted', handleCategoryDeleted);
      socket.off('category_selection_updated', handleCategorySelectionUpdated);
    };
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    isLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
