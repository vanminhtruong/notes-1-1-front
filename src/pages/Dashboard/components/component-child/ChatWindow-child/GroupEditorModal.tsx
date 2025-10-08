import React, { useEffect, useMemo, useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[520px] max-w-[95vw] max-h-[85vh] overflow-auto mx-3" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('chat.groups.editor.fields.name')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('chat.groups.editor.placeholders.name')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Avatar */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('chat.groups.editor.fields.avatar')}
          </label>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-500 text-xs text-center leading-tight px-2">{t('chat.groups.editor.placeholders.avatar')}</span>
              )}
            </div>
            <div>
              <label className="inline-flex items-center px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer dark:text-white">
                {t('chat.groups.editor.actions.chooseImage')}
                <input type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
              </label>
            </div>
          </div>
        </div>

        {/* Background */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('chat.groups.editor.fields.background')}
          </label>
          <div className="flex items-center gap-3">
            <div className="w-32 h-16 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {backgroundPreview ? (
                <img src={backgroundPreview} alt="background" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-500 text-xs text-center leading-tight px-2">{t('chat.groups.editor.placeholders.background')}</span>
              )}
            </div>
            <div>
              <label className="inline-flex items-center px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer dark:text-white">
                {t('chat.groups.editor.actions.chooseImage')}
                <input type="file" accept="image/*" className="hidden" onChange={onPickBackground} />
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white disabled:opacity-50"
          >
            {t('chat.groups.editor.actions.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isEdit ? t('chat.groups.editor.actions.save') : t('chat.groups.editor.actions.create')}
          </button>
        </div>
      </div>
    </div>
  );
});

GroupEditorModal.displayName = 'GroupEditorModal';

export default GroupEditorModal;

