import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { notesService, type NoteCategory } from '@/services/notesService';
import { toast } from 'react-hot-toast';

interface UseCategoriesHandlerProps {
  setCategories: React.Dispatch<React.SetStateAction<NoteCategory[]>>;
  setIsLoading: (loading: boolean) => void;
  categories: NoteCategory[];
}

export const useCategoriesHandler = ({
  setCategories,
  setIsLoading,
  categories,
}: UseCategoriesHandlerProps) => {
  const { t } = useTranslation('categories');

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
  }, [setIsLoading, setCategories, t]);

  // Create category - Optimistic update
  const createCategory = useCallback(async (data: { name: string; color: string; icon: string }) => {
    const tempId = -Date.now();
    const tempCategory: NoteCategory = {
      id: tempId,
      name: data.name,
      color: data.color,
      icon: data.icon,
      isDefault: false,
      userId: 0,
      notesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCategories(prev => [tempCategory, ...prev]);

    try {
      const response = await notesService.createCategory(data);
      setCategories(prev => 
        prev.map(c => c.id === tempId ? response.category : c)
      );
      toast.success(t('createSuccess'));
    } catch (error: any) {
      console.error('Create category error:', error);
      setCategories(prev => prev.filter(c => c.id !== tempId));
      toast.error(error.response?.data?.message || t('createError'));
      throw error;
    }
  }, [t, setCategories]);

  // Update category - Optimistic update
  const updateCategory = useCallback(async (id: number, data: { name: string; color: string; icon: string }) => {
    const oldCategory = categories.find(c => c.id === id);
    
    setCategories(prev => prev.map(c => {
      if (c.id !== id) return c;
      return { ...c, ...data };
    }));

    try {
      const response = await notesService.updateCategory(id, data);
      if (response.category) {
        setCategories(prev => prev.map(c => {
          if (c.id !== id) return c;
          return { ...c, ...response.category };
        }));
      }
      toast.success(t('updateSuccess'));
    } catch (error: any) {
      console.error('Update category error:', error);
      if (oldCategory) {
        setCategories(prev => prev.map(c => c.id === id ? oldCategory : c));
      }
      toast.error(error.response?.data?.message || t('updateError'));
      throw error;
    }
  }, [t, categories, setCategories]);

  // Delete category - Optimistic update
  const deleteCategory = useCallback(async (id: number) => {
    console.log('Delete category called:', id);
    
    let deletedCategory: NoteCategory | undefined;
    
    setCategories(prev => {
      deletedCategory = prev.find(c => c.id === id);
      return prev.filter(c => c.id !== id);
    });

    try {
      await notesService.deleteCategory(id);    
      toast.success(t('deleteSuccess'));
    } catch (error: any) {
      console.error('Delete category error:', error);
      if (deletedCategory) {
        setCategories(prev => [...prev, deletedCategory!]);
      }
      toast.error(error.response?.data?.message || t('deleteError'));
      throw error;
    }
  }, [t, setCategories]);

  return {
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
