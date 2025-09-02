import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { getProfile, updateProfile } from '@/store/slices/authSlice';
import { Mail, User, Save, ArrowLeft } from 'lucide-react';
import { uploadService } from '@/services/uploadService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function Account() {
  const { t } = useTranslation('account');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated } = useAppSelector((s) => s.auth);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [phone, setPhone] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>(''); // YYYY-MM-DD
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'unspecified'>('unspecified');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(getProfile());
    }
  }, [dispatch, isAuthenticated, user]);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  useEffect(() => {
    if (user?.avatar) setAvatar(user.avatar);
  }, [user?.avatar]);

  useEffect(() => {
    if (user) {
      setPhone(user.phone ?? '');
      setBirthDate(user.birthDate ?? '');
      setGender((user.gender as any) ?? 'unspecified');
    }
  }, [user]);

  // Close preview on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await dispatch(updateProfile({
      name,
      avatar: avatar ?? '',
      phone: phone.trim() ? phone.trim() : null,
      birthDate: birthDate || null,
      gender,
    }));
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('avatar.maxSizeError'));
      e.target.value = '';
      return;
    }
    setUploading(true);
    try {
      const { url } = await uploadService.uploadImage(file);
      setAvatar(url);
    } catch (err) {
      toast.error(t('avatar.uploadError'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="rounded-2xl border border-white/20 dark:border-gray-700/30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/20 dark:border-gray-700/30 bg-gradient-to-r from-gray-50/70 to-white/50 dark:from-gray-800/60 dark:to-gray-900/60">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
              aria-label={t('back', { defaultValue: 'Quay lại' })}
              title={t('backToHome', { defaultValue: 'Về trang chính' })}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5" />
              {t('title')}
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{t('description')}</p>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('avatar.label')}</label>
            <div className="flex items-center gap-4">
              {avatar ? (
                <img
                  src={avatar}
                  alt="avatar"
                  className="w-20 h-20 rounded-full object-cover border border-gray-300 dark:border-gray-700 cursor-zoom-in"
                  onClick={() => setPreviewOpen(true)}
                  title={t('avatar.preview', { defaultValue: 'Xem ảnh lớn' })}
                />)
                : (
                <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
                  <User className="w-8 h-8" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || isLoading}
                  className="px-3 py-2 rounded-lg bg-gray-800 text-white dark:bg-gray-700 hover:bg-gray-900 disabled:opacity-60"
                >
                  {uploading ? t('avatar.uploading') : t('avatar.upload')}
                </button>
                {avatar !== undefined && avatar !== '' && (
                  <button
                    type="button"
                    onClick={() => setAvatar('')}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {t('avatar.remove')}
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onAvatarChange}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('avatar.info')}</p>
          </div>
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
                  value={user?.email || ''}
                  readOnly
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100/80 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('form.emailNote')}</p>
            </div>
          </div>

          {/* New fields: Phone, Birth Date, Gender */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/60 text-white shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              {t('form.save')}
            </button>
          </div>
        </form>
      </div>

      {/* Image Preview Modal */}
      {previewOpen && avatar && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewOpen(false)}
        >
          <div className="relative max-w-[95vw] max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute -top-3 -right-3 bg-white text-gray-800 rounded-full w-8 h-8 flex items-center justify-center shadow hover:bg-gray-100"
              aria-label={t('avatar.closePreview', { defaultValue: 'Đóng' })}
              onClick={() => setPreviewOpen(false)}
            >
              ×
            </button>
            <img
              src={avatar}
              alt="avatar preview"
              className="object-contain max-w-[95vw] max-h-[95vh] rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
