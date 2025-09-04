import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { getProfile } from '@/store/slices/authSlice';
import { Mail, User, ArrowLeft, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import EditProfileModal from './EditProfileModal';

export default function Account() {
  const { t } = useTranslation('account');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(getProfile());
    }
  }, [dispatch, isAuthenticated, user]);

  

  // Close preview on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900/60 dark:to-gray-800 min-h-screen">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-white/20 dark:border-gray-700/30 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/20 dark:border-gray-700/30 bg-gradient-to-r from-gray-50/70 to-white/50 dark:from-gray-800/60 dark:to-gray-800/40">
            <div className="flex items-center justify-between">
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
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Pencil className="w-4 h-4" />
                {t('edit', { defaultValue: 'Chỉnh sửa' })}
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{t('description')}</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Avatar display */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('avatar.label')}</label>
              <div className="flex items-center gap-4">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="w-20 h-20 rounded-full object-cover border border-gray-300 dark:border-gray-700 cursor-zoom-in"
                    onClick={() => setPreviewOpen(true)}
                    title={t('avatar.preview', { defaultValue: 'Xem ảnh lớn' })}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
                    <User className="w-8 h-8" />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('avatar.info')}</p>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('form.name')}</label>
                <div className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100">
                  {user?.name || '-'}
                </div>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('form.phone', { defaultValue: 'Số điện thoại' })}</label>
                <div className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100">
                  {user?.phone || '-'}
                </div>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('form.birthDate', { defaultValue: 'Ngày sinh' })}</label>
                <div className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100">
                  {user?.birthDate || '-'}
                </div>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('form.gender', { defaultValue: 'Giới tính' })}</label>
                <div className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100">
                  {user?.gender ? t(`form.gender.${user.gender}` as any, { defaultValue: user.gender }) : t('form.gender.unspecified', { defaultValue: 'Không tiết lộ' })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Preview Modal */}
        {previewOpen && user?.avatar && (
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
                src={user.avatar}
                alt="avatar preview"
                className="object-contain max-w-[95vw] max-h-[95vh] rounded-lg shadow-2xl"
              />
            </div>
          </div>
        )}
        {/* Edit Profile Modal */}
        <EditProfileModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          initial={{
            name: user?.name ?? '',
            email: user?.email ?? '',
            avatar: user?.avatar || null,
            phone: user?.phone ?? '',
            birthDate: user?.birthDate ?? '',
            gender: (user?.gender as any) ?? 'unspecified',
          }}
        />
      </section>
    </div>
  );
}
