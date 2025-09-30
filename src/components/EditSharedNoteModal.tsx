import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { X, Save, Loader2, ImagePlus, Trash2 } from 'lucide-react';
import { notesService } from '@/services/notesService';
import toast from 'react-hot-toast';
import { uploadService } from '@/services/uploadService';

interface SharedNoteData {
  id: number;
  title: string;
  content?: string;
  imageUrl?: string | null;
  category: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

interface EditSharedNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: SharedNoteData;
  onNoteUpdated?: (updatedNote: SharedNoteData) => void;
}

const EditSharedNoteModal: React.FC<EditSharedNoteModalProps> = ({
  isOpen,
  onClose,
  note,
  onNoteUpdated
}) => {
  const { t } = useTranslation('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    category: 'personal',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize form data when note changes
  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.content || '',
        imageUrl: note.imageUrl || '',
        category: note.category || 'personal',
        priority: note.priority || 'medium'
      });
    }
  }, [note]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = '';
    if (!file) return;
    try {
      setIsUploading(true);
      const up = await uploadService.uploadImage(file);
      setFormData(prev => ({ ...prev, imageUrl: up.url }));
      toast.success(t('notes.modal.updateSuccess', { defaultValue: 'Cập nhật ghi chú thành công' }));
    } catch (err: any) {
      console.error('Upload image failed:', err);
      toast.error(t('notes.modal.imageUploadError', { defaultValue: 'Tải ảnh thất bại' }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error(t('notes.modal.titleRequired') || 'Tiêu đề không được để trống');
      return;
    }

    try {
      setIsLoading(true);
      
      const updateData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        imageUrl: formData.imageUrl.trim() || null,
        category: formData.category,
        priority: formData.priority
      };

      const response = await notesService.updateNote(note.id, updateData);
      
      toast.success(t('notes.modal.updateSuccess') || 'Cập nhật ghi chú thành công');
      
      // Notify parent component
      if (onNoteUpdated && response.note) {
        onNoteUpdated(response.note);
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error updating shared note:', error);
      toast.error(
        error?.response?.data?.message || 
        t('notes.modal.updateError') || 
        'Không thể cập nhật ghi chú'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('notes.modal.title') || 'Chỉnh sửa ghi chú chia sẻ'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('notes.modal.titleLabel') || 'Tiêu đề'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder={t('notes.modal.titlePlaceholder') || 'Nhập tiêu đề ghi chú...'}
                disabled={isLoading}
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('notes.modal.contentLabel') || 'Nội dung'}
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none transition-colors"
                placeholder={t('notes.modal.contentPlaceholder') || 'Nhập nội dung ghi chú...'}
                disabled={isLoading}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('notes.modal.imageUrlLabel', { defaultValue: 'URL hình ảnh' })}
              </label>
              {formData.imageUrl ? (
                <div className="space-y-3">
                  <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={formData.imageUrl} alt={t('notes.modal.imagePreviewAlt', { defaultValue: 'Ảnh' })} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handlePickImage}
                      disabled={isUploading || isLoading}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                    >
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                      {isUploading ? t('notes.modal.imageUploading', { defaultValue: 'Đang tải...' }) : t('notes.modal.imageUpload', { defaultValue: 'Tải ảnh' })}
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={isUploading || isLoading}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t('notes.modal.imageRemove', { defaultValue: 'Xóa ảnh' })}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder={t('notes.modal.imageUrlPlaceholder', { defaultValue: 'https://example.com/image.jpg' })}
                    disabled={isLoading || isUploading}
                  />
                  <button
                    type="button"
                    onClick={handlePickImage}
                    disabled={isUploading || isLoading}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                    {isUploading ? t('notes.modal.imageUploading', { defaultValue: 'Đang tải...' }) : t('notes.modal.imageUpload', { defaultValue: 'Tải ảnh' })}
                  </button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelected} className="hidden" />
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('notes.modal.categoryLabel') || 'Danh mục'}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                  disabled={isLoading}
                >
                  <option value="personal">{t('notes.modal.category.personal') || 'Cá nhân'}</option>
                  <option value="work">{t('notes.modal.category.work') || 'Công việc'}</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('notes.modal.priorityLabel') || 'Độ ưu tiên'}
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                  disabled={isLoading}
                >
                  <option value="low">{t('notes.modal.priority.low') || 'Thấp'}</option>
                  <option value="medium">{t('notes.modal.priority.medium') || 'Trung bình'}</option>
                  <option value="high">{t('notes.modal.priority.high') || 'Cao'}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {t('notes.modal.cancel') || 'Hủy'}
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !formData.title.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {t('notes.modal.save') || 'Lưu'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EditSharedNoteModal;
