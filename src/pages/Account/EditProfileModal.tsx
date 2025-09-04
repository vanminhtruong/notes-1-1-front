import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAppDispatch } from '@/store';
import { updateProfile } from '@/store/slices/authSlice';
import { uploadService } from '@/services/uploadService';
import { Mail, User } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initial?: {
    name?: string | null;
    email?: string | null;
    avatar?: string | null;
    phone?: string | null;
    birthDate?: string | null; // YYYY-MM-DD
    gender?: 'male' | 'female' | 'other' | 'unspecified' | null;
  };
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, initial }) => {
  const { t } = useTranslation('account');
  const dispatch = useAppDispatch();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'unspecified'>('unspecified');

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      if (avatarPreview && avatarPreview.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
      setAvatarFile(null);
      setAvatarPreview(null);
      setName('');
      setPhone('');
      setBirthDate('');
      setGender('unspecified');
      return;
    }
    const n = (initial?.name ?? '').toString();
    setName(n);
    setPhone(initial?.phone ?? '');
    setBirthDate(initial?.birthDate ?? '');
    setGender((initial?.gender as any) ?? 'unspecified');
    setAvatarPreview(initial?.avatar || null);
  }, [isOpen]);

  const title = useMemo(() => t('titleEdit', { defaultValue: 'Chỉnh sửa thông tin' }), [t]);

  const onPickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('avatar.maxSizeError'));
      return;
    }
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    if (avatarPreview && avatarPreview.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(url);
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error(t('errors.nameRequired', { defaultValue: 'Vui lòng nhập tên' }));
      return;
    }

    setSubmitting(true);
    try {
      let avatarUrl: string | undefined;
      if (avatarFile) {
        const up = await uploadService.uploadImage(avatarFile);
        avatarUrl = up.url;
      }

      await dispatch(updateProfile({
        name: trimmed,
        avatar: avatarUrl !== undefined ? avatarUrl : (initial?.avatar || ''),
        phone: phone.trim() ? phone.trim() : null,
        birthDate: birthDate || null,
        gender,
      })).unwrap();

      onClose();
    } catch (err: any) {
      // Errors are already toasted in authSlice.updateProfile
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[640px] max-w-[95vw] max-h-[85vh] overflow-auto mx-3" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>

        {/* Avatar */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('avatar.label')}
          </label>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-gray-500" />
              )}
            </div>
            <div>
              <label className="inline-flex items-center px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer dark:text-white">
                {t('avatar.upload')}
                <input type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
              </label>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('avatar.info')}</p>
        </div>

        {/* Name & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('form.name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('form.namePlaceholder')}
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('form.email')}</label>
            <div className="relative">
              <input
                type="email"
                value={initial?.email || ''}
                readOnly
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100/80 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none cursor-not-allowed"
              />
              <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('form.emailNote')}</p>
          </div>
        </div>

        {/* Phone, Birth Date, Gender */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('form.phone', { defaultValue: 'Số điện thoại' })}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('form.phonePlaceholder', { defaultValue: '+84 912 345 678' })}
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('form.birthDate', { defaultValue: 'Ngày sinh' })}</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('form.gender', { defaultValue: 'Giới tính' })}</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="unspecified">{t('form.gender.unspecified', { defaultValue: 'Không tiết lộ' })}</option>
              <option value="male">{t('form.gender.male', { defaultValue: 'Nam' })}</option>
              <option value="female">{t('form.gender.female', { defaultValue: 'Nữ' })}</option>
              <option value="other">{t('form.gender.other', { defaultValue: 'Khác' })}</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white disabled:opacity-50"
          >
            {t('actions.cancel', { defaultValue: 'Hủy' })}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !name.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {t('form.save', { defaultValue: 'Lưu' })}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
