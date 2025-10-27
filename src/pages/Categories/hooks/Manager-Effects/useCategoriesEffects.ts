import { useEffect, useRef } from 'react';
import { socketService } from '@/services/socketService';
import type { NoteCategory } from '@/services/notesService';

interface UseCategoriesEffectsProps {
  fetchCategories: () => Promise<void>;
  setCategories: React.Dispatch<React.SetStateAction<NoteCategory[]>>;
}

export const useCategoriesEffects = ({
  fetchCategories,
  setCategories,
}: UseCategoriesEffectsProps) => {
  // Ref để giữ fetchCategories stable cho socket handlers
  const fetchCategoriesRef = useRef(fetchCategories);
  useEffect(() => {
    fetchCategoriesRef.current = fetchCategories;
  }, [fetchCategories]);

  // Socket listeners for real-time updates
  useEffect(() => {
    console.log('🔌 Setting up category socket listeners...');
    
    const socket = socketService.getSocket();
    if (!socket) {
      console.warn('⚠️ Socket not available for categories real-time updates');
      return;
    }
    console.log('✅ Socket available, registering category listeners');

    const handleCategoryCreated = (category: NoteCategory) => {
      console.log('Category created event received:', category);
      setCategories(prev => {
        const existingIndex = prev.findIndex(c => c.id === category.id);
        if (existingIndex !== -1) {
          return prev;
        }
        
        const tempIndex = prev.findIndex(c => 
          c.id < 0 &&
          c.name.toLowerCase() === category.name.toLowerCase() &&
          c.color === category.color &&
          c.icon === category.icon
        );
        
        if (tempIndex !== -1) {
          return prev.map((c, idx) => idx === tempIndex ? category : c);
        }
        
        return [category, ...prev];
      });
    };

    const handleCategoryUpdated = (category: NoteCategory) => {
      console.log('Category updated event received:', category);
      setCategories(prev => {
        const existing = prev.find(c => c.id === category.id);
        if (!existing) return prev;
        
        if (existing.name === category.name && 
            existing.color === category.color && 
            existing.icon === category.icon) {
          return prev;
        }
        
        return prev.map(c => {
          if (c.id !== category.id) return c;
          const merged = { ...c, ...category } as NoteCategory & { notesCount?: number };
          if (typeof (category as any).notesCount === 'undefined' && typeof (c as any).notesCount !== 'undefined') {
            (merged as any).notesCount = (c as any).notesCount;
          }
          return merged as NoteCategory;
        });
      });
    };

    const handleCategoryDeleted = (data: { id: number }) => {
      console.log('🔴 Socket: Category deleted event received:', data);
      setCategories(prev => {
        const exists = prev.some(c => c.id === data.id);
        if (!exists) {
          console.log('⚠️ Socket: Category already deleted (optimistic update), skipping');
          return prev;
        }
        console.log('✅ Socket: Removing category from list, id:', data.id);
        return prev.filter(c => c.id !== data.id);
      });
    };

    const handleCategoriesReorderNeeded = () => {
      console.log('Categories reorder needed event received');
      fetchCategoriesRef.current();
    };

    socket.on('category_created', handleCategoryCreated);
    socket.on('category_updated', handleCategoryUpdated);
    socket.on('category_deleted', handleCategoryDeleted);
    socket.on('categories_reorder_needed', handleCategoriesReorderNeeded);
    
    console.log('📋 Registered socket events:', [
      'category_created',
      'category_updated', 
      'category_deleted',
      'categories_reorder_needed'
    ]);

    return () => {
      console.log('🔌 Unregistering category socket listeners');
      socket.off('category_created', handleCategoryCreated);
      socket.off('category_updated', handleCategoryUpdated);
      socket.off('category_deleted', handleCategoryDeleted);
      socket.off('categories_reorder_needed', handleCategoriesReorderNeeded);
    };
  }, [setCategories]);

  // Initial fetch
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
};
