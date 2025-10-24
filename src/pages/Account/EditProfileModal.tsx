import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAppDispatch } from '@/store';
import { updateProfile } from '@/store/slices/authSlice';
import { uploadService } from '@/services/uploadService';
import { Mail, User, X } from 'lucide-react';

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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm-down:p-3 xs-down:p-2.5 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl md-down:rounded-xl shadow-2xl w-full max-w-2xl md-down:max-w-xl sm-down:max-w-lg xs-down:max-w-[92%] max-h-[90vh] flex flex-col overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 md-down:p-5 sm-down:p-4 xs-down:p-3.5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl md-down:text-lg sm-down:text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 md-down:w-4.5 md-down:h-4.5 sm-down:w-4 sm-down:h-4" />
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 md-down:p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 md-down:w-4 md-down:h-4 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 md-down:p-5 sm-down:p-4 xs-down:p-3.5">
          <div className="space-y-4 md-down:space-y-3.5 sm-down:space-y-3 xs-down:space-y-3">
            {/* Avatar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 md-down:text-xs">
                {t('avatar.label')}
              </label>
              <div className="flex items-center gap-3 xs-down:flex-col xs-down:items-start xs-down:gap-2">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-sm md-down:w-14 md-down:h-14">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-gray-500 md-down:w-6 md-down:h-6" />
                  )}
                </div>
                <div className="xs-down:w-full">
                  <label className="inline-flex items-center px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer dark:text-white transition-colors md-down:text-xs">
                    {t('avatar.upload')}
                    <input type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
                  </label>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 md-down:text-[11px]">
                {t('avatar.info')}
              </p>
            </div>

            {/* Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md-down:gap-3.5 sm-down:gap-3">
              <div>
                <label className="block text-sm md-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('form.name')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 md-down:px-3.5 md-down:py-2 sm-down:px-3 sm-down:py-1.5 xs-down:px-3 xs-down:py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md-down:text-xs"
                  placeholder={t('form.namePlaceholder')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm md-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('form.email')}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={initial?.email || ''}
                    readOnly
                    className="w-full pl-9 pr-3 py-2 md-down:pl-8 md-down:py-2 sm-down:pl-7 sm-down:py-1.5 xs-down:pl-7 xs-down:py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 cursor-not-allowed text-sm md-down:text-xs"
                  />
                  <Mail className="w-4 h-4 md-down:w-3.5 md-down:h-3.5 sm-down:w-3 sm-down:h-3 text-gray-500 dark:text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <p className="mt-1 text-xs md-down:text-[11px] text-gray-500 dark:text-gray-400">
                  {t('form.emailNote')}
                </p>
              </div>
            </div>

            {/* Phone, Birth Date, Gender */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md-down:gap-3.5 md-down:grid-cols-2 sm-down:gap-3 sm-down:grid-cols-1">
              <div>
                <label className="block text-sm md-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('form.phone', { defaultValue: 'Số điện thoại' })}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 md-down:px-3.5 md-down:py-2 sm-down:px-3 sm-down:py-1.5 xs-down:px-3 xs-down:py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md-down:text-xs"
                  placeholder={t('form.phonePlaceholder', { defaultValue: '+84 912 345 678' })}
                />
              </div>
              <div>
                <label className="block text-sm md-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('form.birthDate', { defaultValue: 'Ngày sinh' })}
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-4 py-2 md-down:px-3.5 md-down:py-2 sm-down:px-3 sm-down:py-1.5 xs-down:px-3 xs-down:py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md-down:text-xs"
                />
              </div>
              <div>
                <label className="block text-sm md-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('form.gender', { defaultValue: 'Giới tính' })}
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-4 py-2 md-down:px-3.5 md-down:py-2 sm-down:px-3 sm-down:py-1.5 xs-down:px-3 xs-down:py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm md-down:text-xs"
                >
                  <option value="unspecified">{t('form.gender.unspecified', { defaultValue: 'Không tiết lộ' })}</option>
                  <option value="male">{t('form.gender.male', { defaultValue: 'Nam' })}</option>
                  <option value="female">{t('form.gender.female', { defaultValue: 'Nữ' })}</option>
                  <option value="other">{t('form.gender.other', { defaultValue: 'Khác' })}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="p-6 md-down:p-5 sm-down:p-4 xs-down:p-3.5 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3 sm-down:flex-col sm-down:gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 md-down:px-3 md-down:py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm md-down:text-xs"
            >
              {t('actions.cancel', { defaultValue: 'Hủy' })}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !name.trim()}
              className="flex-1 px-4 py-2 md-down:px-3 md-down:py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md-down:text-xs"
            >
              {submitting ? t('form.saving', { defaultValue: 'Đang lưu...' }) : t('form.save', { defaultValue: 'Lưu' })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
