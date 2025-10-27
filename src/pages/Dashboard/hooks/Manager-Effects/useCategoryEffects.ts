import { useEffect } from 'react';
import { type NoteCategory } from '@/services/notesService';
import { socketService } from '@/services/socketService';

interface UseCategoryEffectsProps {
  categories: NoteCategory[];
  setCategories: React.Dispatch<React.SetStateAction<NoteCategory[]>>;
  newNoteCategoryId?: number;
  editNoteCategoryId?: number;
  moveToFront: (arr: NoteCategory[], id?: number) => NoteCategory[];
  loadCategories: () => Promise<void>;
}

export const useCategoryEffects = ({
  categories: _categories,
  setCategories,
  newNoteCategoryId,
  editNoteCategoryId,
  moveToFront,
  loadCategories,
}: UseCategoryEffectsProps) => {

  // Fetch categories eagerly on mount to avoid delay when opening dropdown
  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // UX: đưa category vừa chọn lên đầu danh sách ngay lập tức
  useEffect(() => {
    if (newNoteCategoryId) {
      setCategories(prev => moveToFront(prev, newNoteCategoryId));
    }
  }, [newNoteCategoryId, moveToFront, setCategories]);

  useEffect(() => {
    if (editNoteCategoryId) {
      setCategories(prev => moveToFront(prev, editNoteCategoryId));
    }
  }, [editNoteCategoryId, moveToFront, setCategories]);

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
};
