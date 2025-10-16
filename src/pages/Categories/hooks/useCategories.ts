import { useState, useEffect, useCallback, useRef } from 'react';
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
  }, []); // Tối ưu: Loại bỏ dependency 't' không cần thiết

  // Ref để giữ fetchCategories stable cho socket handlers
  const fetchCategoriesRef = useRef(fetchCategories);
  useEffect(() => {
    fetchCategoriesRef.current = fetchCategories;
  }, [fetchCategories]);

  // Create category - Tối ưu: Optimistic update + không chờ toast
  const createCategory = useCallback(async (data: { name: string; color: string; icon: string }) => {
    // Tạo temporary ID để optimistic update (sử dụng negative ID để phân biệt)
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

    // Optimistic update: Thêm ngay vào UI (ở đầu danh sách)
    setCategories(prev => [tempCategory, ...prev]);

    try {
      const response = await notesService.createCategory(data);
      // Replace temp category với real category từ server
      setCategories(prev => 
        prev.map(c => c.id === tempId ? response.category : c)
      );
      toast.success(t('createSuccess'));
    } catch (error: any) {
      console.error('Create category error:', error);
      // Rollback optimistic update
      setCategories(prev => prev.filter(c => c.id !== tempId));
      toast.error(error.response?.data?.message || t('createError'));
      throw error;
    }
  }, [t]);

  // Update category - Tối ưu: Optimistic update trước, API sau
  const updateCategory = useCallback(async (id: number, data: { name: string; color: string; icon: string }) => {
    // Lưu old data để rollback nếu lỗi
    const oldCategory = categories.find(c => c.id === id);
    
    // Optimistic update: Cập nhật UI ngay lập tức
    setCategories(prev => prev.map(c => {
      if (c.id !== id) return c;
      return { ...c, ...data };
    }));

    try {
      const response = await notesService.updateCategory(id, data);
      // Sync với server data (có notesCount chính xác)
      if (response.category) {
        setCategories(prev => prev.map(c => {
          if (c.id !== id) return c;
          return { ...c, ...response.category };
        }));
      }
      toast.success(t('updateSuccess'));
    } catch (error: any) {
      console.error('Update category error:', error);
      // Rollback về data cũ
      if (oldCategory) {
        setCategories(prev => prev.map(c => c.id === id ? oldCategory : c));
      }
      toast.error(error.response?.data?.message || t('updateError'));
      throw error;
    }
  }, [t, categories]);

  // Delete category - Tối ưu: Xóa khỏi UI trước, gọi API sau
  const deleteCategory = useCallback(async (id: number) => {
    console.log('Delete category called:', id);
    
    // Lưu category để rollback nếu lỗi
    let deletedCategory: NoteCategory | undefined;
    
    // Optimistic update: Xóa khỏi UI ngay lập tức
    setCategories(prev => {
      deletedCategory = prev.find(c => c.id === id);
      return prev.filter(c => c.id !== id);
    });

    try {
      await notesService.deleteCategory(id);    
      toast.success(t('deleteSuccess'));
    } catch (error: any) {
      console.error('Delete category error:', error);
      // Rollback: Thêm lại category
      if (deletedCategory) {
        setCategories(prev => [...prev, deletedCategory!]);
      }
      toast.error(error.response?.data?.message || t('deleteError'));
      throw error;
    }
  }, [t]);

  // Socket connection and listeners for real-time updates
  useEffect(() => {
    console.log('🔌 Setting up category socket listeners...');
    // Ensure socket is connected
    socketService.connect();
    
    const socket = socketService.getSocket();
    if (!socket) {
      console.warn('⚠️ Socket not available for categories real-time updates');
      return;
    }
    console.log('✅ Socket connected, registering category listeners');

    const handleCategoryCreated = (category: NoteCategory) => {
      console.log('Category created event received:', category);
      setCategories(prev => {
        // Tối ưu: Kiểm tra xem đã có category này chưa (tránh duplicate)
        const existingIndex = prev.findIndex(c => c.id === category.id);
        if (existingIndex !== -1) {
          // Đã có rồi, không thêm nữa
          return prev;
        }
        
        // Kiểm tra xem có temp category cùng tên không (từ optimistic update)
        const tempIndex = prev.findIndex(c => 
          c.id < 0 && // Temp ID là negative
          c.name.toLowerCase() === category.name.toLowerCase() &&
          c.color === category.color &&
          c.icon === category.icon
        );
        
        if (tempIndex !== -1) {
          // Replace temp category với real category (giữ vị trí ở đầu)
          return prev.map((c, idx) => idx === tempIndex ? category : c);
        }
        
        // Thêm mới nếu chưa có (thêm vào đầu danh sách)
        return [category, ...prev];
      });
    };

    const handleCategoryUpdated = (category: NoteCategory) => {
      console.log('Category updated event received:', category);
      setCategories(prev => {
        // Tối ưu: Chỉ update nếu có thay đổi
        const existing = prev.find(c => c.id === category.id);
        if (!existing) return prev;
        
        // Check nếu không có gì thay đổi
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
      console.log('Current categories:', categories.map(c => ({ id: c.id, name: c.name })));
      setCategories(prev => {
        // Tối ưu: Tránh re-render nếu không tồn tại
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
      // Tối ưu: Fetch lại danh sách categories từ backend (đã được sắp xếp)
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
  }, []); // Tối ưu: Loại bỏ fetchCategories dependency để socket không re-register

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
