import { useEffect } from 'react';
import { notesService } from '@/services/notesService';

interface UseLazyLoadCategoriesProps {
  showCreateModal: boolean;
  showEditModal: boolean;
  categories: any[];
  onCategoriesLoaded?: (categories: any[]) => void;
}

export const useLazyLoadCategories = ({
  showCreateModal,
  showEditModal,
  categories,
  onCategoriesLoaded,
}: UseLazyLoadCategoriesProps) => {
  // Load categories when opening create/edit modals
  useEffect(() => {
    if ((showCreateModal || showEditModal) && categories.length === 0) {
      // Lazy load categories when modal opens
      const loadCategories = async () => {
        try {
          const response = await notesService.getCategories({ 
            sortBy: 'maxSelectionCount', 
            sortOrder: 'DESC' 
          });
          
          // Notify parent if callback provided
          if (onCategoriesLoaded && response.categories) {
            onCategoriesLoaded(response.categories);
          }
        } catch (error) {
          console.error('Failed to load categories:', error);
        }
      };
      
      loadCategories();
    }
  }, [showCreateModal, showEditModal, categories.length, onCategoriesLoaded]);
};
