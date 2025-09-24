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

  useEffect(() => {
    if (!isOpen) return;

    const { style } = document.body;
    const previousOverflow = style.overflow;
    const previousPaddingRight = style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      style.overflow = previousOverflow;
      style.paddingRight = previousPaddingRight;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 xl-down:px-3 lg-down:px-3 md-down:px-3 sm-down:px-2 xs-down:px-2"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-[640px] max-w-4xl max-h-[85vh] overflow-auto shadow-2xl transition-transform xl-down:max-w-3xl xl-down:p-5 xl-down:rounded-2xl lg-down:max-w-2xl lg-down:p-5 lg-down:rounded-xl md-down:max-w-xl md-down:p-4 md-down:rounded-xl sm-down:max-w-lg sm-down:p-4 sm-down:rounded-lg xs-down:max-w-full xs-down:p-3 xs-down:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white xl-down:text-[17px] lg-down:text-base md-down:text-sm md-down:mb-3 sm-down:text-sm sm-down:mb-3 xs-down:text-[15px] xs-down:mb-2.5">{title}</h3>

        {/* Avatar */}
        <div className="mb-4 xl-down:mb-3.5 lg-down:mb-3 md-down:mb-3 sm-down:mb-3 xs-down:mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 xl-down:text-sm lg-down:text-sm md-down:text-xs md-down:mb-1 sm-down:text-xs xs-down:text-[11px] xs-down:mb-1">
            {t('avatar.label')}
          </label>
          <div className="flex items-center gap-3 xl-down:gap-3 lg-down:gap-3 md-down:gap-3 sm-down:gap-3 xs-down:flex-col xs-down:items-start xs-down:gap-2">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-sm xl-down:w-15 xl-down:h-15 lg-down:w-14 lg-down:h-14 md-down:w-14 md-down:h-14 sm-down:w-14 sm-down:h-14 xs-down:w-14 xs-down:h-14">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-gray-500 xl-down:w-7 xl-down:h-7 lg-down:w-7 lg-down:h-7 md-down:w-6 md-down:h-6 sm-down:w-6 sm-down:h-6" />
              )}
            </div>
            <div className="xs-down:w-full xs-down:flex xs-down:justify-between xs-down:items-center">
              <label className="inline-flex items-center px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer dark:text-white xl-down:text-sm lg-down:text-sm md-down:px-3 md-down:py-2 md-down:text-xs sm-down:px-3 sm-down:py-2 sm-down:text-xs xs-down:text-xs xs-down:px-3 xs-down:py-2">
                {t('avatar.upload')}
                <input type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
              </label>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 xl-down:text-[11px] lg-down:text-[11px] md-down:text-[11px] sm-down:text-[11px] xs-down:text-[10px]">
            {t('avatar.info')}
          </p>
        </div>

        {/* Name & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl-down:gap-5 lg-down:gap-4 md-down:gap-4 sm-down:gap-3.5 xs-down:gap-3">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 xl-down:text-sm lg-down:text-sm md-down:text-xs md-down:mb-1 sm-down:text-xs xs-down:text-[11px] xs-down:mb-1">
              {t('form.name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 xl-down:px-3 xl-down:py-2 lg-down:px-3 lg-down:py-2 md-down:px-2.5 md-down:py-2 md-down:text-sm sm-down:px-2.5 sm-down:py-1.5 sm-down:text-xs xs-down:px-2.5 xs-down:py-1.5 xs-down:text-xs"
              placeholder={t('form.namePlaceholder')}
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 xl-down:text-sm lg-down:text-sm md-down:text-xs md-down:mb-1 sm-down:text-xs xs-down:text-[11px] xs-down:mb-1">
              {t('form.email')}
            </label>
            <div className="relative">
              <input
                type="email"
                value={initial?.email || ''}
                readOnly
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100/80 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none cursor-not-allowed xl-down:pl-8 xl-down:py-2 lg-down:pl-8 lg-down:py-2 md-down:pl-8 md-down:py-2 md-down:text-sm sm-down:pl-7 sm-down:py-1.5 sm-down:text-xs xs-down:pl-7 xs-down:py-1.5 xs-down:text-xs"
              />
              <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 xl-down:w-3.5 xl-down:h-3.5 lg-down:w-3.5 lg-down:h-3.5 md-down:w-3.5 md-down:h-3.5 sm-down:w-3 sm-down:h-3" />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 xl-down:text-[11px] lg-down:text-[11px] md-down:text-[11px] sm-down:text-[11px] xs-down:text-[10px]">
              {t('form.emailNote')}
            </p>
          </div>
        </div>

        {/* Phone, Birth Date, Gender */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 xl-down:gap-5 xl-down:mt-5 lg-down:gap-4 lg-down:mt-5 md-down:gap-4 md-down:mt-5 sm-down:gap-3.5 sm-down:mt-4 xs-down:gap-3 xs-down:mt-4 md-down:grid-cols-2 sm-down:grid-cols-1">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 xl-down:text-sm lg-down:text-sm md-down:text-xs md-down:mb-1 sm-down:text-xs xs-down:text-[11px] xs-down:mb-1">
              {t('form.phone', { defaultValue: 'Số điện thoại' })}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 xl-down:px-3 xl-down:py-2 lg-down:px-3 lg-down:py-2 md-down:px-2.5 md-down:py-2 md-down:text-sm sm-down:px-2.5 sm-down:py-1.5 sm-down:text-xs xs-down:px-2.5 xs-down:py-1.5 xs-down:text-xs"
              placeholder={t('form.phonePlaceholder', { defaultValue: '+84 912 345 678' })}
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 xl-down:text-sm lg-down:text-sm md-down:text-xs md-down:mb-1 sm-down:text-xs xs-down:text-[11px] xs-down:mb-1">
              {t('form.birthDate', { defaultValue: 'Ngày sinh' })}
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 xl-down:px-3 xl-down:py-2 lg-down:px-3 lg-down:py-2 md-down:px-2.5 md-down:py-2 md-down:text-sm sm-down:px-2.5 sm-down:py-1.5 sm-down:text-xs xs-down:px-2.5 xs-down:py-1.5 xs-down:text-xs"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 xl-down:text-sm lg-down:text-sm md-down:text-xs md-down:mb-1 sm-down:text-xs xs-down:text-[11px] xs-down:mb-1">
              {t('form.gender', { defaultValue: 'Giới tính' })}
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 xl-down:px-3 xl-down:py-2 lg-down:px-3 lg-down:py-2 md-down:px-2.5 md-down:py-2 md-down:text-sm sm-down:px-2.5 sm-down:py-1.5 sm-down:text-xs xs-down:px-2.5 xs-down:py-1.5 xs-down:text-xs"
            >
              <option value="unspecified">{t('form.gender.unspecified', { defaultValue: 'Không tiết lộ' })}</option>
              <option value="male">{t('form.gender.male', { defaultValue: 'Nam' })}</option>
              <option value="female">{t('form.gender.female', { defaultValue: 'Nữ' })}</option>
              <option value="other">{t('form.gender.other', { defaultValue: 'Khác' })}</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6 xl-down:mt-5 lg-down:mt-5 md-down:mt-5 sm-down:mt-4 xs-down:mt-4 xs-down:flex-col xs-down:gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white disabled:opacity-50 xl-down:px-4 xl-down:py-2 lg-down:px-4 lg-down:py-2 md-down:px-3.5 md-down:py-1.5 md-down:text-sm sm-down:px-3 sm-down:py-1.5 sm-down:text-xs xs-down:w-full xs-down:text-sm"
          >
            {t('actions.cancel', { defaultValue: 'Hủy' })}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !name.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 xl-down:px-4 xl-down:py-2 lg-down:px-4 lg-down:py-2 md-down:px-3.5 md-down:py-1.5 md-down:text-sm sm-down:px-3 sm-down:py-1.5 sm-down:text-xs xs-down:w-full xs-down:text-sm"
          >
            {t('form.save', { defaultValue: 'Lưu' })}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
