import { useState, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { X, Save, Loader2 } from 'lucide-react';
import { notesService } from '@/services/notesService';
import toast from 'react-hot-toast';
import { uploadService } from '@/services/uploadService';
import { lockBodyScroll, unlockBodyScroll } from '@/utils/scrollLock';

interface SharedNoteData {
  id: number;
  title: string;
  content?: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  youtubeUrl?: string | null;
  category?: string | { id: number; name: string; color: string; icon: string } | null;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

interface EditSharedNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: SharedNoteData;
  onNoteUpdated?: (updatedNote: SharedNoteData) => void;
}

const EditSharedNoteModal = memo<EditSharedNoteModalProps>(({ isOpen,
  onClose,
  note,
  onNoteUpdated
}) => {
  const { t } = useTranslation('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    videoUrl: '',
    youtubeUrl: '',
    categoryId: null as number | null,
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [activeMediaTab, setActiveMediaTab] = useState<'image' | 'video' | 'youtube'>('image');

  // Disable body scroll when modal is open (reference-counted)
  useEffect(() => {
    if (isOpen) {
      lockBodyScroll('EditSharedNoteModal');
      return () => {
        unlockBodyScroll('EditSharedNoteModal');
      };
    }
    return;
  }, [isOpen]);

  // Initialize form data when note changes
  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.content || '',
        imageUrl: note.imageUrl || '',
        videoUrl: note.videoUrl || '',
        youtubeUrl: note.youtubeUrl || '',
        categoryId: typeof note.category === 'object' && note.category?.id ? note.category.id : null,
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
        videoUrl: formData.videoUrl.trim() || null,
        youtubeUrl: formData.youtubeUrl.trim() || null,
        categoryId: formData.categoryId,
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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
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

            {/* Media Upload - Tabs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('notes.modal.mediaLabel', { defaultValue: 'Media' })}
              </label>
              
              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-600 mb-3">
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('image')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeMediaTab === 'image'
                      ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  📷 {t('modals.create.fields.image', { defaultValue: 'Hình ảnh' })}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('video')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeMediaTab === 'video'
                      ? 'border-b-2 border-green-600 text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  🎬 {t('modals.create.fields.video', { defaultValue: 'Video' })}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('youtube')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeMediaTab === 'youtube'
                      ? 'border-b-2 border-red-600 text-red-600 dark:text-red-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  📺 {t('modals.create.fields.youtube', { defaultValue: 'YouTube' })}
                </button>
              </div>

              {/* Tab Content - Image */}
              {activeMediaTab === 'image' && (
                <div>
                  {formData.imageUrl ? (
                    <div className="space-y-3">
                      <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleInputChange('imageUrl', '')}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm"
                      >
                        Xóa ảnh
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const { url } = await uploadService.uploadImage(file);
                          handleInputChange('imageUrl', url);
                          handleInputChange('videoUrl', '');
                          handleInputChange('youtubeUrl', '');
                        } catch (_err) { }
                      }}
                      className="w-full text-sm"
                    />
                  )}
                </div>
              )}

              {/* Tab Content - Video */}
              {activeMediaTab === 'video' && (
                <div>
                  {formData.videoUrl ? (
                    <div className="space-y-3">
                      <video src={formData.videoUrl} controls preload="metadata" className="w-full h-48 rounded-lg border" />
                      <button
                        type="button"
                        onClick={() => handleInputChange('videoUrl', '')}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm"
                      >
                        Xóa video
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="video/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const { url } = await uploadService.uploadFile(file);
                          handleInputChange('videoUrl', url);
                          handleInputChange('imageUrl', '');
                          handleInputChange('youtubeUrl', '');
                        } catch (_err) { }
                      }}
                      className="w-full text-sm"
                    />
                  )}
                </div>
              )}

              {/* Tab Content - YouTube */}
              {activeMediaTab === 'youtube' && (
                <input
                  type="url"
                  value={formData.youtubeUrl}
                  onChange={(e) => {
                    handleInputChange('youtubeUrl', e.target.value);
                    handleInputChange('imageUrl', '');
                    handleInputChange('videoUrl', '');
                  }}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              )}
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category - Hidden for now, using categoryId from parent note */}
              {/* Note: Category is inherited from the original shared note */}

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
});

EditSharedNoteModal.displayName = 'EditSharedNoteModal';

export default EditSharedNoteModal;
