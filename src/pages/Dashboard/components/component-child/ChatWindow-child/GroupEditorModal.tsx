import React, { useEffect, useMemo, useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { X, Users, Image as ImageIcon, Upload, Sparkles } from 'lucide-react';
import { uploadService } from '../../../../../services/uploadService';
import { groupService } from '../../../../../services/groupService';
import type { GroupEditorModalProps } from '../../interface/ChatUI.interface';

const GroupEditorModal: React.FC<GroupEditorModalProps> = memo(({ isOpen, mode, initial, onClose, onSuccess }) => {
  const { t } = useTranslation('dashboard');

  const [name, setName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isEdit = mode === 'edit';

  useEffect(() => {
    if (!isOpen) {
      // cleanup
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      if (backgroundPreview) URL.revokeObjectURL(backgroundPreview);
      setName('');
      setAvatarFile(null);
      setBackgroundFile(null);
      setAvatarPreview(null);
      setBackgroundPreview(null);
      return;
    }
    // init from initial
    const n = (initial?.name ?? '').toString();
    setName(n);
    setAvatarPreview(initial?.avatar || null);
    setBackgroundPreview(initial?.background || null);
  }, [isOpen]);

  const title = useMemo(() => {
    return isEdit ? t('chat.groups.editor.titleEdit') : t('chat.groups.editor.titleCreate');
  }, [isEdit, t]);

  const onPickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = '';
    if (!file) return;
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(url);
  };

  const onPickBackground = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = '';
    if (!file) return;
    setBackgroundFile(file);
    const url = URL.createObjectURL(file);
    if (backgroundPreview) URL.revokeObjectURL(backgroundPreview);
    setBackgroundPreview(url);
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error(t('chat.groups.editor.errors.nameRequired'));
      return;
    }

    setSubmitting(true);
    try {
      let avatarUrl: string | undefined;
      let backgroundUrl: string | undefined;

      if (avatarFile) {
        const up = await uploadService.uploadImage(avatarFile);
        avatarUrl = up.url;
      }
      if (backgroundFile) {
        const up = await uploadService.uploadImage(backgroundFile);
        backgroundUrl = up.url;
      }

      if (isEdit) {
        if (!initial?.id) {
          toast.error(t('chat.groups.editor.errors.invalid'));
          return;
        }
        const updates: { name?: string; avatar?: string; background?: string } = {};
        if (trimmed && trimmed !== (initial?.name || '')) updates.name = trimmed;
        if (avatarUrl) updates.avatar = avatarUrl;
        if (backgroundUrl) updates.background = backgroundUrl;

        if (Object.keys(updates).length === 0) {
          // nothing to update
          onClose();
          return;
        }
        const res = await groupService.updateGroup(initial.id, updates);
        if (res.success) {
          toast.success(t('chat.groups.success.updated'));
          onSuccess?.(res.data);
          onClose();
        }
      } else {
        const res = await groupService.createGroup(trimmed, [], { avatar: avatarUrl, background: backgroundUrl });
        if (res.success) {
          toast.success(t('chat.groups.success.created'));
          onSuccess?.(res.data);
          onClose();
        }
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || (isEdit ? t('chat.groups.errors.updateFailed') : t('chat.groups.errors.createFailed'));
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" 
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[540px] max-w-[95vw] max-h-[90vh] overflow-hidden mx-3 animate-slideUp" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-md">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {isEdit ? t('chat.groups.editor.subtitle.edit', 'Chỉnh sửa thông tin nhóm') : t('chat.groups.editor.subtitle.create', 'Tạo nhóm mới để kết nối')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-all duration-200 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Group Name */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {t('chat.groups.editor.fields.name')}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('chat.groups.editor.placeholders.name')}
              className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 placeholder:text-gray-400"
              autoFocus
            />
          </div>

          {/* Avatar Section */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              {t('chat.groups.editor.fields.avatar')}
            </label>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-lg">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                {avatarPreview && (
                  <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer transition-all duration-200">
                  <Upload className="w-4 h-4" />
                  {t('chat.groups.editor.actions.chooseImage')}
                  <input type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {t('chat.groups.editor.hints.avatar', 'Khuyến nghị: 256x256px, PNG hoặc JPG')}
                </p>
              </div>
            </div>
          </div>

          {/* Background Section */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              {t('chat.groups.editor.fields.background')}
            </label>
            <div className="space-y-3">
              <div className="relative group">
                <div className="w-full h-32 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 flex items-center justify-center border-2 border-white dark:border-gray-700 shadow-md">
                  {backgroundPreview ? (
                    <img src={backgroundPreview} alt="background" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('chat.groups.editor.placeholders.background', 'Ảnh bìa nhóm')}
                      </p>
                    </div>
                  )}
                </div>
                {backgroundPreview && (
                  <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 cursor-pointer transition-all duration-200">
                <Upload className="w-4 h-4" />
                {t('chat.groups.editor.actions.chooseImage')}
                <input type="file" accept="image/*" className="hidden" onChange={onPickBackground} />
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('chat.groups.editor.hints.background', 'Khuyến nghị: 1200x400px, PNG hoặc JPG')}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-all duration-200"
          >
            {t('chat.groups.editor.actions.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !name.trim()}
            className="px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('chat.groups.editor.actions.processing', 'Đang xử lý...')}
              </>
            ) : (
              <>
                <Users className="w-4 h-4" />
                {isEdit ? t('chat.groups.editor.actions.save') : t('chat.groups.editor.actions.create')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Add animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
});

GroupEditorModal.displayName = 'GroupEditorModal';

export default GroupEditorModal;

