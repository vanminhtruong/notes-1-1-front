import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { getProfile } from '@/store/slices/authSlice';
import { Mail, User, ArrowLeft, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import EditProfileModal from './EditProfileModal';
import LazyLoad from '@/components/LazyLoad';

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
      <section className="max-w-3xl mx-auto px-4 py-10 xl-down:py-9 lg-down:py-8 md-down:py-7 sm-down:py-6 xs-down:py-5 xl-down:px-3.5 lg-down:px-3 md-down:px-2.5 sm-down:px-2">
        <div className="rounded-2xl border border-white/20 dark:border-gray-700/30 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl overflow-hidden lg-down:rounded-xl md-down:rounded-lg">
          <div className="px-6 py-5 border-b border-white/20 dark:border-gray-700/30 bg-gradient-to-r from-gray-50/70 to-white/50 dark:from-gray-800/60 dark:to-gray-800/40 lg-down:px-5 lg-down:py-4 md-down:px-4 md-down:py-3.5 sm-down:px-3.5 sm-down:py-3 xs-down:px-3 xs-down:py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm-down:gap-2.5 xs-down:gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 lg-down:p-1.5 sm-down:p-1"
                  aria-label={t('back', { defaultValue: 'Quay lại' })}
                  title={t('backToHome', { defaultValue: 'Về trang chính' })}
                >
                  <ArrowLeft className="w-5 h-5 lg-down:w-4 lg-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 lg-down:text-base md-down:text-sm sm-down:gap-1.5">
                  <User className="w-5 h-5 lg-down:w-4 lg-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
                  {t('title')}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 lg-down:px-2.5 lg-down:py-1.5 lg-down:text-sm md-down:px-2 md-down:py-1 md-down:text-xs sm-down:gap-1.5"
              >
                <Pencil className="w-4 h-4 lg-down:w-3.5 lg-down:h-3.5 sm-down:w-3 sm-down:h-3" />
                {t('edit', { defaultValue: 'Chỉnh sửa' })}
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 lg-down:text-xs sm-down:text-xs">{t('description')}</p>
          </div>

          <div className="p-6 space-y-6 lg-down:p-5 lg-down:space-y-5 md-down:p-4 md-down:space-y-4 sm-down:p-3.5 sm-down:space-y-3.5 xs-down:p-3 xs-down:space-y-3">
            {/* Avatar display */}
            <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={0} reAnimate={true}>
              <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 md-down:text-xs">{t('avatar.label')}</label>
              <div className="flex items-center gap-4 sm-down:gap-3 xs-down:gap-2.5">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="w-20 h-20 rounded-full object-cover border border-gray-300 dark:border-gray-700 cursor-zoom-in lg-down:w-18 lg-down:h-18 md-down:w-16 md-down:h-16 sm-down:w-14 sm-down:h-14 xs-down:w-12 xs-down:h-12"
                    onClick={() => setPreviewOpen(true)}
                    title={t('avatar.preview', { defaultValue: 'Xem ảnh lớn' })}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 border border-gray-300 dark:border-gray-700 lg-down:w-18 lg-down:h-18 md-down:w-16 md-down:h-16 sm-down:w-14 sm-down:h-14 xs-down:w-12 xs-down:h-12">
                    <User className="w-8 h-8 lg-down:w-7 lg-down:h-7 md-down:w-6 md-down:h-6 sm-down:w-5 sm-down:h-5 xs-down:w-4 xs-down:h-4" />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 sm-down:text-[11px] xs-down:text-[10px]">{t('avatar.info')}</p>
            </div>
            </LazyLoad>

            {/* Info grid */}
            <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={100} reAnimate={true}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg-down:gap-5 md-down:gap-4 sm-down:gap-3.5">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 md-down:text-xs">{t('form.name')}</label>
                <div className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 lg-down:px-2.5 lg-down:py-1.5 md-down:text-sm sm-down:text-xs">
                  {user?.name || '-'}
                </div>
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 md-down:text-xs">{t('form.email')}</label>
                <div className="relative">
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100/80 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none cursor-not-allowed lg-down:pl-8 lg-down:px-2.5 lg-down:py-1.5 md-down:text-sm sm-down:pl-7 sm-down:text-xs"
                  />
                  <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 lg-down:w-3.5 lg-down:h-3.5 sm-down:w-3 sm-down:h-3" />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm-down:text-[11px] xs-down:text-[10px]">{t('form.emailNote')}</p>
              </div>
            </div>
            </LazyLoad>

            <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={200} reAnimate={true}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg-down:gap-5 md-down:gap-4 sm-down:gap-3.5 md-down:grid-cols-1">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 md-down:text-xs">{t('form.phone', { defaultValue: 'Số điện thoại' })}</label>
                <div className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 lg-down:px-2.5 lg-down:py-1.5 md-down:text-sm sm-down:text-xs">
                  {user?.phone || '-'}
                </div>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 md-down:text-xs">{t('form.birthDate', { defaultValue: 'Ngày sinh' })}</label>
                <div className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 lg-down:px-2.5 lg-down:py-1.5 md-down:text-sm sm-down:text-xs">
                  {user?.birthDate || '-'}
                </div>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 md-down:text-xs">{t('form.gender', { defaultValue: 'Giới tính' })}</label>
                <div className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 lg-down:px-2.5 lg-down:py-1.5 md-down:text-sm sm-down:text-xs">
                  {user?.gender ? t(`form.gender.${user.gender}` as any, { defaultValue: user.gender }) : t('form.gender.unspecified', { defaultValue: 'Không tiết lộ' })}
                </div>
              </div>
            </div>
            </LazyLoad>
          </div>
        </div>

        {/* Image Preview Modal */}
        {previewOpen && user?.avatar && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 lg-down:p-3 md-down:p-2.5 sm-down:p-2"
            role="dialog"
            aria-modal="true"
            onClick={() => setPreviewOpen(false)}
          >
            <div className="relative max-w-[95vw] max-h-[95vh] sm-down:max-w-[90vw] sm-down:max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <button
                className="absolute -top-3 -right-3 bg-white text-gray-800 rounded-full w-8 h-8 flex items-center justify-center shadow hover:bg-gray-100 lg-down:w-7 lg-down:h-7 sm-down:w-6 sm-down:h-6 sm-down:-top-2 sm-down:-right-2"
                aria-label={t('avatar.closePreview', { defaultValue: 'Đóng' })}
                onClick={() => setPreviewOpen(false)}
              >
                ×
              </button>
              <img
                src={user.avatar}
                alt="avatar preview"
                className="object-contain max-w-[95vw] max-h-[95vh] rounded-lg shadow-2xl sm-down:max-w-[90vw] sm-down:max-h-[90vh] sm-down:rounded"
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
