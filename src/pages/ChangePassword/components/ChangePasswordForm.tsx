import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import LazyLoad from '@/components/LazyLoad'
import { useChangePasswordForm } from '../hooks/useChangePasswordForm'

export default function ChangePasswordForm() {
  const { t } = useTranslation(['dashboard', 'layout'])
  const { register, handleSubmit, errors, newPassword, onSubmit, isLoading,
    showCurrentPassword, setShowCurrentPassword, showNewPassword, setShowNewPassword,
    showConfirmPassword, setShowConfirmPassword } = useChangePasswordForm()

  return (
    <>
            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 lg-down:space-y-5 md-down:space-y-4 sm-down:space-y-3.5 xs-down:space-y-3">
              {/* Current Password */}
              <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={0} reAnimate={true}>
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 md-down:text-xs sm-down:mb-1.5">
                  {t('auth.changePassword.currentPassword')}
                </label>
                <div className="relative">
                  <input
                    {...register('currentPassword', {
                      required: t('auth.changePassword.errors.currentRequired'),
                    })}
                    type={showCurrentPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all lg-down:py-2.5 lg-down:px-3.5 md-down:text-sm md-down:rounded-lg sm-down:py-2 sm-down:px-3 sm-down:text-xs xs-down:rounded-lg"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors sm-down:right-2.5"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5 lg-down:w-4 lg-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
                    ) : (
                      <Eye className="w-5 h-5 lg-down:w-4 lg-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 md-down:text-xs">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>
              </LazyLoad>

              {/* New Password */}
              <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={100} reAnimate={true}>
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 md-down:text-xs sm-down:mb-1.5">
                  {t('auth.changePassword.newPassword')}
                </label>
                <div className="relative">
                  <input
                    {...register('newPassword', {
                      required: t('auth.changePassword.errors.newRequired'),
                      minLength: {
                        value: 6,
                        message: t('auth.changePassword.errors.minLength'),
                      },
                    })}
                    type={showNewPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all lg-down:py-2.5 lg-down:px-3.5 md-down:text-sm md-down:rounded-lg sm-down:py-2 sm-down:px-3 sm-down:text-xs xs-down:rounded-lg"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors sm-down:right-2.5"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5 lg-down:w-4 lg-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
                    ) : (
                      <Eye className="w-5 h-5 lg-down:w-4 lg-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 md-down:text-xs">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>
              </LazyLoad>

              {/* Confirm Password */}
              <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={200} reAnimate={true}>
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 md-down:text-xs sm-down:mb-1.5">
                  {t('auth.changePassword.confirmPassword')}
                </label>
                <div className="relative">
                  <input
                    {...register('confirmPassword', {
                      required: t('auth.changePassword.errors.confirmRequired'),
                      validate: (value) =>
                        value === newPassword || t('auth.changePassword.errors.passwordMismatch'),
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all lg-down:py-2.5 lg-down:px-3.5 md-down:text-sm md-down:rounded-lg sm-down:py-2 sm-down:px-3 sm-down:text-xs xs-down:rounded-lg"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors sm-down:right-2.5"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5 lg-down:w-4 lg-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
                    ) : (
                      <Eye className="w-5 h-5 lg-down:w-4 lg-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 md-down:text-xs">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
              </LazyLoad>

              {/* Submit Button */}
              <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={300} reAnimate={true}>
                <div className="flex gap-3 pt-4 lg-down:gap-2.5 md-down:pt-3 sm-down:gap-2 xs-down:pt-2.5">
                <Link
                  to="/account"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center lg-down:py-2.5 lg-down:px-3.5 md-down:text-sm md-down:rounded-lg sm-down:py-2 sm-down:px-3 sm-down:text-xs xs-down:rounded-lg"
                >
                  {t('auth.changePassword.cancel')}
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed lg-down:py-2.5 lg-down:px-3.5 md-down:text-sm md-down:rounded-lg sm-down:py-2 sm-down:px-3 sm-down:text-xs xs-down:rounded-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2 sm-down:gap-1.5">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin lg-down:w-3.5 lg-down:h-3.5 sm-down:w-3 sm-down:h-3" />
                      <span>{t('auth.changePassword.submit')}</span>
                    </div>
                  ) : (
                    t('auth.changePassword.submit')
                  )}
                </button>
              </div>
              </LazyLoad>
            </form>
    </>
  )
}
